<template>
  <div class="loan-management">
    <div class="left-panel">
      <h2>Ödünç / Rezervasyon İşlemleri</h2>
      <div class="loan-list">
        <div v-for="loan in filteredLoans" :key="loan._id" class="card loan-card">
          <p><strong>Kitap:</strong> {{ loan.book?.title || "Bilinmiyor" }}</p>
          <p><strong>Üye:</strong> {{ loan.member?.name || loan.memberName || "Bilinmiyor" }}</p>
          <p><strong>Rezervasyon Tarihi:</strong> {{ formatDate(loan.reservationDate) }}</p>
          <p v-if="loan.loanDate"><strong>Ödünç Tarihi:</strong> {{ formatDate(loan.loanDate) }}</p>
          <p v-if="loan.returnDate"><strong>İade Tarihi:</strong> {{ formatDate(loan.returnDate) }}</p>
          <p><strong>Durum:</strong> {{ loan.status }}</p>
          <div v-if="isAdmin && loan.status === 'rezerve edildi'">
            <button @click="adminLendBook(loan)" class="btn lend-btn">Ödünç Ver</button>
            <button @click="adminCancelReservation(loan)" class="btn cancel-btn">Rezervasyonu İptal Et</button>
          </div>
          <div v-else-if="loan.status === 'ödünç verildi'">
            <button @click="markAsReturned(loan)" class="btn return-btn">İade Et</button>
          </div>
        </div>
      </div>
    </div>
    <div class="right-panel">
      <LoanCreateForm @loanCreated="fetchLoans" />
    </div>
  </div>
</template>

<script>
import axios from "axios"
import LoanCreateForm from "./LoanCreateForm.vue"

export default {
  name: "LoanReturn",
  components: { LoanCreateForm },
  data() {
    return {
      loans: [],
      searchQuery: "",
      currentUser: {}
    }
  },
  computed: {
    filteredLoans() {
      if (!this.searchQuery) return this.loans
      const query = this.searchQuery.toLowerCase()
      return this.loans.filter(loan => {
        const bookTitle = loan.book?.title?.toLowerCase() || ""
        const memberName = (loan.member?.name || loan.memberName || "").toLowerCase()
        return bookTitle.includes(query) || memberName.includes(query)
      })
    },
    isAdmin() {
      return this.currentUser && this.currentUser.isAdmin
    }
  },
  created() {
    this.fetchLoans()
    const user = localStorage.getItem("user")
    if (user) {
      this.currentUser = JSON.parse(user)
    }
  },
  methods: {
    async fetchLoans() {
      try {
        const response = await axios.get("http://localhost:3000/api/transactions")
        this.loans = response.data
      } catch (error) {
        console.error("Rezervasyonlar alınırken hata:", error)
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ""
      return new Date(dateStr).toLocaleDateString()
    },
    async adminLendBook(loan) {
      try {
        const today = new Date()
        const updateData = {
          status: "ödünç verildi",
          loanDate: today,
          reservationDate: loan.reservationDate
        }
        await axios.put(`http://localhost:3000/api/transactions/${loan._id}`, updateData)
        alert("Kitap ödünç verildi")
        this.fetchLoans()
      } catch (error) {
        console.error("Ödünç verme işlemi yapılırken hata:", error.response?.data?.error || error)
        alert("Ödünç verme işlemi yapılırken hata oluştu")
      }
    },
    async markAsReturned(loan) {
      try {
        const today = new Date()
        const updateData = {
          status: "iade edildi",
          returnDate: today
        }
        await axios.put(`http://localhost:3000/api/transactions/${loan._id}`, updateData)
        alert("Kitap iade edildi")
        this.fetchLoans()
      } catch (error) {
        console.error("İade işlemi yapılırken hata:", error.response?.data?.error || error)
        alert("İade işlemi yapılırken hata oluştu")
      }
    },
    async adminCancelReservation(loan) {
      try {
        const updateData = {
          status: "iptal edildi",
          loanDate: null,
          reservationDate: loan.reservationDate
        }
        await axios.put(`http://localhost:3000/api/transactions/${loan._id}`, updateData)
        alert("Rezervasyon iptal edildi")
        this.fetchLoans()
      } catch (error) {
        console.error("Rezervasyon iptal edilirken hata:", error.response?.data?.error || error)
        alert("Rezervasyon iptal edilirken hata oluştu")
      }
    }
  }
}
</script>

<style scoped>
.loan-management {
  display: flex;
  gap: 2rem;
  padding: 1rem;
}
.left-panel {
  flex: 3;
}
.loan-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
.card.loan-card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.right-panel {
  flex: 1;
}
.btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.lend-btn {
  background-color: #1e3a8a;
  color: #fff;
  margin-right: 0.5rem;
}
.cancel-btn {
  background-color: red;
  color: #fff;
}
.return-btn {
  background-color: green;
  color: #fff;
}
@media (max-width: 768px) {
  .loan-management {
    flex-direction: column-reverse;
  }
  .left-panel,
  .right-panel {
    width: 100%;
  }
  .loan-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .card.loan-card{
    font-size: 0.7rem;
    padding: 0.5rem;

  }
}
</style>
