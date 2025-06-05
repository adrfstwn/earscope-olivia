<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Daftar Pasien</h4>
        <router-link to="/pasien/create" class="btn btn-sm btn-light">
          <i class="bi bi-plus-lg me-1"></i> Tambah Pasien
        </router-link>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data pasien...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
        </div>
        
        <div v-else-if="pasienList.length === 0" class="text-center my-5">
          <i class="bi bi-inbox-fill text-muted" style="font-size: 3rem;"></i>
          <p class="mt-3 text-muted">Belum ada data pasien tersimpan</p>
          <router-link to="/pasien/create" class="btn btn-primary mt-2">
            <i class="bi bi-plus-lg me-1"></i> Tambah Pasien Baru
          </router-link>
        </div>
        
        <div v-else>
          <!-- Search and filter section -->
          <div class="row mb-3">
            <div class="col-md-8">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Cari nama pasien atau no rekam medis..."
                  v-model="searchQuery"
                  @input="handleSearch"
                />
                <button class="btn btn-outline-secondary" type="button" @click="resetFilter">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
            <div class="col-md-4 text-md-end mt-2 mt-md-0">
              <select class="form-select" v-model="genderFilter" @change="handleFilter">
                <option value="">Semua Gender</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>
          </div>
          
          <!-- Table section -->
          <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th width="4%">No</th>
                  <th width="13%">No Rekam Medis</th>
                  <th width="18%">Nama</th>
                  <th width="13%">Tanggal Lahir</th>
                  <th width="7%">Usia</th>
                  <th width="13%">No Telepon</th>
                  <th width="10%">Gender</th>
                  <th width="22%" class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pasien, index) in paginatedPasiens" :key="pasien.id">
                  <td>{{ startIndex + index + 1 }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ pasien.kode_akses || '-' }}</span>
                  </td>
                  <td>{{ pasien.name }}</td>
                  <td>{{ formatDate(pasien.tanggal_lahir) }}</td>
                  <td>{{ pasien.usia }} th</td>
                  <td>+62{{ pasien.no_telp }}</td>
                  <td>
                    <span 
                      :class="[
                        'badge', 
                        pasien.gender === 'laki-laki' ? 'bg-primary' : 'bg-info'
                      ]"
                    >
                      {{ capitalizeFirst(pasien.gender) }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex justify-content-center gap-1">
                      <router-link 
                        :to="`/pasien/view/${pasien.id}`" 
                        class="btn btn-sm btn-info text-white"
                        title="Lihat Detail"
                      >
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <router-link 
                        :to="`/pasien/edit/${pasien.id}`" 
                        class="btn btn-sm btn-warning text-white"
                        title="Edit Data"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
                      <button 
                        @click="confirmDelete(pasien)" 
                        class="btn btn-sm btn-danger"
                        title="Hapus Data"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span class="text-muted">
                Menampilkan {{ Math.min(totalItems, startIndex + 1) }}-{{ Math.min(totalItems, startIndex + itemsPerPage) }} 
                dari {{ totalItems }} pasien
              </span>
            </div>
            <nav aria-label="Page navigation" v-if="totalPages > 1">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page" 
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Konfirmasi Hapus -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteModalLabel">Konfirmasi Hapus</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin menghapus pasien berikut?</p>
            <p class="text-danger mt-3"><small><i class="bi bi-exclamation-triangle"></i> Tindakan ini tidak dapat dibatalkan.</small></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="deletePasien" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <i class="bi bi-trash me-1" v-if="!deleteLoading"></i>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import api from '@/api';
import { debounce } from 'lodash';

export default {
  name: 'ListPasien',
  data() {
    return {
      pasienList: [],
      filteredPasiens: [],
      searchQuery: '',
      genderFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
      loading: true,
      error: null,
      selectedPasien: null,
      deleteModal: null,
      deleteLoading: false,
      debouncedSearch: null
    };
  },
  computed: {
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    paginatedPasiens() {
      return this.filteredPasiens.slice(this.startIndex, this.startIndex + this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  },
  created() {
    // Initialize debounced search
    this.debouncedSearch = debounce(() => {
      this.applyFilters();
    }, 300);
    
    this.fetchPasienData();
    
    // Listen for updates from other components
    window.addEventListener('storage', (event) => {
      if (event.key === 'pasienDataUpdated') {
        this.fetchPasienData();
      }
    });
  },
  mounted() {
    // Check if data was updated from another component
    const updated = localStorage.getItem('pasienDataUpdated');
    if (updated) {
      localStorage.removeItem('pasienDataUpdated');
      this.fetchPasienData();
    }
  },
  methods: {
    async fetchPasienData() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!token) {
          throw new Error('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
        }
        
        const response = await api.get('pasien', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Periksa apakah response memiliki data
        if (response.data) {
          // Periksa format respons dan tangani kedua kemungkinan format
          if (Array.isArray(response.data)) {
            // Jika response.data langsung array
            console.log('Menggunakan format respons array');
            this.pasienList = response.data;
          } 
          else if (response.data.data && Array.isArray(response.data.data)) {
            // Format respons adalah { data: [...] }
            console.log('Menggunakan format respons data array');
            this.pasienList = response.data.data;
          }
          else if (response.data.data && response.data.data.items) {
            // Format respons adalah { data: { items: [...], total: X, pages: Y } }
            console.log('Menggunakan format respons pagination');
            this.pasienList = response.data.data.items || [];
            this.totalItems = response.data.data.total || 0;
            this.totalPages = response.data.data.pages || 1;
          } 
          else {
            throw new Error('Format response tidak dikenali');
          }
          
          // Set filtered data and calculate pagination if not using server pagination
          if (!response.data.data?.items) {
            this.filteredPasiens = [...this.pasienList];
            this.totalItems = this.pasienList.length;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          }
          
          console.log('Data pasien berhasil dimuat:', this.pasienList.length);
        } else {
          throw new Error('Tidak ada data dari server');
        }
      } catch (err) {
        console.error('Error saat memuat data pasien:', err);
        
        if (err.response) {
          if (err.response.status === 401) {
            this.error = 'Sesi login Anda telah berakhir. Silakan login kembali.';
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
          } else {
            this.error = `Error: ${err.response.data?.message || 'Terjadi kesalahan saat memuat data pasien'}`;
          }
        } else {
          this.error = err.message || 'Terjadi kesalahan saat memuat data pasien. Silakan coba lagi.';
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
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    },
    
    capitalizeFirst(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    handleSearch() {
      this.debouncedSearch();
    },
    
    handleFilter() {
      this.applyFilters();
    },
    
    applyFilters() {
      let filtered = [...this.pasienList];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(pasien => 
          pasien.name.toLowerCase().includes(query) ||
          (pasien.kode_akses && pasien.kode_akses.toLowerCase().includes(query))
        );
      }
      
      // Apply gender filter
      if (this.genderFilter) {
        filtered = filtered.filter(pasien => 
          pasien.gender === this.genderFilter
        );
      }
      
      this.filteredPasiens = filtered;
      this.currentPage = 1;
      
      // Recalculate total pages based on filtered results
      this.totalPages = Math.ceil(this.filteredPasiens.length / this.itemsPerPage);
    },
    
    resetFilter() {
      this.searchQuery = '';
      this.genderFilter = '';
      this.filteredPasiens = [...this.pasienList];
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredPasiens.length / this.itemsPerPage);
    },
    
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    
    confirmDelete(pasien) {
      this.selectedPasien = pasien;
      
      // Initialize modal if needed
      if (!this.deleteModal) {
        const modalElement = document.getElementById('deleteModal');
        this.deleteModal = new Modal(modalElement);
      }
      
      this.deleteModal.show();
    },
    
    async deletePasien() {
      if (!this.selectedPasien) return;
      
      this.deleteLoading = true;
      
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!token) {
          throw new Error('Token autentikasi tidak ditemukan');
        }
        
        await api.delete(`users/${this.selectedPasien.id}/force-delete`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.deleteModal.hide();
        this.selectedPasien = null;
        
        console.log('Pasien berhasil dihapus');
      } catch (err) {
        console.error('Error saat menghapus pasien:', err);
        this.error = err.response?.data?.message || 'Gagal menghapus pasien. Silakan coba lagi.';
        
        // Clear error after 5 seconds
        setTimeout(() => {
          this.error = null;
        }, 5000);
      } finally {
        this.deleteLoading = false;
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
}

.card-header {
  border-radius: 8px 8px 0 0;
}

.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.badge {
  font-weight: 500;
  padding: 0.5em 0.75em;
  font-size: 0.85em;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-sm i {
  font-size: 0.875rem;
}

.pagination .page-link {
  color: #0d6efd;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.pagination .page-link:hover {
  color: #0a58ca;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.modal-content {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.input-group .form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.table-responsive {
  border-radius: 0.375rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-sm {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }
  
  .badge {
    font-size: 0.75em;
  }
}
</style>