
<script setup>
import { reactive, ref, nextTick } from 'vue'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth'
import { auth } from '../firebase/init.js'

// Existing BR C security functions
import {
  containsUnsafeContent,
  sanitizeText,
} from '../security/security.js'

// --------------------------------------------------
// Registration form
// --------------------------------------------------

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
const messageIsError = ref(false)
const isSubmitting = ref(false)

// BR E.3 - Input references for keyboard focus
const nameInput = ref(null)
const emailInput = ref(null)
const passwordInput = ref(null)
const confirmPasswordInput = ref(null)

// --------------------------------------------------
// BR B and C - Existing validation and security
// --------------------------------------------------

const validateForm = () => {
  let isValid = true

  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  message.value = ''
  messageIsError.value = false

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

// --------------------------------------------------
// BR E.3 - Accessible validation
// --------------------------------------------------

const focusFirstError = async () => {
  await nextTick()

  if (errors.name) {
    nameInput.value?.focus()
  } else if (errors.email) {
    emailInput.value?.focus()
  } else if (errors.password) {
    passwordInput.value?.focus()
  } else if (errors.confirmPassword) {
    confirmPasswordInput.value?.focus()
  }
}

const clearError = (field) => {
  errors[field] = ''

  if (messageIsError.value) {
    message.value = ''
    messageIsError.value = false
  }
}

// --------------------------------------------------
// BR D.1 - Firebase Authentication registration
// --------------------------------------------------

const handleRegister = async () => {
  if (isSubmitting.value) return

  if (!validateForm()) {
    await focusFirstError()
    return
  }

  isSubmitting.value = true

  const safeName = sanitizeText(form.name)
  const safeEmail = sanitizeText(form.email).trim()

  let accountCreated = false

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      safeEmail,
      form.password,
    )

    accountCreated = true

    await updateProfile(userCredential.user, {
      displayName: safeName,
    })

    await sendEmailVerification(userCredential.user)

    message.value =
      'Account created successfully! Please check your inbox to verify your email address.'

    messageIsError.value = false

    form.name = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''

  } catch (error) {
    console.error('Firebase registration error:', error.code)

    messageIsError.value = true

    if (accountCreated) {
      message.value =
        'Your account was created, but we could not complete the profile or verification email step. Please try signing in and check your verification status.'
    } else if (error.code === 'auth/email-already-in-use') {
      message.value =
        'An account with this email already exists.'
    } else if (error.code === 'auth/invalid-email') {
      message.value =
        'Please enter a valid email address.'
    } else if (error.code === 'auth/weak-password') {
      message.value =
        'Please choose a stronger password.'
    } else {
      message.value =
        'Registration failed. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container py-5 register-page">

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
              Join Emitrail
            </p>

            <h2 class="brand-font fw-bold">
              Turn everyday trips into climate action
            </h2>

            <ul class="list-unstyled d-grid gap-2 mt-3 mb-0 text-white-50">
              <li>• Compare the impact of every journey</li>
              <li>• Track distance, trips and emissions avoided</li>
              <li>• Join challenges and earn milestone badges</li>
            </ul>

          </div>

          <img
            src="/images/auth-side.svg"
            alt=""
            class="auth-aside-img mt-3"
          />

        </div>
      </div>

      <!-- Registration form -->
      <div class="col-12 col-sm-11 col-md-9 col-lg-7">

        <div class="card border-0 p-4 p-md-5 register-card h-100">

          <h1
            id="register-heading"
            class="h3 mb-1"
          >
            Create your account
          </h1>

          <p
            id="register-description"
            class="text-muted mb-4"
          >
            It only takes a minute.
          </p>

          <form
            aria-labelledby="register-heading"
            aria-describedby="register-description"
            novalidate
            @submit.prevent="handleRegister"
          >

            <!-- Name -->
            <div class="mb-3">

              <label
                for="name"
                class="form-label"
              >
                Name
              </label>

              <input
                id="name"
                ref="nameInput"
                v-model="form.name"
                type="text"
                name="name"
                autocomplete="name"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                :aria-invalid="Boolean(errors.name)"
                :aria-describedby="
                  errors.name ? 'register-name-error' : undefined
                "
                :disabled="isSubmitting"
                @input="clearError('name')"
              />

              <div
                v-if="errors.name"
                id="register-name-error"
                class="invalid-feedback d-block"
              >
                {{ errors.name }}
              </div>

            </div>

            <!-- Email -->
            <div class="mb-3">

              <label
                for="email"
                class="form-label"
              >
                Email
              </label>

              <input
                id="email"
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
                  errors.email ? 'register-email-error' : undefined
                "
                :disabled="isSubmitting"
                @input="clearError('email')"
              />

              <div
                v-if="errors.email"
                id="register-email-error"
                class="invalid-feedback d-block"
              >
                {{ errors.email }}
              </div>

            </div>

            <!-- Password -->
            <div class="mb-3">

              <label
                for="password"
                class="form-label"
              >
                Password
              </label>

              <input
                id="password"
                ref="passwordInput"
                v-model="form.password"
                type="password"
                name="password"
                autocomplete="new-password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                :aria-invalid="Boolean(errors.password)"
                :aria-describedby="
                  errors.password
                    ? 'register-password-hint register-password-error'
                    : 'register-password-hint'
                "
                :disabled="isSubmitting"
                @input="clearError('password')"
              />

              <p
                id="register-password-hint"
                class="small text-muted mt-1 mb-0"
              >
                Password must be at least 6 characters.
              </p>

              <div
                v-if="errors.password"
                id="register-password-error"
                class="invalid-feedback d-block"
              >
                {{ errors.password }}
              </div>

            </div>

            <!-- Confirm password -->
            <div class="mb-4">

              <label
                for="confirmPassword"
                class="form-label"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                ref="confirmPasswordInput"
                v-model="form.confirmPassword"
                type="password"
                name="confirmPassword"
                autocomplete="new-password"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                :aria-invalid="Boolean(errors.confirmPassword)"
                :aria-describedby="
                  errors.confirmPassword
                    ? 'register-confirm-password-error'
                    : undefined
                "
                :disabled="isSubmitting"
                @input="clearError('confirmPassword')"
              />

              <div
                v-if="errors.confirmPassword"
                id="register-confirm-password-error"
                class="invalid-feedback d-block"
              >
                {{ errors.confirmPassword }}
              </div>

            </div>

            <!-- Register button -->
            <button
              type="submit"
              class="btn btn-success w-100"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? 'Creating account...'
                  : 'Register'
              }}
            </button>

            <!-- Registration feedback -->
            <p
              v-if="message"
              class="alert text-center mt-3 mb-0"
              :class="
                messageIsError
                  ? 'alert-danger'
                  : 'alert-success'
              "
              :role="messageIsError ? 'alert' : 'status'"
            >
              {{ message }}
            </p>

            <!-- Screen-reader loading announcement -->
            <p
              class="visually-hidden"
              role="status"
              aria-live="polite"
            >
              {{
                isSubmitting
                  ? 'Creating your account. Please wait.'
                  : ''
              }}
            </p>

          </form>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Rounded outer container */
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

/* Inputs */
.form-control {
  min-height: 48px;
}

/* BR E.3 - Visible keyboard focus */
.register-page input:focus-visible,
.register-page button:focus-visible,
.register-page a:focus-visible {
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
  .register-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .register-card {
    padding: 20px !important;
  }
}
</style>
