<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-header bg-info text-white">
        <h4>Detail Pasien</h4>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-info" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data pasien...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>
        
        <div v-else>
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h5 class="mb-0">Informasi Pribadi</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nama Lengkap:</label>
                    <p>{{ pasien.name }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Tanggal Lahir:</label>
                    <p>{{ formatDate(pasien.tanggal_lahir) }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Usia:</label>
                    <p>{{ pasien.usia }} tahun</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Nomor Telepon:</label>
                    <p>+62{{ pasien.no_telp }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Gender:</label>
                    <p>
                      <span 
                        :class="[
                          'badge',
                          pasien.gender === 'laki-laki' ? 'bg-primary' : 'bg-info'
                        ]"
                      >
                        {{ capitalizeFirst(pasien.gender) }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h5 class="mb-0">Informasi Medis</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label fw-bold">No Rekam Medis:</label>
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        :value="pasien.kode_akses || 'Tidak tersedia'" 
                        readonly
                        ref="kodeAksesInput"
                      />
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button" 
                        @click="copyToClipboard('kodeAksesInput')"
                        v-if="pasien.kode_akses"
                      >
                        <i class="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h5 class="mb-0">Informasi Tambahan</h5>
                </div>
                <div class="card-body">
                  <p>Password tidak bisa diubah pada form ini.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-between mt-4">
          <button type="button" class="btn btn-secondary" @click="$router.push('/pasien')">
            <i class="bi bi-arrow-left me-1"></i> Kembali
          </button>
          
          <div v-if="pasien && pasien.id">
            <router-link 
              :to="`/pasien/edit/${pasien.id}`" 
              class="btn btn-warning"
            >
              <i class="bi bi-pencil me-1"></i> Edit
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hidden div for printing -->
    <div id="printArea" class="d-none">
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 20px;">Informasi Pasien</h2>
        <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
          <h4>Pasien: {{ pasien && pasien.name ? pasien.name : '' }}</h4>
          <p><strong>No Rekam Medis:</strong> {{ pasien && pasien.kode_akses ? pasien.kode_akses : '-' }}</p>
          <p><strong>Tanggal Lahir:</strong> {{ pasien && pasien.tanggal_lahir ? formatDate(pasien.tanggal_lahir) : '-' }}</p>
          <p><strong>Usia:</strong> {{ pasien && pasien.usia ? pasien.usia + ' tahun' : '-' }}</p>
          <p><strong>Nomor Telepon:</strong> {{ pasien && pasien.no_telp ? '+62' + pasien.no_telp : '-' }}</p>
          <p><strong>Gender:</strong> {{ pasien && pasien.gender ? capitalizeFirst(pasien.gender) : '-' }}</p>
        </div>
        <div style="border: 2px dashed #dc3545; padding: 15px; background-color: #f8f9fa;" v-if="showPassword">
          <p><strong>No Rekam Medis:</strong> {{ pasien && pasien.kode_akses ? pasien.kode_akses : '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'ViewPasien',
  data() {
    return {
      pasien: {},
      loading: true,
      error: null,
      showPassword: false,
      password: '',
    };
  },
  watch: {
    '$route.params.id': function(newId) {
      if (newId) {
        this.fetchPasien();
      } else {
        this.error = 'ID pasien tidak ditemukan pada URL';
        this.loading = false;
      }
    }
  },
  created() {
    if (this.$route.params.id) {
      this.fetchPasien();
    } else {
      this.error = 'ID pasien tidak ditemukan pada URL';
      this.loading = false;
    }
    
    // Check if viewing after creation (with password)
    if (this.$route.query && this.$route.query.password) {
      this.showPassword = true;
      this.password = this.$route.query.password;
    }
  },
  methods: {
    getAuthToken() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error('Token autentikasi tidak ditemukan');
      }
      return token;
    },
    
    async fetchPasien() {
      this.loading = true;
      this.error = null;
      
      try {
        if (!this.$route.params.id) {
          throw new Error('ID pasien tidak ditemukan pada URL');
        }
        
        const pasienId = this.$route.params.id;
        const token = this.getAuthToken();
        
        const response = await api.get(`users/${pasienId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          this.pasien = response.data;
        } else {
          throw new Error('Format response tidak sesuai');
        }
      } catch (err) {
        console.error('Error saat memuat detail pasien:', err);
        
        if (err.response) {
          if (err.response.status === 401) {
            this.error = 'Sesi login Anda telah berakhir. Silakan login kembali.';
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
          } else if (err.response.status === 404) {
            this.error = 'Pasien tidak ditemukan. ID pasien mungkin tidak valid.';
          } else {
            this.error = err.response.data?.message || 
                        'Terjadi kesalahan saat memuat data pasien';
          }
        } else {
          this.error = err.message || 'Terjadi kesalahan saat memuat data pasien';
        }
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    },
    
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '-';
      
      try {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateTimeString;
      }
    },
    
    capitalizeFirst(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    copyToClipboard(refName) {
      try {
        const input = this.$refs[refName];
        input.select();
        document.execCommand('copy');
        
        const button = input.nextElementSibling;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check-lg"></i>';
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-secondary');
        
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('btn-success');
          button.classList.add('btn-outline-secondary');
        }, 1500);
      } catch (err) {
        console.error('Error saat menyalin ke clipboard:', err);
      }
    },
    
    printCredentials() {
      const printContent = document.getElementById('printArea').innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
    }
  }
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  margin-bottom: 16px;
}

.card-header {
  border-radius: 8px 8px 0 0;
}

.form-control:focus, .input-group-text {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn {
  border-radius: 5px;
  padding: 8px 16px;
}

.badge {
  font-weight: 500;
  padding: 0.5em 0.75em;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printArea, #printArea * {
    visibility: visible;
  }
  #printArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>