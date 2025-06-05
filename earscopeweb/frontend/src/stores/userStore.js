import { defineStore } from "pinia";
import axios from "axios";
import api from "@/api";

export const useUserStore = defineStore('user', {
    state: () => ({
      users: [],
    }),
    actions: {
      async fetchUsers() {
        try {
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const response = await axios.get(api.getEndpoint(`pasien`), {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.users = response.data;
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      },
    },
  });