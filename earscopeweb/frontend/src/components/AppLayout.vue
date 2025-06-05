<template>
  <div class="d-flex">
    <!-- Mobile Hamburger Button -->
    <button 
      class="hamburger-btn d-md-none" 
      @click="toggleSidebar"
      :class="{ active: sidebarOpen }"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Sidebar Overlay (Mobile Only) -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay d-md-none" 
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <div 
      class="sidebar bg-primary p-3 text-white"
      :class="{ 'sidebar-open': sidebarOpen }"
    >
      <div class="sidebar-header mb-4">
        <div class="text-center">
          <img src="@/assets/earscope.png" alt="Hospital Logo" class="sidebar-logo" />
        </div>
      </div>

      <ul class="nav flex-column">
        <!-- Dashboard (Semua Role Bisa Akses) -->
        <li class="nav-item mb-2">
          <router-link 
            to="/dashboard" 
            class="nav-link text-white d-flex align-items-center"
            :class="{ 'active-menu': activePage === 'dashboard' }"
            @click="closeSidebar"
          >
            <i class="bi bi-house me-3"></i>
            <span>Dashboard</span>
          </router-link>
        </li>

        <!-- Admin hanya melihat menu Dokter -->
        <li v-if="currentUser.role === 'admin'" class="nav-item mb-2">
          <router-link 
            to="/dokter" 
            class="nav-link text-white d-flex align-items-center"
            :class="{ 'active-menu': activePage === 'dokterresource' || activePage === 'dokter' }"
            @click="closeSidebar"
          >
            <i class="bi bi-person-badge me-3"></i>
            <span>Dokter</span>
          </router-link>
        </li>

        <!-- Dokter hanya melihat menu Pasien -->
        <li v-if="currentUser.role === 'dokter'" class="nav-item mb-2">
          <router-link 
            to="/pasien" 
            class="nav-link text-white d-flex align-items-center"
            :class="{ 'active-menu': activePage === 'pasienresource' || activePage === 'pasien' }"
            @click="closeSidebar"
          >
            <i class="bi bi-people me-3"></i>
            <span>Pasien</span>
          </router-link>
        </li>

        <!-- Dokter & Pasien bisa melihat menu Hasil Pemeriksaan -->
        <li v-if="currentUser.role === 'dokter' || currentUser.role === 'pasien'" class="nav-item mb-2">
          <router-link 
            to="/pemeriksaan" 
            class="nav-link text-white d-flex align-items-center"
            :class="{ 'active-menu': activePage === 'pemeriksaan' }"
            @click="closeSidebar"
          >
            <i class="bi bi-clipboard2-pulse me-3"></i>
            <span>Hasil Pemeriksaan</span>
          </router-link>
        </li>
      </ul>

      <div class="mt-auto pt-4">
        <hr class="border-light" />
        <ul class="nav flex-column">
          <li class="nav-item">
            <a href="#" @click.prevent="logout" class="nav-link text-white d-flex align-items-center">
              <i class="bi bi-box-arrow-right me-3"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-area">
      <div class="container-fluid p-4">
        <!-- Page Header -->
        <div class="page-header mb-4 d-flex justify-content-between align-items-center">
          <h2>{{ pageTitle }}</h2>
          <div>
            <div class="dropdown">
              <button class="btn btn-light dropdown-toggle d-flex align-items-center" type="button" id="dropdownMenuButton"
                data-bs-toggle="dropdown" aria-expanded="false">
                <div class="user-info text-start">
                  <span class="kode-akses">{{ currentUser.kode_akses }}</span>
                  <span class="role">{{ currentUser.role }}</span>
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout"><i
                      class="bi bi-box-arrow-right me-2"></i>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Main Content Goes Here -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

export default {
  name: "AppLayout",
  props: {
    activePage: {
      type: String,
      default: "dashboard",
    },
  },
  data() {
    return {
      currentUser: {
        kode_akses: "",
        role: "",
      },
      pageTitle: "Dashboard",
      sidebarOpen: false, // State untuk mobile sidebar
    };
  },
  created() {
    this.getCurrentUser();
  },
  watch: {
    activePage: {
      immediate: true,
      handler(newVal) {
        this.updatePageTitle(newVal);
      },
    },
  },
  methods: {
    getCurrentUser() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        try {
          // Decode JWT tanpa verifikasi
          const payload = jwtDecode(token);

          // Ambil `kode_akses` dari payload
          this.currentUser.kode_akses = payload.kode_akses || "Tidak Ada Akses";
          this.currentUser.role = payload.role || "Tidak Ada Role";
        } catch (error) {
          console.error("Gagal decode JWT:", error);
          this.currentUser.kode_akses = "JWT Tidak Valid";
        }
      } else {
        this.currentUser.kode_akses = "Token Tidak Ditemukan";
      }
    },

    updatePageTitle(page) {
      const titles = {
        dashboard: "Dashboard",
        dokterresource: "Kelola Dokter",
        pasienresource: "Kelola Pasien",
        pemeriksaan: "Hasil Pemeriksaan",
      };
      this.pageTitle = titles[page] || "Dashboard";
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    closeSidebar() {
      this.sidebarOpen = false;
    },

    logout() {
      console.log("Logging out...");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      this.closeSidebar(); // Tutup sidebar saat logout
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.kode-akses {
  display: block;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

.role {
  display: block;
  font-size: 0.85rem;
  color: #777;
  margin-top: -3px;
}

/* Hamburger Button Styles */
.hamburger-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #004178;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.hamburger-btn span {
  display: block;
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  background-color: #004178 !important;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.content-area {
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
  background-color: #f8f9fa;
  transition: margin-left 0.3s ease;
}

/* Enhanced Menu Styling */
.nav-link {
  border-radius: 8px;
  padding: 12px 15px;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  position: relative;
  overflow: hidden;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

/* Active Menu Styling - Sesuai dengan gambar yang diberikan */
.nav-link.active-menu {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transform: translateX(5px);
  position: relative;
}

.nav-link.active-menu::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #ffffff;
  border-radius: 0 4px 4px 0;
}

/* Icon styling untuk menu aktif */
.nav-link.active-menu i {
  color: white !important;
  font-weight: bold;
}

/* Glow effect untuk menu aktif */
.nav-link.active-menu {
  box-shadow: 
    0 4px 15px rgba(37, 99, 235, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Pulse animation untuk menu aktif */
@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  }
  50% {
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
  }
  100% {
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  }
}

.nav-link.active-menu {
  animation: pulse 2s infinite;
}

.sidebar-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.page-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.sidebar-logo {
  width: 150px;
  height: auto;
}

/* Mobile Responsive Styles */
@media (max-width: 767.98px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 1000;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .sidebar-logo {
    width: 120px;
  }

  .page-header {
    padding-left: 80px; /* Space for hamburger button */
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  /* Mobile menu aktif styling */
  .nav-link.active-menu {
    transform: translateX(0);
  }
}

/* Tablet and larger screens */
@media (min-width: 768px) {
  .hamburger-btn {
    display: none !important;
  }
  
  .sidebar-overlay {
    display: none !important;
  }
}

/* Large screens adjustments */
@media (min-width: 992px) {
  .sidebar-logo {
    width: 150px;
  }
}

/* Smooth transitions for all menu items */
.nav-item {
  transition: all 0.3s ease;
}

/* Logout button styling */
.nav-link:last-child:hover {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545 !important;
}
</style>