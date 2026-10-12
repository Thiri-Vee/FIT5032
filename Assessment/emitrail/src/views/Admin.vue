<script setup>
import { getCurrentUser } from '../auth/auth.js'
import AppIcon from '../components/AppIcon.vue'

// Get the current logged-in user
import { currentUser } from '../auth/auth.js'

// Areas the admin dashboard will manage
const adminAreas = [
  { icon: 'users', title: 'Members', text: 'Review registered accounts and roles.' },
  { icon: 'star', title: 'Ratings & reviews', text: 'Moderate community feedback on places.' },
  { icon: 'award', title: 'Challenges', text: 'Create and manage community challenges.' },
]
</script>

<template>
  <div class="container py-5 admin-page">
    <div class="row justify-content-center">
      <!-- Responsive admin card width -->
      <div class="col-12 col-sm-11 col-md-10 col-lg-9">
        <div class="card border-0 p-4 p-md-5 shadow-sm admin-card">
          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="icon-tile">
              <AppIcon name="shield" />
            </span>
            <div>
              <h1 class="h3 mb-0">Admin Dashboard</h1>
              <p class="text-muted mb-0" v-if="currentUser">Welcome, {{ currentUser.name }}.</p>
            </div>
          </div>

          <p class="mb-4">
            This page is only available to users with the admin role. Management tools appear here.
          </p>

          <div class="row g-3">
            <div v-for="area in adminAreas" :key="area.title" class="col-12 col-md-4">
              <div class="border rounded-3 p-3 h-100">
                <span class="icon-tile mb-2">
                  <AppIcon :name="area.icon" />
                </span>
                <h2 class="h6 fw-bold mb-1">{{ area.title }}</h2>
                <p class="small text-muted mb-0">{{ area.text }}</p>
              </div>
            </div>
          </div>
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
