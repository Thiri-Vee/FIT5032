
<script setup>
import { reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/init.js'

const router = useRouter()

// --------------------------------------------------
// BR D.1 - Login form
// --------------------------------------------------

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const message = ref('')
const isSubmitting = ref(false)

// BR E.3 - Input references for keyboard focus
const emailInput = ref(null)
const passwordInput = ref(null)

// --------------------------------------------------
// BR E.3 - Accessible validation
// --------------------------------------------------

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

const focusFirstError = async () => {
  await nextTick()

  if (errors.email) {
    emailInput.value?.focus()
  } else if (errors.password) {
    passwordInput.value?.focus()
  }
}

const clearError = (field) => {
  errors[field] = ''
  message.value = ''
}

// --------------------------------------------------
// BR D.1 - Firebase Authentication
// --------------------------------------------------

const handleLogin = async () => {
  if (isSubmitting.value) return

  if (!validateForm()) {
    await focusFirstError()
    return
  }

  isSubmitting.value = true

  try {
    await signInWithEmailAndPassword(
      auth,
      form.email.trim(),
      form.password,
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
      message.value =
        'Too many login attempts. Please try again later.'
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
    <div
      class="row justify-content-center align-items-stretch g-0 shadow-sm auth-shell"
    >

      <!-- Welcome panel -->
      <div class="col-lg-5 d-none d-lg-block">
        <div
          class="auth-aside h-100 text-white p-4 d-flex flex-column justify-content-between"
        >
          <div>
            <p class="eyebrow text-white-50 mb-2">
              Welcome back
            </p>

            <h2 class="brand-font fw-bold">
              Pick up where you left off
            </h2>

            <p class="mb-0 text-white-50">
              Log in to record journeys, follow your climate
              impact and join community challenges.
            </p>
          </div>

          <!-- Decorative illustration -->
          <img
            src="/images/auth-side.svg"
            alt=""
            class="auth-aside-img mt-3"
          />
        </div>
      </div>

      <!-- Login form -->
      <div class="col-12 col-sm-10 col-md-8 col-lg-7">
        <div class="card border-0 p-4 p-md-5 login-card h-100">

          <h1
            id="login-heading"
            class="h3 mb-1"
          >
            Log in
          </h1>

          <p
            id="login-description"
            class="text-muted mb-4"
          >
            Enter your details to continue.
          </p>

          <form
            aria-labelledby="login-heading"
            aria-describedby="login-description"
            novalidate
            @submit.prevent="handleLogin"
          >

            <!-- Email -->
            <div class="mb-3">

              <label
                for="loginEmail"
                class="form-label"
              >
                Email
              </label>

              <input
                id="loginEmail"
                ref="emailInput"
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                :aria-invalid="Boolean(errors.email)"
                :aria-describedby="
                  errors.email ? 'login-email-error' : undefined
                "
                :disabled="isSubmitting"
                @input="clearError('email')"
              />

              <div
                v-if="errors.email"
                id="login-email-error"
                class="invalid-feedback d-block"
              >
                {{ errors.email }}
              </div>

            </div>

            <!-- Password -->
            <div class="mb-4">

              <label
                for="loginPassword"
                class="form-label"
              >
                Password
              </label>

              <input
                id="loginPassword"
                ref="passwordInput"
                v-model="form.password"
                type="password"
                name="password"
                autocomplete="current-password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                :aria-invalid="Boolean(errors.password)"
                :aria-describedby="
                  errors.password ? 'login-password-error' : undefined
                "
                :disabled="isSubmitting"
                @input="clearError('password')"
              />

              <div
                v-if="errors.password"
                id="login-password-error"
                class="invalid-feedback d-block"
              >
                {{ errors.password }}
              </div>

            </div>

            <!-- Login button -->
            <button
              type="submit"
              class="btn btn-success w-100"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? 'Logging in...'
                  : 'Login'
              }}
            </button>

          </form>

          <!-- Firebase login error -->
          <p
            v-if="message"
            class="alert alert-danger text-center mt-3 mb-0"
            role="alert"
          >
            {{ message }}
          </p>

          <!-- Loading announcement -->
          <p
            class="visually-hidden"
            role="status"
            aria-live="polite"
          >
            {{ isSubmitting ? 'Logging in. Please wait.' : '' }}
          </p>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Rounded outer container */
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

/* Inputs */
.form-control {
  min-height: 48px;
}

/* BR E.3 - Visible keyboard focus */
.login-page input:focus-visible,
.login-page button:focus-visible,
.login-page a:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

/* Error styling */
.form-control.is-invalid {
  border-color: #b42318;
}

.invalid-feedback {
  color: #b42318;
  font-size: 0.875rem;
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
