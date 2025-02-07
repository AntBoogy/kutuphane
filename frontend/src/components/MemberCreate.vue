<template>
  <div class="member-create form-card">
    <h2 class="page-title">Yeni Üye Ekle</h2>
    <form @submit.prevent="createMember">
      <div class="form-group">
        <label for="name">İsim</label>
        <input id="name" v-model="member.name" type="text" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="member.email" type="email" required />
      </div>
      <div class="form-group">
        <label for="membershipType">Üyelik Türü</label>
        <select id="membershipType" v-model="member.membershipType" required>
          <option value="" disabled>Seçiniz</option>
          <option value="öğrenci">Öğrenci</option>
          <option value="öğretmen">Öğretmen</option>
          <option value="genel üye">Genel Üye</option>
        </select>
      </div>
      <!-- Yeni admin checkbox alanı -->
      <div class="form-group">
        <label for="isAdmin">Admin mi?</label>
        <input id="isAdmin" type="checkbox" v-model="member.isAdmin" />
      </div>
      <button type="submit">Kaydet</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MemberCreate',
  data() {
    return {
      member: {
        name: '',
        email: '',
        membershipType: '',
        penalty: 0,
        isAdmin: false  // Varsayılan olarak false
      }
    }
  },
  methods: {
    async createMember() {
      try {
        await axios.post('http://localhost:3000/api/auth/register', this.member)
        this.$router.push('/members')
      } catch (error) {
        console.error('Üye oluşturulurken hata:', error)
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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #1e3a8a;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  color: #333;
}

button {
  width: 100%;
  padding: 0.85rem;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #162f69;
}

@media (max-width: 768px) {
  .form-card {
    width: 90%;
    padding: 1rem;
  }
  .page-title {
    font-size: 1.4rem;
  }
  input,
  select,
  button {
    font-size: 0.95rem;
    padding: 0.65rem;
  }
}
</style>
