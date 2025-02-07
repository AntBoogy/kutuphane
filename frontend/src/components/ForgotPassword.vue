<template>
  <div class="forgot-password-container">
    <h2>Şifre Sıfırlama</h2>
    <form @submit.prevent="resetPassword">
      <p v-if="requestSent" class="info-message">
        Şifre sıfırlama isteği gönderildi. Mail üzerinden gereken talimatları inceleyiniz.
      </p>
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" required :disabled="requestSent" />
      </div>
      <button type="submit" v-if="!requestSent">Şifre Sıfırla</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      requestSent: false
    }
  },
  methods: {
    async resetPassword() {
      try {
        await axios.post('http://localhost:3000/api/auth/forgot-password', { email: this.email })
        this.requestSent = true
      } catch (error) {
        console.error('Şifre sıfırlama hatası:', error.response.data.error)
      }
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.forgot-password-container {
  max-width: 400px;
  margin: 5% auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.forgot-password-container:hover {
  transform: translateY(-3px);
}

.forgot-password-container h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.info-message {
  text-align: center;
  color: #1e3a8a;
  font-weight: 500;
  margin-bottom: 1rem;
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
</style>
