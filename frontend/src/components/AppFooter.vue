<template>
  <footer class="app-footer">
    <div class="container">
      <p>&copy; 2025 Kütüphane Yönetim Sistemi</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter"
};
</script>

<style scoped>
.app-footer {
  background-color: #1e3a8a;
  color: #fff;
  text-align: center;
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 0.75rem 0;
  }
}
</style>
