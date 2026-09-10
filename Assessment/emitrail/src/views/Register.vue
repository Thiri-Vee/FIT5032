<script setup>
import { reactive, ref } from 'vue'
import { registerUser } from '../auth/auth.js'
//calling security info
import { containsUnsafeContent, sanitizeText } from '../security/security.js'
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const message = ref('')

// Validate the registration form
const validateForm = () => {
  let isValid = true

  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  message.value = ''

  //updated validation requirement
  if (!form.name.trim()) {
    errors.name = 'Name is required.'
    isValid = false
  } else if (containsUnsafeContent(form.name)) {
    errors.name = 'Name contains invalid content.'
    isValid = false
  }
  //updated email validation for unsafe content and missing @ characters
  if (!form.email.trim()) {
    errors.email = 'Email is required.'
    isValid = false
  } else if (containsUnsafeContent(form.email)) {
    errors.email = 'Email contains invalid content.'
    isValid = false
  } else if (!form.email.includes('@')) {
    errors.email = 'Please enter a valid email.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
    isValid = false
  }

  return isValid
}

// Register the new user
const handleRegister = () => {
  if (!validateForm()) {
    return
  }

  const safeName = sanitizeText(form.name)
  const safeEmail = sanitizeText(form.email)

  const result = registerUser(safeName, safeEmail, form.password)
  //const result = registerUser(form.name.trim(), form.email.trim(), form.password)

  message.value = result.message

  if (result.success) {
    form.name = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
  }
}
</script>

<template>
  <div class="container py-5 register-page">
    <div class="row justify-content-center">
      <!-- Responsive registration form width -->
      <div class="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-6">
        <div class="card p-4 shadow-sm register-card">
          <h1 class="h3 text-center mb-4">Register</h1>

          <form @submit.prevent="handleRegister" novalidate>
            <!-- Name -->
            <div class="mb-3">
              <label for="name" class="form-label"> Name </label>

              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
              />

              <div class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label"> Email </label>

              <input
                id="email"
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
            <div class="mb-3">
              <label for="password" class="form-label"> Password </label>

              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
              />

              <div class="invalid-feedback">
                {{ errors.password }}
              </div>
            </div>

            <!-- Confirm password -->
            <div class="mb-4">
              <label for="confirmPassword" class="form-label"> Confirm Password </label>

              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
              />

              <div class="invalid-feedback">
                {{ errors.confirmPassword }}
              </div>
            </div>

            <!-- Register button -->
            <button type="submit" class="btn btn-success w-100">Register</button>

            <!-- Registration message -->
            <p v-if="message" class="text-center mt-3 mb-0">
              {{ message }}
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Registration card styling */
.register-card {
  border-radius: 10px;
}

/* Make form fields easier to use */
.form-control {
  min-height: 48px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .register-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .register-card {
    padding: 20px !important;
  }
}
</style>
