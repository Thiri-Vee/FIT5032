<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../auth/auth.js'

const router = useRouter()

// Store login form values
const form = reactive({
  email: '',
  password: '',
})

// Store validation messages
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

  // Reload the app so the navbar updates immediately
  router.push('/')
  window.location.reload()
}
</script>

<template>
  <div class="container py-5 login-page">
    <div class="row justify-content-center">
      <!-- Responsive login form width -->
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div class="card p-4 shadow-sm login-card">
          <h1 class="h3 text-center mb-4">Login</h1>

          <form @submit.prevent="handleLogin" novalidate>
            <!-- Email -->
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

            <!-- Password -->
            <div class="mb-4">
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

            <!-- Login button -->
            <button type="submit" class="btn btn-success w-100">Login</button>
          </form>

          <!-- Login error message -->
          <p v-if="message" class="text-center mt-3 mb-0">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Login card styling */
.login-card {
  border-radius: 10px;
}

/* Make inputs easier to use */
.form-control {
  min-height: 48px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .login-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .login-card {
    padding: 20px !important;
  }
}
</style>
