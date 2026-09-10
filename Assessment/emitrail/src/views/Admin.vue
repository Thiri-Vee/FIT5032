<script setup>
import { getCurrentUser } from '../auth/auth.js'

// Get the current logged-in user
const currentUser = getCurrentUser()
</script>

<template>
  <div class="container py-5 admin-page">
    <div class="row justify-content-center">
      <!-- Responsive admin card width -->
      <div class="col-12 col-sm-11 col-md-9 col-lg-8 col-xl-7">
        <div class="card p-4 shadow-sm admin-card">
          <h1 class="h3 mb-3">Admin Dashboard</h1>

          <p v-if="currentUser">Welcome, {{ currentUser.name }}.</p>

          <p class="mb-0">This page is only available to users with the admin role.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Admin card styling */
.admin-card {
  border-radius: 10px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .admin-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .admin-card {
    padding: 20px !important;
  }
}
</style>
