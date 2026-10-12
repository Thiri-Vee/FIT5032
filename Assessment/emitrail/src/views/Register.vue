
<script setup>
import { reactive, ref } from 'vue'
import {createUserWithEmailAndPassword,updateProfile,sendEmailVerification,} from 'firebase/auth'
import { auth } from '../firebase/init.js'

// Existing BR C security functions
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
const isSubmitting = ref(false)

// Keep existing BR B and C validation
const validateForm = () => {
  let isValid = true

  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  message.value = ''

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
    isValid = false
  } else if (containsUnsafeContent(form.name)) {
    errors.name = 'Name contains invalid content.'
    isValid = false
  }

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

// BR D.1 - Register with Firebase Authentication
const handleRegister = async () => {
  if (!validateForm() || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  const safeName = sanitizeText(form.name)
  const safeEmail = sanitizeText(form.email).trim()

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      safeEmail,
      form.password
    )

    // Store the user's display name in Firebase Auth
    await updateProfile(userCredential.user, {
      displayName: safeName,
    })
    await sendEmailVerification(userCredential.user)

    message.value = 'Account created successfully! Please check your inbox to verify your email address.'

    form.name = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''

  } catch (error) {
    console.error('Firebase registration error:', error.code)

    if (error.code === 'auth/email-already-in-use') {
      message.value = 'An account with this email already exists.'
    } else if (error.code === 'auth/invalid-email') {
      message.value = 'Please enter a valid email address.'
    } else if (error.code === 'auth/weak-password') {
      message.value = 'Please choose a stronger password.'
    } else {
      message.value = 'Registration failed. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>


<template>
  <div class="container py-5 register-page">
    <div class="row justify-content-center align-items-stretch g-0 shadow-sm auth-shell">
      <!-- Welcome panel -->
      <div class="col-lg-5 d-none d-lg-block">
        <div class="auth-aside h-100 text-white p-4 d-flex flex-column justify-content-between">
          <div>
            <p class="eyebrow text-white-50 mb-2">Join Emitrail</p>
            <h2 class="brand-font fw-bold">Turn everyday trips into climate action</h2>
            <ul class="list-unstyled d-grid gap-2 mt-3 mb-0 text-white-50">
              <li>• Compare the impact of every journey</li>
              <li>• Track distance, trips and emissions avoided</li>
              <li>• Join challenges and earn milestone badges</li>
            </ul>
          </div>
          <img src="/images/auth-side.svg" alt="" class="auth-aside-img mt-3" />
        </div>
      </div>

      <!-- Registration form -->
      <div class="col-12 col-sm-11 col-md-9 col-lg-7">
        <div class="card border-0 p-4 p-md-5 register-card h-100">
          <h1 class="h3 mb-1">Create your account</h1>
          <p class="text-muted mb-4">It only takes a minute.</p>

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
/* Rounded outer container that holds the panel and the form */
.auth-shell {
  max-width: 980px;
  margin-inline: auto;
  border-radius: 16px;
  overflow: hidden;
}

/* Green welcome panel */
.auth-aside {
  background-color: var(--brand-green-dark);
}

.auth-aside-img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

/* Registration card styling */
.register-card {
  border-radius: 0;
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
