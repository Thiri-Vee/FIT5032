<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3 text-center">
        <h1 class="text-danger mb-3">Access Denied</h1>

        <p class="mb-4">You must be logged in to access this page.</p>

        <button class="btn btn-primary me-2" @click="goToLogin">Go to Login</button>

        <button class="btn btn-secondary" @click="goHome">Go Home</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
