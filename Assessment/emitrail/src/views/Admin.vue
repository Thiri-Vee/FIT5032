<script setup>
import { getCurrentUser } from '../auth/auth.js'

const currentUser = getCurrentUser()
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="card p-4 shadow-sm">
          <h1 class="h3 mb-3">Admin Dashboard</h1>

          <p v-if="currentUser">Welcome, {{ currentUser.name }}.</p>

          <p>This page is only available to users with the admin role.</p>
        </div>
      </div>
    </div>
  </div>
</template>
