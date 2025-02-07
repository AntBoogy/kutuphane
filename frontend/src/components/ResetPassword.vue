<template>
  <div class="reset-password-container">
    <h2>Yeni Şifre Belirle</h2>
    <form v-if="!resetSuccessful" @submit.prevent="resetPassword">
      <div class="form-group">
        <label for="newPassword">Yeni Şifre</label>
        <input v-model="newPassword" type="password" id="newPassword" required />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Yeni Şifre (Tekrar)</label>
        <input v-model="confirmPassword" type="password" id="confirmPassword" required />
      </div>
      <button type="submit">Şifreyi Güncelle</button>
    </form>
    <div v-else class="success-container">
      <p class="message">{{ message }}</p>
      <button @click="goToLogin" class="login-button">Giriş Yap</button>
    </div>
    <p v-if="!resetSuccessful && message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'ResetPassword',
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      message: '',
      token: '',
      email: '',
      resetSuccessful: false
    }
  },
  mounted() {
    this.token = this.$route.query.token
    this.email = this.$route.query.email
  },
  methods: {
    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.message = "Şifreler eşleşmiyor."
        return
      }
      try {
        const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
          email: this.email,
          token: this.token,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        })
        this.message = response.data.message
        this.resetSuccessful = true
      } catch (error) {
        this.message = error.response.data.error || "Bir hata oluştu."
      }
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.reset-password-container {
  max-width: 400px;
  margin: 5% auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.reset-password-container:hover {
  transform: translateY(-3px);
}

.reset-password-container h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #1e3a8a;
}

button {
  width: 100%;
  padding: 0.85rem;
  background-color: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #162f69;
}

.message {
  text-align: center;
  color: #1e3a8a;
  font-weight: 500;
  margin-top: 1rem;
}

.login-button {
  margin-top: 1rem;
  background-color: #28a745;
}

.login-button:hover {
  background-color: #218838;
}

.success-container {
  text-align: center;
}
</style>
