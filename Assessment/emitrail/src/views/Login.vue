
<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/init.js'

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
const isSubmitting = ref(false)

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

// BR D.1 - Login using Firebase Authentication
const handleLogin = async () => {
  if (!validateForm() || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    await signInWithEmailAndPassword(
      auth,
      form.email.trim(),
      form.password
    )

    message.value = ''
    await router.push('/')

  } catch (error) {
    console.error('Firebase login error:', error.code)

    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      message.value = 'Invalid email or password.'
    } else if (error.code === 'auth/invalid-email') {
      message.value = 'Please enter a valid email address.'
    } else if (error.code === 'auth/too-many-requests') {
      message.value = 'Too many login attempts. Please try again later.'
    } else {
      message.value = 'Login failed. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>


<template>
  <div class="container py-5 login-page">
    <div class="row justify-content-center align-items-stretch g-0 shadow-sm auth-shell">
      <!-- Welcome panel -->
      <div class="col-lg-5 d-none d-lg-block">
        <div class="auth-aside h-100 text-white p-4 d-flex flex-column justify-content-between">
          <div>
            <p class="eyebrow text-white-50 mb-2">Welcome back</p>
            <h2 class="brand-font fw-bold">Pick up where you left off</h2>
            <p class="mb-0 text-white-50">
              Log in to record journeys, follow your climate impact and join community challenges.
            </p>
          </div>
          <img src="/images/auth-side.svg" alt="" class="auth-aside-img mt-3" />
        </div>
      </div>

      <!-- Login form -->
      <div class="col-12 col-sm-10 col-md-8 col-lg-7">
        <div class="card border-0 p-4 p-md-5 login-card h-100">
          <h1 class="h3 mb-1">Log in</h1>
          <p class="text-muted mb-4">Enter your details to continue.</p>

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
/* Rounded outer container that holds the panel and the form */
.auth-shell {
  max-width: 940px;
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

/* Login card styling */
.login-card {
  border-radius: 0;
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
