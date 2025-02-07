<template>
  <div>
    <h2>Üyeler</h2>
    <div v-if="isAdmin" class="add-member">
      <router-link to="/members/create">
        <button class="add-member-btn">Yeni Üye Ekle</button>
      </router-link>
    </div>
    <div class="member-list">
      <div
        v-for="member in members"
        :key="member._id"
        class="member-card"
        @click="openModal(member)"
      >
        <p class="member-name">{{ member.name }}</p>
        <p class="member-email">{{ member.email }}</p>
        <!-- Üyelik Türü ve Admin bilgisi gösterimi -->
        <p class="member-membership-type">
          Üyelik Türü: {{ member.membershipType }}
          <span v-if="member.isAdmin" class="admin-tag"> (Admin)</span>
        </p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Üye Bilgileri</h3>
        <form @submit.prevent="updateMember">
          <div class="form-group">
            <label>Ad Soyad:</label>
            <input v-model="selectedMember.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input v-model="selectedMember.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Telefon Numarası:</label>
            <input v-model="selectedMember.phone" type="text" required />
          </div>
          <div class="form-group">
            <label>TC:</label>
            <input v-model="selectedMember.tc" type="text" required />
          </div>
          <div class="form-group">
            <label>Doğum Tarihi:</label>
            <input v-model="selectedMember.birthDate" type="date" required />
          </div>
          <button type="submit" class="update-btn">Güncelle</button>
        </form>
        <button
          v-if="isAdmin"
          @click="deleteMember(selectedMember._id)"
          class="delete-btn"
        >
          Üyeyi Sil
        </button>
        <button @click="closeModal" class="close-btn">Kapat</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "MemberManagementPage",
  data() {
    return {
      members: [],
      showModal: false,
      selectedMember: null,
      currentUser: {}
    }
  },
  computed: {
    isAdmin() {
      return this.currentUser && this.currentUser.isAdmin
    }
  },
  created() {
    this.fetchMembers()
    const user = localStorage.getItem("user")
    if (user) {
      this.currentUser = JSON.parse(user)
    }
  },
  methods: {
    async fetchMembers() {
      try {
        const response = await axios.get("http://localhost:3000/api/members")
        this.members = response.data
      } catch (error) {
        console.error("Üyeler alınırken hata:", error)
      }
    },
    openModal(member) {
      let formattedBirthDate = ""
      if (member.birthDate) {
        formattedBirthDate = new Date(member.birthDate)
          .toISOString()
          .split("T")[0]
      }
      this.selectedMember = { ...member, birthDate: formattedBirthDate }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.selectedMember = null
    },
    async updateMember() {
      try {
        await axios.put(
          `http://localhost:3000/api/members/${this.selectedMember._id}`,
          this.selectedMember
        )
        alert("Üye güncellendi")
        this.fetchMembers()
        this.closeModal()
      } catch (error) {
        console.error("Üye güncellenirken hata:", error.response?.data?.error || error)
        alert("Üye güncellenirken hata oluştu")
      }
    },
    async deleteMember(memberId) {
      try {
        const transactionsResponse = await axios.get("http://localhost:3000/api/transactions")
        const allLoans = transactionsResponse.data
        const memberLoans = allLoans.filter(loan => {
          const loanMemberId =
            typeof loan.member === "object" && loan.member !== null
              ? loan.member._id
              : loan.member
          return loanMemberId === memberId && loan.status === "ödünç verildi"
        })
        if (memberLoans.length > 0) {
          const bookTitles = memberLoans.map(loan =>
            loan.book && loan.book.title ? loan.book.title : "Bilinmiyor"
          )
          alert(
            `Bu üyenin henüz iade edilmemiş ödünç kitapları var:\n${bookTitles.join(
              "\n"
            )}\nLütfen bu kitaplar iade edilmeden üyeyi silmeyiniz.`
          )
          return
        }
        if (confirm("Bu üyeyi silmek istediğinize emin misiniz?")) {
          await axios.delete(`http://localhost:3000/api/members/${memberId}`)
          alert("Üye silindi")
          this.fetchMembers()
          this.closeModal()
        }
      } catch (error) {
        console.error("Üye silinirken hata:", error.response?.data?.error || error)
        alert("Üye silinirken hata oluştu")
      }
    }
  }
}
</script>

<style scoped>
.add-member {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.add-member-btn {
  padding: 0.5rem 1rem;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-member-btn:hover {
  background-color: #172554;
}

.member-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.member-card {
  border: 1px solid #ccc;
  padding: 1rem;
  cursor: pointer;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.2s, box-shadow 0.2s;
  word-break: break-word;
}

.member-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.member-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1e3a8a;
}

.member-email,
.member-membership-type {
  font-size: 0.9rem;
  color: #555;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

.admin-tag {
  color: red;
  font-weight: bold;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow-y: auto;
  max-height: 90vh;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.update-btn {
  background-color: #1e3a8a;
  color: #fff;
}

.delete-btn {
  background-color: red;
  color: #fff;
  margin-top: 1rem;
}

.close-btn {
  background-color: #ccc;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .member-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .member-card {
    padding: 0.75rem;
  }
}

@media (max-width: 500px) {
  .modal {
    width: 100%;
    padding: 1rem;
  }
}
</style>
