<script setup>
import { reactive, ref } from 'vue'
import { loginUser } from '../auth/auth'

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const message = ref('')

// Validate the login form
const validateForm = () => {
  let isValid = true

  errors.email = ''
  errors.password = ''
  message.value = ''

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    isValid = false
  }

  return isValid
}

// Check the user account and log the user in
const handleLogin = () => {
  if (!validateForm()) {
    return
  }

  const result = loginUser(form.email.trim(), form.password)

  if (!result.success) {
    message.value = 'Invalid email or password.'
    return
  }

  message.value = `Welcome, ${result.user.name}!`
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-5">
        <div class="card p-4 shadow-sm">
          <h1 class="h3 text-center mb-4">Login</h1>

          <form @submit.prevent="handleLogin" novalidate>
            <div class="mb-3">
              <label for="loginEmail" class="form-label"> Email </label>

              <input
                id="loginEmail"
                v-model="form.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
              />

              <div class="invalid-feedback">
                {{ errors.email }}
              </div>
            </div>

            <div class="mb-3">
              <label for="loginPassword" class="form-label"> Password </label>

              <input
                id="loginPassword"
                v-model="form.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
              />

              <div class="invalid-feedback">
                {{ errors.password }}
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100">Login</button>
          </form>

          <p v-if="message" class="text-center mt-3 mb-0">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
