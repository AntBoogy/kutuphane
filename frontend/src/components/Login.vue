<template>
  <div class="login-page">
    <div class="left-content">
      <h1>Hoş Geldiniz!</h1>
      <p>
        Modern ve güvenli platformumuza giriş yaparak, büyük kitap arşivimizden dilediğiniz kitabı bulabilirsiniz.
        Hesabınızla birlikte topluluğumuzun bir parçası olabilirsiniz.
      </p>
      <p>
        Henüz üye değilseniz, kütüphanemizden kayıt olarak kitaplardan faydalanabilirsiniz.
      </p>
    </div>
    <div class="right-content">
      <div class="login-container">
        <h2>Giriş Yap</h2>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="email" type="email" id="email" required />
          </div>
          <div class="form-group">
            <label for="password">Şifre</label>
            <input v-model="password" type="password" id="password" required />
          </div>
          <button type="submit">Giriş Yap</button>
        </form>
        <p class="forgot-password">
          Şifrenizi mi unuttunuz?
          <router-link to="/forgot-password">Şifre Sıfırlama</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          email: this.email,
          password: this.password
        })
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        this.$router.push('/')
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Bilinmeyen bir hata oluştu'
        console.error('Giriş hatası:', errorMessage)
        alert(errorMessage)
      }
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}

.login-page {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.left-content {
  flex: 1;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: #fff;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.left-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.right-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.login-container:hover {
  transform: translateY(-5px);
}

h2 {
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

.forgot-password {
  text-align: center;
  margin-top: 1rem;
  color: #555;
}

.forgot-password a {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password a:hover {
  color: #0d1d45;
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }
  .left-content,
  .right-content {
    flex: none;
    width: 100%;
  }
  .left-content {
    padding: 2rem;
    text-align: center;
  }
}
</style>
