<template>
  <app-layout activePage="dashboard">
    <!-- Welcome Card -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card bg-gradient-primary text-white shadow-lg">
          <div class="card-body py-4">
            <div class="text-center">
              <h3 class="mb-3">Selamat Datang!</h3>
              <h4 class="mb-1 text-white-50">{{ currentUser.kode_akses }}</h4>
              <p class="mb-0 text-white-75">{{ getUserRoleDisplay(currentUser.role) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="row">
          <!-- Quick Actions untuk Admin -->
          <div v-if="currentUser.role === 'admin'" class="col-md-6 mb-3">
            <router-link to="/dokter" class="btn btn-outline-success btn-lg w-100 d-flex align-items-center justify-content-center">
              <i class="bi bi-person-plus me-2"></i>
              Kelola Dokter
            </router-link>
          </div>

          <!-- Quick Actions untuk Dokter -->
          <div v-if="currentUser.role === 'dokter'" class="col-md-6 mb-3">
            <router-link to="/pasien" class="btn btn-outline-primary btn-lg w-100 d-flex align-items-center justify-content-center">
              <i class="bi bi-people me-2"></i>
              Kelola Pasien
            </router-link>
          </div>

          <!-- Quick Actions untuk Dokter dan Pasien -->
          <div v-if="currentUser.role === 'dokter' || currentUser.role === 'pasien'" class="col-md-6 mb-3">
            <router-link to="/pemeriksaan" class="btn btn-outline-warning btn-lg w-100 d-flex align-items-center justify-content-center">
              <i class="bi bi-clipboard2-pulse me-2"></i>
              {{ currentUser.role === 'pasien' ? 'Lihat Hasil' : 'Hasil Pemeriksaan' }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from '@/components/AppLayout.vue';
import { jwtDecode } from "jwt-decode";

export default {
  name: "DashboardView",
  components: {
    AppLayout
  },
  data() {
    return {
      currentUser: {
        kode_akses: "",
        role: "",
      }
    };
  },
  created() {
    this.getCurrentUser();
  },
  methods: {
    getCurrentUser() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        try {
          // Decode JWT tanpa verifikasi
          const payload = jwtDecode(token);

          // Ambil `kode_akses` dan `role` dari payload
          this.currentUser.kode_akses = payload.kode_akses || "Tidak Ada Akses";
          this.currentUser.role = payload.role || "Tidak Ada Role";
        } catch (error) {
          console.error("Gagal decode JWT:", error);
          this.currentUser.kode_akses = "JWT Tidak Valid";
          this.currentUser.role = "unknown";
        }
      } else {
        this.currentUser.kode_akses = "Token Tidak Ditemukan";
        this.currentUser.role = "unknown";
      }
    },

    getUserRoleDisplay(role) {
      const roleMap = {
        'admin': 'Administrator',
        'dokter': 'Dokter',
        'pasien': 'Pasien'
      };
      return roleMap[role] || 'Pengguna';
    }
  }
};
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #004178 0%, #0056a3 100%);
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.8) !important;
}

.text-white-75 {
  color: rgba(255, 255, 255, 0.9) !important;
}

.card {
  border: none;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.btn-outline-success:hover,
.btn-outline-primary:hover,
.btn-outline-warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
}

@media (max-width: 768px) {
  .card-body h3 {
    font-size: 1.5rem;
  }
  
  .card-body h4 {
    font-size: 1.2rem;
  }
}
</style>