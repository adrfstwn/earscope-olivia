import axios from "axios";
import router from "@/router";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // Batas waktu request 5 detik
});

// Interceptor untuk menangani error dari API
api.interceptors.response.use(
  response => response, 
  error => {
    if (error.response) {
      const status = error.response.status;

      if (status === 403) {
        router.push('/forbidden'); // Redirect ke 403
      } else if (status >= 500) {
        router.push('/server-error'); // Redirect ke 500
      }
    }

    return Promise.reject(error);
  }
);

export default {
  getEndpoint(path) {
    return `${API_URL}/${path}`;
  },
  get(url, config) {
    return api.get(url, config);
  },
  post(url, data, config) {
    return api.post(url, data, config);
  },
  put(url, data, config) {
    return api.put(url, data, config);
  },
  delete(url, config) {
    return api.delete(url, config);
  }
};
