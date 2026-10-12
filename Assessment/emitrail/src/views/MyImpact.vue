
<script setup>
import { ref } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import AppIcon from '../components/AppIcon.vue'
import { currentUser } from '../auth/auth.js'
import { auth } from '../firebase/init.js'

// Headline metrics for the Climate Impact Dashboard
const stats = [
  { icon: 'route', label: 'Active distance', value: '0', unit: 'km logged' },
  { icon: 'check', label: 'Sustainable trips', value: '0', unit: 'journeys' },
  { icon: 'leaf', label: 'Emissions avoided', value: '0.0', unit: 'kg CO₂ vs car' },
  { icon: 'award', label: 'Badges earned', value: '0', unit: 'milestones' },
]

// Dashboard sections
const sections = [
  {
    icon: 'chart',
    title: 'Impact dashboard',
    text: 'See your accumulated distance, trips and estimated emissions avoided compared with the same journeys by car.',
  },
  {
    icon: 'clock',
    title: 'Travel history',
    text: 'Review every journey you have logged, with date, mode, distance and estimated emissions.',
  },
  {
    icon: 'download',
    title: 'Export your records',
    text: 'Download your personal travel history as a CSV file for further analysis or your own records.',
  },
]

// BR D.2 - Email with PDF Attachment
const isSending = ref(false)
const emailMessage = ref('')
const emailError = ref(false)

// Send the climate impact report using Firebase Cloud Functions
const sendReport = async () => {
  if (isSending.value) return

  emailMessage.value = ''
  emailError.value = false

  if (!auth.currentUser) {
    emailMessage.value = 'Please log in to email your report.'
    emailError.value = true
    return
  }

  isSending.value = true

  try {
    // Refresh Firebase authentication token
    await auth.currentUser.getIdToken(true)

    // Connect to the deployed Firebase Cloud Function
    const functions = getFunctions(undefined, 'us-central1')
    const sendImpactReport = httpsCallable(functions, 'sendImpactReport')

    // Request the PDF email
    const result = await sendImpactReport()

    emailMessage.value =
      result.data.message || 'Your report email has been requested successfully.'
  } catch (error) {
    console.error('Email report error:', error.code, error.message)
    emailError.value = true

    if (error.code === 'functions/failed-precondition') {
      emailMessage.value =
        'Please verify your email address before requesting a report.'
    } else if (error.code === 'functions/unauthenticated') {
      emailMessage.value = 'Please log in again.'
    } else if (error.code === 'functions/resource-exhausted') {
      emailMessage.value = 'Too many requests. Please try again later.'
    } else {
      emailMessage.value = 'Unable to send your report. Please try again.'
    }
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="impact-page">
    <!-- Hero -->
    <section class="container py-5">
      <div class="row align-items-center g-4 g-lg-5">
        <div class="col-12 col-lg-7">
          <p class="eyebrow mb-2">My impact</p>
          <h1 class="fw-bold mb-3">Your climate impact dashboard</h1>
          <p class="lead text-muted mb-4">
            Log your walking, cycling and public transport journeys and watch your contribution grow
            — distance covered, trips taken and emissions avoided, all in one place.
          </p>

          <RouterLink
            v-if="!currentUser"
            to="/login"
            class="btn btn-brand btn-lg d-inline-flex align-items-center gap-2"
          >
            Log in to start tracking
            <AppIcon name="arrow" :size="18" />
          </RouterLink>

          <RouterLink
            v-else
            to="/compare"
            class="btn btn-brand btn-lg d-inline-flex align-items-center gap-2"
          >
            Log a journey
            <AppIcon name="arrow" :size="18" />
          </RouterLink>
        </div>

        <div class="col-12 col-lg-5">
          <img
            src="/images/impact-hero.svg"
            alt="Rising climate impact dashboard"
            class="illustration"
          />
        </div>
      </div>
    </section>

    <!-- Stat cards -->
    <section class="section-soft border-top border-bottom py-5">
      <div class="container">
        <div class="row g-4">
          <div v-for="stat in stats" :key="stat.label" class="col-6 col-lg-3">
            <div class="card h-100 border-0 shadow-sm text-center">
              <div class="card-body p-4">
                <span class="icon-tile mb-3">
                  <AppIcon :name="stat.icon" />
                </span>
                <div class="display-6 fw-bold">{{ stat.value }}</div>
                <div class="fw-semibold">{{ stat.label }}</div>
                <div class="small text-muted">{{ stat.unit }}</div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!currentUser" class="small text-muted text-center mt-4 mb-0">
          These update automatically once you log in and start logging journeys.
        </p>
      </div>
    </section>

    <!-- What's tracked -->
    <section class="container py-5">
      <div class="row justify-content-center text-center mb-4">
        <div class="col-12 col-lg-8">
          <p class="eyebrow mb-2">What you can track</p>
          <h2 class="fw-bold">From a single trip to a lasting habit</h2>
        </div>
      </div>

      <div class="row g-4">
        <div v-for="section in sections" :key="section.title" class="col-12 col-md-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <span class="icon-tile mb-3">
                <AppIcon :name="section.icon" />
              </span>
              <h3 class="h5 fw-bold">{{ section.title }}</h3>
              <p class="text-muted mb-0">{{ section.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BR D.2 - Email with PDF Attachment -->
    <section class="container py-5 border-top">
      <div class="row justify-content-center">
        <div class="col-12 col-md-9 col-lg-7">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="icon-tile">
                  <AppIcon name="download" />
                </span>
                <div>
                  <h2 class="h4 fw-bold mb-0">
                    Email My Climate Impact Report
                  </h2>
                </div>
              </div>

              <p class="text-muted mb-4">
                Receive your current Emitrail climate impact summary
                as a PDF attachment directly in your email inbox.
              </p>

              <template v-if="currentUser">
                <p class="small mb-3">
                  Report will be sent to:
                  <strong>{{ currentUser.email }}</strong>
                </p>

                <button
                  type="button"
                  class="btn btn-brand"
                  :disabled="isSending"
                  @click="sendReport"
                >
                  {{ isSending ? 'Sending report...' : 'Email My Report' }}
                </button>
              </template>

              <RouterLink
                v-else
                to="/login"
                class="btn btn-brand"
              >
                Log in to Email Report
              </RouterLink>

              <!-- Success or error message -->
              <div
                v-if="emailMessage"
                class="alert mt-3 mb-0"
                :class="emailError ? 'alert-danger' : 'alert-success'"
                role="status"
              >
                {{ emailMessage }}
              </div>

              <p class="small text-muted mt-3 mb-0">
                The PDF contains the current dashboard summary.
                Journey tracking is not yet connected to saved travel records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Mobile screens */
@media (max-width: 575.98px) {
  h1 {
    font-size: 1.9rem;
  }

  .display-6 {
    font-size: 1.8rem;
  }
}
</style>
