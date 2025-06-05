pipeline {
    agent any
    environment {
        IMAGE_TAG = "${env.BUILD_ID}"
        GIT_BRANCH = "main"
        DOCKER_IMAGE_NAME_BACKEND = "earscopeweb-backend"
        DOCKER_IMAGE_NAME_FRONTEND = "earscopeweb-frontend"
        NGINX_CONF_PATH = "/etc/nginx/conf/earscope-web.conf"

        // implement blue green deployment
        NEW_CONTAINER_SUFFIX = "-new"
        NEW_COMPOSE_FILE = "docker-compose-new.yml"
        HEALTH_CHECK_TIMEOUT = 60 // seconds

    }
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    sh """
                    echo "Cleaning workspace..."
                    rm -rf earscopeweb || true
                    """
                    withCredentials([usernamePassword(credentialsId: 'github-auth-to-jenkins', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                        sh """
                        echo "Cloning repository with authentication..."
                        git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/zahrasabill/earscopeweb.git -b ${GIT_BRANCH}
                        """
                    }
                }
            }
        }
        stage('Prepare .env File') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'earscopeweb-backend-env', variable: 'ENV_FILE')]) {
                        sh """
                        echo "Copying .env file..."
                        cp \${ENV_FILE} earscopeweb/backend/.env
                        """
                    }
                }
                script {
                    withCredentials([file(credentialsId: 'earscopeweb-frontend-env', variable: 'ENV_FILE')]) {
                        sh """
                        echo "Copying .env file..."
                        cp \${ENV_FILE} earscopeweb/frontend/.env
                        """
                    }
                }
            }
        }
        stage('Update Image Tags in docker-compose.yml') {
            steps {
                script {
                    sh """
                    echo "Updating docker-compose.yml with new image tag..."
                    
                    cd earscopeweb
                    
                    sed -i "s|image: earscopeweb-backend:latest|image: ${DOCKER_IMAGE_NAME_BACKEND}:${IMAGE_TAG}|" docker-compose.yml
                    sed -i "s|image: earscopeweb-frontend:latest|image: ${DOCKER_IMAGE_NAME_FRONTEND}:${IMAGE_TAG}|" docker-compose.yml
                    
                    echo "Final docker-compose.yml content:"
                    cat docker-compose.yml
                    """
                }
            }
        }
        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                    echo "Building Docker images..."
                    cd earscopeweb
                    docker compose build --no-cache --pull
                    """
                }
            }
        }
        stage('Stop Running Containers & Remove Old Images') {
            steps {
                script {
                    sh """
                    echo "Stopping running containers..."
                    
                    cd earscopeweb
                    
                    docker compose down || true
                    
                    echo "Checking and removing old backend and frontend images..."
                    
                    # Keep the new images we just built (with the current IMAGE_TAG)
                    OLD_BACKEND_IMAGES=\$(docker images ${DOCKER_IMAGE_NAME_BACKEND} --format "{{.ID}}" | grep -v \$(docker images ${DOCKER_IMAGE_NAME_BACKEND}:${IMAGE_TAG} --format "{{.ID}}") || true)
                    OLD_FRONTEND_IMAGES=\$(docker images ${DOCKER_IMAGE_NAME_FRONTEND} --format "{{.ID}}" | grep -v \$(docker images ${DOCKER_IMAGE_NAME_FRONTEND}:${IMAGE_TAG} --format "{{.ID}}") || true)

                    if [ ! -z "\$OLD_BACKEND_IMAGES" ]; then
                        echo "Deleting old backend images..."
                        docker rmi -f \$OLD_BACKEND_IMAGES || true
                    fi

                    if [ ! -z "\$OLD_FRONTEND_IMAGES" ]; then
                        echo "Deleting old frontend images..."
                        docker rmi -f \$OLD_FRONTEND_IMAGES || true
                    fi

                    # Remove dangling images only, not all unused images
                    docker image prune -f
                    
                    echo "Finished cleaning up old images."
                    """
                }
            }
        }
        stage('Deploy Docker Images to Container') {
            steps {
                script {
                    sh """
                    echo "Building Docker images..."
                    cd earscopeweb
                    echo "Deploying containers..."
                    docker compose up -d --force-recreate

                    echo "Checking running containers..."
                    docker ps -a

                    echo "Checking backend working directory..."
                    docker exec earscopeweb-backend pwd
                    docker exec earscopeweb-backend ls -al /app

                    echo "Checking frontend working directory..."
                    docker exec earscopeweb-frontend pwd
                    docker exec earscopeweb-frontend ls -al /usr/share/nginx/html
                    """
                }
            }
        }
        stage('Copy Nginx Config & Restart Nginx') {
            steps {
                script {
                        sh """
                        echo "Copying Nginx configuration..."
                        sudo cp earscopeweb/earscopeweb-frontend.conf /etc/nginx/conf/
                        sudo cp earscopeweb/earscopeweb-backend.conf /etc/nginx/conf/

                        echo "Restarting Nginx..."
                        docker restart nginx

                        echo "Nginx configuration updated successfully!"
                        """
                }
            }
        }
    }
    post {
        success {
            echo "Pipeline build completed successfully!"
        }
        failure {
            echo "Pipeline build failed!"
        }
    }
}
