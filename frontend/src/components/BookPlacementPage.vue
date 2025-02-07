<template>
  <div class="book-placement-page" :class="isAdmin ? 'admin-layout' : 'user-layout'">
    <h2 class="page-title">Kitap Yerleştirme & Takip</h2>
    <p class="book-information"><span style="color: #dc3545;">Kayıp Kitaplar </span><span style="color: #ffc107;">Hasarlı Kitaplar</span></p> 
    <div v-if="isAdmin">
      <div v-if="mobileView" class="mobile-admin">
        <button class="toggle-btn" @click="mobileToggle = !mobileToggle">
          Yerleştirilmemiş Kitaplar {{ mobileToggle ? 'Gizle' : 'Göster' }}
        </button>
        <transition name="slide">
          <div v-if="mobileToggle" class="list not-placed mobile">
            <input
              v-model="filterNotPlaced"
              type="text"
              placeholder="Kitap adına göre filtrele..."
              class="filter-input"
            />
            <ul>
              <li
                v-for="book in filteredNotPlacedBooks"
                :key="book._id"
                @click="openModal(book)"
                class="book-item"
              >
                {{ book.title }} - {{ book.author }}
              </li>
            </ul>
          </div>
        </transition>
        <div class="list placed mobile">
          <input
            v-model="filterPlaced"
            type="text"
            placeholder="Kitap adına göre filtrele..."
            class="filter-input"
          />
          <div class="grid-placed">
            <div
              v-for="book in filteredPlacedBooks"
              :key="book._id"
              @click="openModal(book)"
              class="book-box"
              :class="{
                'lost-box': book.condition === 'lost',
                'damaged-box': book.condition === 'damaged'
              }"
            >
              <p class="book-title">{{ book.title }}</p>
              <p class="book-location">{{ book.shelf }} - {{ book.section }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="lists-container">
        <div class="list placed">
          <h3>Yerleştirilmiş Kitaplar</h3>
          <input
            v-model="filterPlaced"
            type="text"
            placeholder="Kitap adına göre filtrele..."
            class="filter-input"
          />
          <div class="grid-placed">
            <div
              v-for="book in filteredPlacedBooks"
              :key="book._id"
              @click="openModal(book)"
              class="book-box"
              :class="{
                'lost-box': book.condition === 'lost',
                'damaged-box': book.condition === 'damaged'
              }"
            >
              <p class="book-title">{{ book.title }}</p>
              <p class="book-location">{{ book.shelf }} - {{ book.section }}</p>
            </div>
          </div>
        </div>
        <div class="list not-placed">
          <h3>Yerleştirilmemiş Kitaplar</h3>
          <input
            v-model="filterNotPlaced"
            type="text"
            placeholder="Kitap adına göre filtrele..."
            class="filter-input"
          />
          <ul>
            <li
              v-for="book in filteredNotPlacedBooks"
              :key="book._id"
              @click="openModal(book)"
              class="book-item"
            >
              {{ book.title }} - {{ book.author }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div v-else class="placed-books-user">
      <h3>Yerleştirilmiş Kitaplar</h3>
      <input
        v-model="filterPlaced"
        type="text"
        placeholder="Kitap adına göre filtrele..."
        class="filter-input"
      />
      <div class="grid-placed">
        <div
          v-for="book in filteredPlacedBooks"
          :key="book._id"
          class="book-box"
          :class="{
            'lost-box': book.condition === 'lost',
            'damaged-box': book.condition === 'damaged'
          }"
        >
          <p class="book-title">{{ book.title }}</p>
          <p class="book-location">{{ book.shelf }} - {{ book.section }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="showModal && isAdmin" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">Kitap Yerleştirme / Durum Güncelleme</h3>
        <p><strong>Kitap:</strong> {{ selectedBook.title }} - {{ selectedBook.author }}</p>
        <div class="form-group">
          <label for="shelf">Raf</label>
          <input id="shelf" v-model="modalForm.shelf" type="text" placeholder="Raf numarası veya adı" />
        </div>
        <div class="form-group">
          <label for="section">Bölüm</label>
          <input id="section" v-model="modalForm.section" type="text" placeholder="Bölüm adı" />
        </div>
        <div class="form-group">
          <label for="condition">Durum</label>
          <select id="condition" v-model="modalForm.condition">
            <option value="normal">Normal</option>
            <option value="lost">Kayıp</option>
            <option value="damaged">Hasarlı</option>
          </select>
        </div>
        <div class="modal-buttons">
          <button @click="savePlacement" class="btn primary-btn">Kaydet</button>
          <button @click="closeModal" class="btn close-btn">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "BookPlacementPage",
  data() {
    return {
      books: [],
      filterNotPlaced: "",
      filterPlaced: "",
      showModal: false,
      selectedBook: null,
      modalForm: {
        shelf: "",
        section: "",
        condition: "normal"
      },
      mobileToggle: false,
      mobileView: window.innerWidth <= 768
    };
  },
  computed: {
    notPlacedBooks() {
      return this.books.filter(book => !book.shelf || !book.section);
    },
    placedBooks() {
      return this.books.filter(book => book.shelf && book.section);
    },
    filteredNotPlacedBooks() {
      if (!this.filterNotPlaced) return this.notPlacedBooks;
      const filter = this.filterNotPlaced.toLowerCase();
      return this.notPlacedBooks.filter(book =>
        book.title.toLowerCase().includes(filter)
      );
    },
    filteredPlacedBooks() {
      if (!this.filterPlaced) return this.placedBooks;
      const filter = this.filterPlaced.toLowerCase();
      return this.placedBooks.filter(book =>
        book.title.toLowerCase().includes(filter)
      );
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user && user.isAdmin;
    }
  },
  created() {
    this.fetchBooks();
    window.addEventListener("resize", this.updateMobileView);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateMobileView);
  },

  methods: {
    async fetchBooks() {
      try {
        const response = await axios.get("http://localhost:3000/api/books");
        this.books = response.data.map(book => ({
          ...book,
          condition: book.condition || "normal"
        }));
      } catch (error) {
        console.error("Kitaplar alınırken hata:", error);
      }
    },
    updateMobileView() {
      this.mobileView = window.innerWidth <= 768;
      if (!this.mobileView) {
        this.mobileToggle = false;
      }
    },
    openModal(book) {
      if (!this.isAdmin) return;
      this.selectedBook = book;
      this.modalForm.shelf = book.shelf || "";
      this.modalForm.section = book.section || "";
      this.modalForm.condition = book.condition || "normal";
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedBook = null;
      this.modalForm = { shelf: "", section: "", condition: "normal" };
    },
    async savePlacement() {
      if (this.modalForm.condition === "normal" && (!this.modalForm.shelf || !this.modalForm.section)) {
        alert("Normal durumda, lütfen raf ve bölüm bilgilerini doldurun.");
        return;
      }
      try {
        await axios.put(`http://localhost:3000/api/books/${this.selectedBook._id}`, {
          shelf: this.modalForm.shelf,
          section: this.modalForm.section,
          condition: this.modalForm.condition
        });
        await this.fetchBooks();
        this.closeModal();
      } catch (error) {
        console.error("Kitap güncellenirken hata:", error.response?.data || error);
        alert("Kitap güncellenirken hata oluştu.");
      }
    }
  }
};
</script>

