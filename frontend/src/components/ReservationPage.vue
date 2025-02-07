<template>
  <div class="reservation-page">
    <div class="filter-container">
      <input
        v-model="reservationFilter"
        type="text"
        placeholder="Rezervasyonları kitap adına göre filtrele"
      />
    </div>

    <UserReservations :reservations="filteredReservations" />

    <h2 class="section-title">Tüm Kitaplar</h2>
    <div class="books-grid">
      <div
        v-for="book in availableBooks"
        :key="book._id"
        class="book-card"
        @click="openReservationModal(book)"
      >
        <p class="book-title">{{ book.title }}</p>
        <p class="book-author">{{ book.author }}</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">Rezervasyon Yap</h3>
        <p><strong>Kitap:</strong> {{ selectedBook.title }}</p>
        <label for="reservationDate">Rezervasyon Tarihi:</label>
        <input
          v-model="reservationDate"
          type="date"
          id="reservationDate"
          required
        />
        <div class="modal-buttons">
          <button @click="makeReservation" class="btn primary-btn">
            Rezervasyon Yap
          </button>
          <button @click="closeModal" class="btn close-btn">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import UserReservations from "./UserReservations.vue"

export default {
  name: "ReservationPage",
  components: { UserReservations },
  data() {
    return {
      books: [],
      reservations: [],
      showModal: false,
      selectedBook: null,
      reservationDate: "",
      reservationFilter: "",
      currentUser: {}
    }
  },
  computed: {
    myReservations() {
      const userId = this.currentUser.id
      const userName = this.currentUser.name
      if (!userId) return []
      return this.reservations.filter(r => {
        let memberId = null
        if (r.member) {
          memberId =
            typeof r.member === "object" && r.member._id
              ? r.member._id.toString()
              : r.member.toString()
        }
        return (memberId && memberId === userId) || (r.memberName && r.memberName === userName)
      })
    },
    filteredReservations() {
      if (!this.reservationFilter) return this.myReservations
      const filter = this.reservationFilter.toLowerCase()
      return this.myReservations.filter(r => r.book && r.book.title && r.book.title.toLowerCase().includes(filter))
    },
    availableBooks() {
      return this.books.filter(book => book.status === 0)
    },
    isAdmin() {
      return this.currentUser && this.currentUser.isAdmin
    }
  },
  created() {
    this.fetchBooks()
    this.fetchReservations()
    const user = localStorage.getItem("user")
    if (user) {
      this.currentUser = JSON.parse(user)
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
    async fetchReservations() {
      try {
        const response = await axios.get("http://localhost:3000/api/transactions")
        this.reservations = response.data
      } catch (error) {
        console.error("Rezervasyonlar alınırken hata:", error)
      }
    },
    openReservationModal(book) {
      this.selectedBook = book
      this.reservationDate = ""
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.selectedBook = null
      this.reservationDate = ""
    },
    async makeReservation() {
      if (!this.reservationDate) {
        alert("Lütfen rezervasyon tarihi seçiniz")
        return
      }
      try {
        const selectedDate = new Date(this.reservationDate)
        const today = new Date()
        const isFuture = selectedDate > today
        const newReservation = {
          book: this.selectedBook._id,
          member: this.currentUser.id,
          reservationDate: this.reservationDate,
          status: isFuture ? "rezerve edildi" : "ödünç alındı",
          loanDate: isFuture ? null : today
        }
        await axios.post("http://localhost:3000/api/transactions", newReservation)
        alert("Rezervasyon yapıldı")
        await this.fetchReservations()
        await this.fetchBooks()
        this.closeModal()
      } catch (error) {
        console.error("Rezervasyon yapılırken hata:", error.response?.data?.error || error)
        alert("Rezervasyon yapılırken hata oluştu")
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ""
      return new Date(dateStr).toLocaleDateString()
    },
    getDisplayDate(loan) {
      if (loan.status === "rezerve edildi") {
        return this.formatDate(loan.reservationDate)
      } else if (loan.status === "ödünç verildi") {
        return this.formatDate(loan.loanDate)
      } else if (loan.status === "iade edildi") {
        return this.formatDate(loan.returnDate)
      } else if (loan.status === "iptal edildi") {
        return this.formatDate(loan.reservationDate)
      }
      return ""
    }
  }
}
</script>

<style scoped>
.reservation-page {
  background: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.filter-container {
  margin-bottom: 1rem;
  text-align: center;
}
.filter-container input {
  width: 90%;
  max-width: 400px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.section-title {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
  text-align: center;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
}
.book-card {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.book-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1e3a8a;
}
.book-author {
  font-size: 0.9rem;
  color: #555;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.modal-title {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
  color: #1e3a8a;
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
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
