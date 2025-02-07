<template>
  <div class="book-create form-card">
    <h2 class="page-title">Yeni Kitap Ekle</h2>
    <form @submit.prevent="createBook">
      <div class="form-group">
        <label for="isbn">ISBN</label>
        <input id="isbn" v-model="book.isbn" type="text" required />
      </div>
      <div class="form-group">
        <label for="title">Başlık</label>
        <input id="title" v-model="book.title" type="text" required />
      </div>
      <div class="form-group">
        <label for="author">Yazar</label>
        <input id="author" v-model="book.author" type="text" required />
      </div>
      <div class="form-group">
        <label for="publisher">Yayıncı</label>
        <input id="publisher" v-model="book.publisher" type="text" />
      </div>
      <div class="form-group">
        <label for="year">Baskı Yılı</label>
        <input id="year" v-model.number="book.year" type="number" />
      </div>
      <div class="form-group">
        <label for="keywords">Anahtar Kelimeler (virgülle ayrılmış)</label>
        <input id="keywords" v-model="keywords" type="text" />
      </div>
      <button type="submit">Kaydet</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookCreate',
  data() {
    return {
      book: {
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        year: null,
        keywords: []
      },
      keywords: ''
    }
  },
  methods: {
    async createBook() {
      this.book.keywords = this.keywords.split(',').map(k => k.trim()).filter(k => k)
      const plainBook = JSON.parse(JSON.stringify(this.book))
      try {
        await axios.post('http://localhost:3000/api/books', plainBook)
        this.$router.push('/books')
      } catch (error) {
        console.error('Kitap oluşturulurken hata:', error)
      }
    }
  }
}
</script>

<style scoped>
.form-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.page-title {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #172554;
}
@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }
  button {
    padding: 0.65rem;
    font-size: 0.9rem;
  }
}
</style>