<style scoped>
.book-placement-page {
  padding: 2rem;
  background: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.book-information {
  font-weight: bolder;
  font-size: 1rem;
}

.admin-layout {
  margin: auto;
}
.user-layout {
  max-width: 100%;
  margin: auto;
}

.page-title {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 1.5rem;
}

.lists-container {
  display: flex;
  gap: 2rem;
  flex-wrap: nowrap;
}

.list.placed {
  width: 70%;
}
.list.not-placed {
  width: 30%;
}

.list {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.list h3 {
  margin-top: 0;
  text-align: center;
  color: #1e3a8a;
}
.filter-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.grid-placed {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.book-box {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.book-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.book-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1e3a8a;
}
.book-location {
  font-size: 0.9rem;
  color: #555;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.book-item {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}
.book-item:hover {
  background-color: #f0f8ff;
}

.lost-box {
  background-color: #ffe5e5;
  border-color: #dc3545;
}
.damaged-box {
  background-color: #fff4e5;
  border-color: #ffc107;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-title {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.primary-btn {
  background-color: #1e3a8a;
  color: #fff;
}
.primary-btn:hover {
  background-color: #162f6b;
}
.close-btn {
  background-color: #ccc;
  color: #333;
}
.close-btn:hover {
  background-color: #b0b0b0;
}

.mobile-admin .toggle-btn {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.mobile-admin .toggle-btn:hover {
  background-color: #162f6b;
}

@media (max-width: 768px) {
  .mobile-admin .list {
    width: 100%;
    margin-top: 20px;
  }
}

.slide-enter-active, .slide-leave-active {
  transition: max-height 0.3s ease;
}
.slide-enter, .slide-leave-to {
  max-height: 0;
  overflow: hidden;
}
</style>
