<template>
  <div class="book-catalog">
    <div class="header-actions">
      <h2 class="page-title">Kitap Kataloğu</h2>
      <div v-if="isAdmin" class="add-book">
        <router-link to="/books/create">
          <button class="add-book-btn">Yeni Kitap Ekle</button>
        </router-link>
      </div>
    </div>
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="Kitap ara..." />
    </div>
    <div class="grid">
      <div v-for="book in filteredBooks" :key="book._id" class="card" @click="openModal(book)">
        <h3>{{ book.title }}</h3>
        <p><strong>Yazar:</strong> {{ book.author }}</p>
        <p><strong>ISBN:</strong> {{ book.isbn }}</p>
        <p><strong>Yayıncı:</strong> {{ book.publisher }}</p>
        <p><strong>Baskı Yılı:</strong> {{ book.year }}</p>
      </div>
    </div>
    <div v-if="showModal && isAdmin" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">Kitap Bilgilerini Güncelle / Sil</h3>
        <p><strong>Kitap:</strong> {{ selectedBook.title }} - {{ selectedBook.author }}</p>
        <form @submit.prevent="saveBookUpdate">
          <div class="form-group">
            <label for="isbn">ISBN</label>
            <input id="isbn" v-model="modalForm.isbn" type="text" placeholder="ISBN" />
          </div>
          <div class="form-group">
            <label for="title">Başlık</label>
            <input id="title" v-model="modalForm.title" type="text" placeholder="Kitap başlığı" />
          </div>
          <div class="form-group">
            <label for="author">Yazar</label>
            <input id="author" v-model="modalForm.author" type="text" placeholder="Yazar" />
          </div>
          <div class="form-group">
            <label for="publisher">Yayıncı</label>
            <input id="publisher" v-model="modalForm.publisher" type="text" placeholder="Yayıncı" />
          </div>
          <div class="form-group">
            <label for="year">Baskı Yılı</label>
            <input id="year" v-model="modalForm.year" type="number" placeholder="Baskı Yılı" />
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn primary-btn">Güncelle</button>
            <button type="button" @click="deleteBook" class="btn delete-btn">Kitabı Sil</button>
            <button type="button" @click="closeModal" class="btn close-btn">Kapat</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "BookCatalog",
  data() {
    return {
      books: [],
      searchQuery: "",
      showModal: false,
      selectedBook: null,
      modalForm: {
        isbn: "",
        title: "",
        author: "",
        publisher: "",
        year: ""
      }
    }
  },
  computed: {
    filteredBooks() {
      if (!this.searchQuery) return this.books
      const filter = this.searchQuery.toLowerCase()
      return this.books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(filter)
        const authorMatch = book.author.toLowerCase().includes(filter)
        const keywordsMatch = Array.isArray(book.keywords)
          ? book.keywords.join(" ").toLowerCase().includes(filter)
          : false
        return titleMatch || authorMatch || keywordsMatch
      })
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      return user.isAdmin
    }
  },
  created() {
    this.fetchBooks()
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await axios.get("http://localhost:3000/api/books")
        this.books = response.data.map(book => ({
          ...book,
          condition: book.condition || "normal"
        }))
      } catch (error) {
        console.error("Kitaplar alınırken hata:", error)
      }
    },
    openModal(book) {
      if (!this.isAdmin) return
      this.selectedBook = book
      this.modalForm = {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        year: book.year
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.selectedBook = null
      this.modalForm = { isbn: "", title: "", author: "", publisher: "", year: "" }
    },
    async saveBookUpdate() {
      try {
        await axios.put(
          `http://localhost:3000/api/books/${this.selectedBook._id}`,
          { ...this.modalForm }
        )
        await this.fetchBooks()
        this.closeModal()
      } catch (error) {
        console.error("Kitap güncellenirken hata:", error.response?.data || error)
        alert("Kitap güncellenirken hata oluştu.")
      }
    },
    async deleteBook() {
      if (this.selectedBook.status !== 0) {
        alert("Kitabı şu an ödünç verilmiştir.")
        return
      }
      if (!confirm("Bu kitabı silmek istediğinize emin misiniz?")) return
      try {
        await axios.delete(`http://localhost:3000/api/books/${this.selectedBook._id}`)
        alert("Kitap silindi.")
        await this.fetchBooks()
        this.closeModal()
      } catch (error) {
        console.error("Kitap silinirken hata:", error.response?.data || error)
        alert("Kitap silinirken hata oluştu.")
      }
    }
  }
}
</script>

<style scoped>
.book-catalog {
  padding: 1rem;
  background: #f8f9fa;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  color: #1e3a8a;
  margin: 0;
}

.add-book {
  margin-bottom: 1rem;
}

.add-book-btn {
  padding: 0.5rem 1rem;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-book-btn:hover {
  background-color: #172554;
}

.search-bar {
  margin-bottom: 1.5rem;
  text-align: center;
}

.search-bar input {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.card {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

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
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

.delete-btn {
  background-color: #dc3545;
  color: #fff;
}

.delete-btn:hover {
  background-color: #b02a37;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .card {
    font-size: 0.7rem;
  }
}
</style>
