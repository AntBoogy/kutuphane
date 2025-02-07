<template>
  <div id="app" class="app-container">
    <AppHeader v-if="showHeader" />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    AppFooter
  },
  computed: {
    showHeader() {
      const publicPaths = ["/login", "/forgot-password"];
      return !publicPaths.includes(this.$route.path);
    },
    showFooter() {
      const publicPaths = ["/login", "/forgot-password"];
      return !publicPaths.includes(this.$route.path);
    }
  }
};
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  padding: 2rem;
  flex: 1;
}

.app-header {
  background-color: #1e3a8a;
  color: #fff;
  padding: 1rem 0;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav {
  display: flex;
}

.nav-link {
  color: #fff;
  margin-left: 1rem;
  text-decoration: none;
  padding: 0.5rem;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.container {
  width: 90%;
  margin: 0 auto;
}
</style>
