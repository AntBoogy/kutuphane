<template>
  <header class="app-header">
    <div class="container header-container">
      <h1 class="logo">Kütüphane Yönetim Sistemi</h1>
      <nav v-if="isLoggedIn">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/books">Kitaplar</router-link>
        <router-link v-if="isAdmin" to="/members">Üyeler</router-link>
        <router-link to="/books-placement">Kitap Bulma</router-link>
        <router-link v-if="isAdmin" to="/transactions">Ödünç/İade</router-link>
        <router-link v-if="!isAdmin" to="/reservation">Rezervasyon</router-link>     
        <span class="user-info">Hoş geldiniz, {{ userName }}</span>
        <button @click="logout" class="logout-btn">Çıkış Yap</button>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: "AppHeader",
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.name || '';
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.isAdmin;
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.app-header {
  background-color: #1e3a8a;
  color: #fff;
  padding: 1rem;
}

.header-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}


.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.user-info {
  margin-left: 1rem;
  font-style: italic;
}

.logout-btn {
  background: #e3342f;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #cc1f1a;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    text-align: center;
  }

  .logo {
    margin-bottom: 0.5rem;
  }

  nav {
    justify-content: center;
    margin-top: 0.5rem;
  }

  .user-info {
    margin: 0.5rem 0 0 0;
  }
}
</style>
