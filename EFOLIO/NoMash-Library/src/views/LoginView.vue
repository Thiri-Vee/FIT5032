<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../auth'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Handle login
const login = () => {
  // Hardcoded credentials for Week 5 activity
  if (username.value === 'admin' && password.value === 'password') {
    // Update shared authentication state
    loginUser()

    errorMessage.value = ''

    // Redirect successful user to About page
    router.push('/about')
  } else {
    errorMessage.value = 'Invalid username or password.'
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="text-center mb-4">Login</h1>

        <form @submit.prevent="login">
          <!-- Username -->
          <div class="mb-3">
            <label for="loginUsername" class="form-label"> Username </label>

            <input
              id="loginUsername"
              v-model="username"
              type="text"
              class="form-control"
              required
            />
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label for="loginPassword" class="form-label"> Password </label>

            <input
              id="loginPassword"
              v-model="password"
              type="password"
              class="form-control"
              required
            />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <!-- Login Button -->
          <div class="text-center">
            <button type="submit" class="btn btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
