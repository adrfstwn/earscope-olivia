<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-header bg-warning text-white">
        <h4>Edit Pasien</h4>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data pasien...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>
        
        <form v-else @submit.prevent="updatePasien">
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h5 class="mb-0">Informasi Pribadi</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="name" class="form-label fw-bold">Nama Lengkap <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control"
                      :class="{ 'is-invalid': errors.name }"
                      id="name"
                      v-model="form.name"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                    <div v-if="errors.name" class="invalid-feedback">
                      {{ errors.name[0] }}
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="tanggal_lahir" class="form-label fw-bold">Tanggal Lahir <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      class="form-control"
                      :class="{ 'is-invalid': errors.tanggal_lahir }"
                      id="tanggal_lahir"
                      v-model="form.tanggal_lahir"
                      required
                    />
                    <div v-if="errors.tanggal_lahir" class="invalid-feedback">
                      {{ errors.tanggal_lahir[0] }}
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="usia" class="form-label fw-bold">Usia <span class="text-danger">*</span></label>
                    <input 
                      type="number" 
                      class="form-control"
                      :class="{ 'is-invalid': errors.usia }"
                      id="usia"
                      v-model="form.usia"
                      placeholder="Masukkan usia"
                      min="1"
                      max="150"
                      required
                    />
                    <div v-if="errors.usia" class="invalid-feedback">
                      {{ errors.usia[0] }}
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="no_telp" class="form-label fw-bold">Nomor Telepon <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">+62</span>
                      <input 
                        type="tel" 
                        class="form-control"
                        :class="{ 'is-invalid': errors.no_telp }"
                        id="no_telp"
                        v-model="form.no_telp"
                        placeholder="8xxxxxxxxxx"
                        pattern="[0-9]{8,15}"
                        required
                      />
                      <div v-if="errors.no_telp" class="invalid-feedback">
                        {{ errors.no_telp[0] }}
                      </div>
                    </div>
                    <small class="text-muted">Contoh: 81234567890</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="gender" class="form-label fw-bold">Gender <span class="text-danger">*</span></label>
                    <select 
                      class="form-select"
                      :class="{ 'is-invalid': errors.gender }"
                      id="gender"
                      v-model="form.gender"
                      required
                    >
                      <option value="">Pilih Gender</option>
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                    <div v-if="errors.gender" class="invalid-feedback">
                      {{ errors.gender[0] }}
                    </div>
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
                        class="form-control bg-light" 
                        :value="originalData.kode_akses || 'Tidak tersedia'" 
                        readonly
                      />
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button" 
                        @click="copyToClipboard"
                        v-if="originalData.kode_akses"
                      >
                        <i class="bi bi-clipboard"></i>
                      </button>
                    </div>
                    <small class="text-muted">No Rekam Medis tidak dapat diubah</small>
                  </div>
                </div>
              </div>
              
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h5 class="mb-0">Ubah Password (Opsional)</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="password" class="form-label fw-bold">Password Baru</label>
                    <input 
                      type="password" 
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      id="password"
                      v-model="form.password"
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                      minlength="6"
                    />
                    <div v-if="errors.password" class="invalid-feedback">
                      {{ errors.password[0] }}
                    </div>
                    <small class="text-muted">Minimal 6 karakter. Kosongkan jika tidak ingin mengubah.</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="password_confirmation" class="form-label fw-bold">Konfirmasi Password Baru</label>
                    <input 
                      type="password" 
                      class="form-control"
                      :class="{ 'is-invalid': errors.password_confirmation || (form.password && form.password !== form.password_confirmation) }"
                      id="password_confirmation"
                      v-model="form.password_confirmation"
                      placeholder="Ulangi password baru"
                      minlength="6"
                    />
                    <div v-if="errors.password_confirmation" class="invalid-feedback">
                      {{ errors.password_confirmation[0] }}
                    </div>
                    <div v-else-if="form.password && form.password !== form.password_confirmation" class="invalid-feedback d-block">
                      Password konfirmasi tidak cocok
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-secondary" @click="goBack">
              <i class="bi bi-arrow-left me-1"></i> Kembali
            </button>
            
            <div class="d-flex gap-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                @click="resetForm"
              >
                <i class="bi bi-arrow-clockwise me-1"></i> Reset
              </button>
              
              <button 
                type="submit" 
                class="btn btn-success"
                :disabled="isSubmitting || !isFormValid"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-check-lg me-1"></i>
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="bi bi-check-circle me-2"></i>
              Berhasil
            </h5>
          </div>
          <div class="modal-body">
            <p class="mb-0">Data pasien berhasil diperbarui!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="goBack">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'EditPasien',
  data() {
    return {
      originalData: {},
      form: {
        name: '',
        tanggal_lahir: '',
        usia: '',
        no_telp: '',
        gender: '',
        password: '',
        password_confirmation: ''
      },
      loading: true,
      error: null,
      errors: {},
      isSubmitting: false
    };
  },
  computed: {
    isFormValid() {
      return this.form.name && 
             this.form.tanggal_lahir && 
             this.form.usia && 
             this.form.no_telp && 
             this.form.gender &&
             (!this.form.password || (this.form.password === this.form.password_confirmation));
    }
  },
  watch: {
    '$route.params.id': function(newId) {
      if (newId) {
        this.fetchPasien();
      } else {
        this.error = 'ID pasien tidak ditemukan pada URL';
        this.loading = false;
      }
    },
    'form.password': function() {
      if (!this.form.password) {
        this.form.password_confirmation = '';
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
          this.originalData = response.data;
          this.populateForm(response.data);
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
    
    populateForm(data) {
      this.form = {
        name: data.name || '',
        tanggal_lahir: data.tanggal_lahir || '',
        usia: data.usia || '',
        no_telp: data.no_telp || '',
        gender: data.gender || '',
        password: '',
        password_confirmation: ''
      };
    },
    
    resetForm() {
      this.populateForm(this.originalData);
      this.errors = {};
    },
    
    async updatePasien() {
      if (!this.isFormValid) return;
      
      this.isSubmitting = true;
      this.errors = {};
      
      try {
        const pasienId = this.$route.params.id;
        const token = this.getAuthToken();
        
        // Prepare data to send
        const updateData = {
          name: this.form.name,
          tanggal_lahir: this.form.tanggal_lahir,
          usia: parseInt(this.form.usia),
          no_telp: this.form.no_telp,
          gender: this.form.gender
        };
        
        // Only include password if it's provided
        if (this.form.password && this.form.password.trim() !== '') {
          updateData.password = this.form.password;
          updateData.password_confirmation = this.form.password_confirmation;
        }
        
        const response = await api.put(`users/${pasienId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          // Show success modal
          const modal = new bootstrap.Modal(document.getElementById('successModal'));
          modal.show();
        }
        
      } catch (err) {
        console.error('Error saat mengupdate pasien:', err);
        
        if (err.response) {
          if (err.response.status === 401) {
            this.error = 'Sesi login Anda telah berakhir. Silakan login kembali.';
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
          } else if (err.response.status === 422) {
            // Validation errors
            this.errors = err.response.data.errors || {};
          } else if (err.response.status === 404) {
            this.error = 'Pasien tidak ditemukan. ID pasien mungkin tidak valid.';
          } else {
            this.error = err.response.data?.message || 
                        'Terjadi kesalahan saat mengupdate data pasien';
          }
        } else {
          this.error = err.message || 'Terjadi kesalahan saat mengupdate data pasien';
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    
    copyToClipboard() {
      try {
        const textToCopy = this.originalData.kode_akses;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        
        // Visual feedback
        const button = event.target.closest('button');
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
    
    goBack() {
      // Try to go to view page first, fallback to list page
      const pasienId = this.$route.params.id;
      if (pasienId) {
        this.$router.push(`/pasien/view/${pasienId}`);
      } else {
        this.$router.push('/pasien');
      }
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

.form-control:focus, 
.form-select:focus, 
.input-group-text {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.btn {
  border-radius: 5px;
  padding: 8px 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-danger {
  color: #dc3545 !important;
}

.text-muted {
  color: #6c757d !important;
}

.gap-2 {
  gap: 0.5rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.modal-content {
  border-radius: 8px;
  border: none;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-radius: 8px 8px 0 0;
}

@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .d-flex.gap-2 .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>