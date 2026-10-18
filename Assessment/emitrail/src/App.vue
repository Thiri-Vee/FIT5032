//added keyboard navigation
<script setup>
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <!-- BR E.3: Keyboard accessibility -->
  <a href="#main-content" class="skip-link">
    Skip to Main Content
  </a>

  <AppNavbar />

  <main id="main-content" tabindex="-1">
    <RouterView />
  </main>

  <AppFooter />
</template>

<style scoped>
/* Hide skip link until keyboard focus */
.skip-link {
  position: fixed;
  top: -100px;
  left: 16px;
  z-index: 9999;
  padding: 12px 20px;
  background-color: #14532d;
  color: #ffffff;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
}

/* Show skip link when pressing Tab */
.skip-link:focus {
  top: 16px;
  outline: 3px solid #facc15;
  outline-offset: 3px;
}
</style>
