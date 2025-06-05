<template>
  <div class="login-container">
    <div class="left-panel">
      <div class="logo-container">
        <img :src="logo" alt="OIDO" class="logo" />
      </div>
    </div>
    <div class="right-panel">
      <div class="login-form-container">
        <h2 class="welcome-title">Selamat Datang!</h2>
        <p class="instruction-text">
          Silahkan masukkan Kode Akses dan Password Anda!
        </p>
        <form @submit.prevent="login">
          <div class="form-group mb-3">
            <label for="kode_akses" class="form-label">Kode Akses</label>
            <input
              type="text"
              v-model="kode_akses"
              class="form-control"
              id="kode_akses"
              placeholder="Masukkan Kode Akses Anda"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                class="form-control"
                id="password"
                placeholder="Masukkan Password Anda"
                required
              />
              <i 
                class="bi" 
                :class="showPassword ? 'bi-eye-slash' : 'bi-eye'" 
                @click="togglePasswordVisibility"
                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"
              ></i>
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="form-check">
              <input 
                type="checkbox" 
                v-model="rememberMe" 
                class="form-check-input" 
                id="rememberMe"
              />
              <label class="form-check-label" for="rememberMe">
                Ingat Saya
              </label>
            </div>
          </div>
          <button type="submit" class="btn btn-login w-100" :disabled="loading">
            {{ loading ? 'MEMPROSES...' : 'MASUK' }}
          </button>
          <div v-if="error" class="error-message mt-2">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import logoImage from "@/assets/earscope.png";
import axios from "axios";
import api from "@/api.js";

export default {
  data() {
    return {
      kode_akses: "",
      password: "",
      showPassword: false,
      rememberMe: false,
      logo: logoImage,
      loading: false,
      error: null,
    };
  },
  created() {
    this.checkExistingToken();
  },
  methods: {
    async checkExistingToken() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const expiry = localStorage.getItem('expiry') || sessionStorage.getItem('expiry');
      
      if (token && expiry) {
        const now = Math.floor(Date.now() / 1000);
        if (now < expiry) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          this.$router.push('/dashboard');
        } else {
          this.logout();
        }
      }
    },

    async login() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(api.getEndpoint("login"), {
          kode_akses: this.kode_akses,
          password: this.password,
        });

        const token = response.data.access_token;
        const expiry = response.data.expires_in; // Perbaiki dari expires_in ke expiry

        if (this.rememberMe) {
          localStorage.setItem('token', token);
          localStorage.setItem('expiry', expiry);
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('expiry', expiry);
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        this.error = error.response?.data?.error || 'Login gagal. Silakan coba lagi.';
      } finally {
        this.loading = false;
      }
      //console.log(axios.defaults.headers.common['Authorization']);
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('expiry');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('expiry');
      delete axios.defaults.headers.common['Authorization'];
      this.$router.push('/login');
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  },
};
</script>


<style scoped>
/* Import Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css");

.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.left-panel {
  flex: 0 0 45%;
  background-color: #004178;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-panel::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 80px;
  background-color: #4DCDC8;
  z-index: 1;
}

.left-panel::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 120px;
  background-color: #B9EF89;
  z-index: 0;
}

.logo-container {
  position: relative;
  z-index: 2;
  margin-right: 100px;
}

.logo {
  width: 180px;
  height: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-form-container {
  width: 400px;
  max-width: 100%;
  padding: 20px 30px;
}

.welcome-title {
  color: #004178;
  font-weight: 600;
  font-size: 24px;
  margin-bottom: 10px;
  text-align: left;
}

.instruction-text {
  color: #555;
  font-size: 14px;
  margin-bottom: 30px;
  text-align: left;
}

.form-label {
  display: block;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  text-align: left;
}

.form-control {
  width: 100%;
  height: 45px;
  padding: 8px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8f9fa;
}

.input-wrapper {
  position: relative;
}

.form-control::placeholder {
  color: #aaa;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-right: 8px;
}

.form-check-label {
  font-size: 14px;
  color: #555;
}

.btn-login {
  background-color: #0099ff;
  border: none;
  color: white;
  height: 45px;
  font-weight: 500;
  border-radius: 6px;
  margin-top: 10px;
}

.btn-login:hover {
  background-color: #0088ee;
}

.btn-login:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  text-align: center;
}

.register-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #555;
}

.register-text {
  color: #0099ff;
  text-decoration: none;
  font-weight: 500;
}

.register-text:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .left-panel {
    flex: 0 0 40%;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .left-panel {
    flex: 0 0 200px;
  }
  
  .left-panel::before,
  .left-panel::after {
    width: 100%;
    height: 30px;
    top: auto;
    bottom: 0;
  }
  
  .logo-container {
    margin-right: 0;
    margin-bottom: 60px;
  }
}
</style>