// Main navigation component used across all pages
<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <AppNavbar />

  <main>
    <RouterView />
  </main>
</template>
