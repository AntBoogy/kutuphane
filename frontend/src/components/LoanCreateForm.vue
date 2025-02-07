<template>
  <div class="loan-create-form form-card">
    <h2 class="page-title">Yeni Ödünç İşlemi Oluştur</h2>
    <form @submit.prevent="createLoan">
      <div class="form-group">
        <label for="book">Kitap Seçiniz</label>
        <select id="book" v-model="loan.book" required>
          <option disabled value="">Lütfen bir kitap seçiniz</option>
          <option v-for="book in availableBooks" :key="book._id" :value="book._id">
            {{ book.title }} - {{ book.author }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="member">Üye Seçiniz</label>
        <select id="member" v-model="loan.member" required>
          <option disabled value="">Lütfen bir üye seçiniz</option>
          <option v-for="member in members" :key="member._id" :value="member._id">
            {{ member.name }}
          </option>
        </select>
      </div>
      <button type="submit">Ödünç Ver</button>
    </form>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "LoanCreateForm",
  data() {
    return {
      books: [],
      members: [],
      activeLoans: [],
      loan: {
        book: "",
        member: "",
        status: "ödünç verildi",
        loanDate: null
      }
    }
  },
  created() {
    this.fetchBooks()
    this.fetchMembers()
    this.fetchActiveLoans()
  },
  computed: {
    availableBooks() {
      return this.books.filter(book => (book.condition || "normal") === "normal" && !this.activeLoans.includes(book._id))
    }
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await axios.get("http://localhost:3000/api/books")
        this.books = response.data
      } catch (error) {
        console.error("Kitaplar alınırken hata:", error)
      }
    },
    async fetchMembers() {
      try {
        const response = await axios.get("http://localhost:3000/api/members")
        this.members = response.data
      } catch (error) {
        console.error("Üyeler alınırken hata:", error)
      }
    },
    async fetchActiveLoans() {
      try {
        const response = await axios.get("http://localhost:3000/api/transactions")
        const active = response.data.filter(transaction => transaction.status === "ödünç verildi")
        this.activeLoans = active.map(loan =>
          typeof loan.book === "object" && loan.book !== null ? loan.book._id : loan.book
        )
      } catch (error) {
        console.error("Aktif ödünç işlemleri alınırken hata:", error)
      }
    },
    async createLoan() {
      try {
        if (this.loan.status === "ödünç verildi") {
          this.loan.loanDate = new Date()
        }
        await axios.post("http://localhost:3000/api/transactions", this.loan)
        this.$emit("loanCreated")
        this.loan.book = ""
        this.loan.member = ""
        this.loan.loanDate = null
        this.fetchActiveLoans()
      } catch (error) {
        console.error("Ödünç işlemi oluşturulurken hata:", error.response?.data?.error || error)
      }
    }
  }
}
</script>

<style scoped>
.loan-create-form {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.form-card {
  max-width: 300px;
  margin: auto;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
button {
  width: 100%;
  padding: 0.5rem;
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
.page-title {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #1e3a8a;
}
</style>
