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
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-5">
        <div class="card p-4 shadow-sm">
          <h1 class="h3 text-center mb-4">Register</h1>

          <form @submit.prevent="handleRegister" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>

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

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>

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

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>

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

            <div class="mb-3">
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

            <button type="submit" class="btn btn-success w-100">Register</button>
          </form>

          <p v-if="message" class="text-center mt-3 mb-0">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
