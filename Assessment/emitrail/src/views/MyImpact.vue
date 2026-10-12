
<script setup>
import { computed, ref, watch } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, getDocs, query, where } from 'firebase/firestore'
import AppIcon from '../components/AppIcon.vue'
import InteractiveTable from '../components/InteractiveTable.vue'
import { currentUser } from '../auth/auth.js'
import { auth, db } from '../firebase/init.js'

// --------------------------------------------------
// BR D.3 - Interactive Travel History Table
// --------------------------------------------------

const journeys = ref([])
const loadingJourneys = ref(false)
const journeyError = ref('')

const journeyColumns = [
  { key: 'date', label: 'Date' },
  { key: 'mode', label: 'Travel Mode' },
  { key: 'distanceKm', label: 'Distance (km)' },
  { key: 'co2SavedKg', label: 'CO₂ Saved (kg)' },
]

// Track requests so older results cannot overwrite newer ones
let latestRequestId = 0

async function loadJourneys(user) {
  const requestId = ++latestRequestId

  journeys.value = []
  journeyError.value = ''

  if (!user?.uid) {
    loadingJourneys.value = false
   // console.log('No signed-in user available for journey loading')
    return
  }

  loadingJourneys.value = true

  //console.log('Starting journey query for UID:', user.uid)

  try {
    const journeysQuery = query(
      collection(db, 'journeys'),
      where('userId', '==', user.uid),
    )

    const snapshot = await getDocs(journeysQuery)

    // Debugging: check whether Firestore returned documents
    //console.log('Firestore documents found:', snapshot.size)
    //console.log('Firebase Auth UID:', auth.currentUser?.uid)
    //console.log('Query UID:', user.uid)
    //console.log('Reactive UID:', currentUser.value?.uid)

    // Ignore outdated requests or a changed Firebase account
    if (
      requestId !== latestRequestId ||
      auth.currentUser?.uid !== user.uid
    ) {
      //console.log('Ignoring outdated journey query result')
      return
    }

    journeys.value = snapshot.docs.map((document) => {
      const data = document.data()

      // ISO date format sorts correctly in the interactive table
      let formattedDate = ''

      if (data.date?.toDate) {
        const date = data.date.toDate()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        formattedDate = `${year}-${month}-${day}`
      } else if (data.date) {
        formattedDate = String(data.date).slice(0, 10)
      }

      return {
        id: document.id,
        date: formattedDate,
        mode: data.mode ?? '',
        distanceKm: Number(data.distanceKm ?? 0),
        co2SavedKg: Number(data.co2SavedKg ?? 0),
      }
    })

    //console.log('Journeys loaded into table:', journeys.value.length)
  } catch (error) {
    console.error('Error loading journeys:', error)

    if (requestId === latestRequestId) {
      journeyError.value =
        'Unable to load your journeys. Please try again.'
    }
  } finally {
    if (requestId === latestRequestId) {
      loadingJourneys.value = false
    }
  }
}

// Load journeys whenever the signed-in user changes
watch(
  () => currentUser.value?.uid,
  () => {
    loadJourneys(currentUser.value)
  },
  { immediate: true },
)

// --------------------------------------------------
// Dynamic Climate Impact Dashboard Statistics
// --------------------------------------------------

const stats = computed(() => {
  const totalDistance = journeys.value.reduce(
    (sum, journey) => sum + Number(journey.distanceKm || 0),
    0,
  )

  const totalEmissionsSaved = journeys.value.reduce(
    (sum, journey) => sum + Number(journey.co2SavedKg || 0),
    0,
  )

  return [
    {
      icon: 'route',
      label: 'Active distance',
      value: totalDistance.toFixed(1),
      unit: 'km logged',
    },
    {
      icon: 'check',
      label: 'Sustainable trips',
      value: String(journeys.value.length),
      unit: 'journeys',
    },
    {
      icon: 'leaf',
      label: 'Emissions avoided',
      value: totalEmissionsSaved.toFixed(2),
      unit: 'kg CO₂ vs car',
    },
    {
      icon: 'award',
      label: 'Badges earned',
      value: '0',
      unit: 'milestones',
    },
  ]
})

// --------------------------------------------------
// Existing Dashboard Sections
// --------------------------------------------------

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

// --------------------------------------------------
// BR D.2 - Email with PDF Attachment
// --------------------------------------------------

const isSending = ref(false)
const emailMessage = ref('')
const emailError = ref(false)

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
    await auth.currentUser.getIdToken(true)

    const functions = getFunctions(undefined, 'us-central1')
    const sendImpactReport = httpsCallable(
      functions,
      'sendImpactReport',
    )

    const result = await sendImpactReport()

    emailMessage.value =
      result.data.message ||
      'Your report email has been requested successfully.'
  } catch (error) {
    console.error('Email report error:', error.code, error.message)
    emailError.value = true

    if (error.code === 'functions/failed-precondition') {
      emailMessage.value =
        'Please verify your email address before requesting a report.'
    } else if (error.code === 'functions/unauthenticated') {
      emailMessage.value = 'Please log in again.'
    } else if (error.code === 'functions/resource-exhausted') {
      emailMessage.value =
        'Too many requests. Please try again later.'
    } else {
      emailMessage.value =
        'Unable to send your report. Please try again.'
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

          <h1 class="fw-bold mb-3">
            Your climate impact dashboard
          </h1>

          <p class="lead text-muted mb-4">
            Log your walking, cycling and public transport journeys
            and watch your contribution grow — distance covered,
            trips taken and emissions avoided, all in one place.
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
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="col-6 col-lg-3"
          >
            <div class="card h-100 border-0 shadow-sm text-center">
              <div class="card-body p-4">
                <span class="icon-tile mb-3">
                  <AppIcon :name="stat.icon" />
                </span>

                <div class="display-6 fw-bold">
                  {{ stat.value }}
                </div>

                <div class="fw-semibold">
                  {{ stat.label }}
                </div>

                <div class="small text-muted">
                  {{ stat.unit }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p
          v-if="!currentUser"
          class="small text-muted text-center mt-4 mb-0"
        >
          Log in to view your personal climate impact statistics.
        </p>
      </div>
    </section>

    <!-- What's tracked -->
    <section class="container py-5">
      <div class="row justify-content-center text-center mb-4">
        <div class="col-12 col-lg-8">
          <p class="eyebrow mb-2">What you can track</p>

          <h2 class="fw-bold">
            From a single trip to a lasting habit
          </h2>
        </div>
      </div>

      <div class="row g-4">
        <div
          v-for="section in sections"
          :key="section.title"
          class="col-12 col-md-4"
        >
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <span class="icon-tile mb-3">
                <AppIcon :name="section.icon" />
              </span>

              <h3 class="h5 fw-bold">
                {{ section.title }}
              </h3>

              <p class="text-muted mb-0">
                {{ section.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BR D.3 - Interactive Travel History Table -->
    <section class="section-soft border-top py-5">
      <div class="container">

        <div class="row mb-4">
          <div class="col-12 col-lg-8">
            <p class="eyebrow mb-2">
              My travel history
            </p>

            <h2 class="fw-bold mb-3">
              Your logged journeys
            </h2>

            <p class="text-muted mb-0">
              Browse your sustainable travel history.
              Search, filter and sort journeys by date,
              travel mode, distance and estimated emissions saved.
            </p>
          </div>
        </div>

        <!-- Not logged in -->
        <div
          v-if="!currentUser"
          class="card border-0 shadow-sm"
        >
          <div class="card-body p-4 text-center">
            <p class="text-muted">
              Log in to view your personal travel history.
            </p>

            <RouterLink
              to="/login"
              class="btn btn-brand"
            >
              Log in
            </RouterLink>
          </div>
        </div>

        <!-- Loading -->
        <div
          v-else-if="loadingJourneys"
          class="text-center py-4"
        >
          <div
            class="spinner-border text-success"
            role="status"
          >
            <span class="visually-hidden">
              Loading journeys...
            </span>
          </div>

          <p class="text-muted mt-3">
            Loading your journeys...
          </p>
        </div>

        <!-- Firestore error -->
        <div
          v-else-if="journeyError"
          class="alert alert-danger"
          role="alert"
        >
          {{ journeyError }}

          <button
            type="button"
            class="btn btn-outline-danger btn-sm ms-2"
            @click="loadJourneys(currentUser)"
          >
            Retry
          </button>
        </div>

        <!-- Interactive table -->
        <InteractiveTable
          v-else
          :rows="journeys"
          :columns="journeyColumns"
        />

        <p
          v-if="currentUser && !loadingJourneys && !journeyError"
          class="small text-muted mt-3 mb-0"
        >
          Your travel history is retrieved from Cloud Firestore.
          Only journeys associated with your account are displayed.
        </p>
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
                  {{
                    isSending
                      ? 'Sending report...'
                      : 'Email My Report'
                  }}
                </button>
              </template>

              <RouterLink
                v-else
                to="/login"
                class="btn btn-brand"
              >
                Log in to Email Report
              </RouterLink>

              <div
                v-if="emailMessage"
                class="alert mt-3 mb-0"
                :class="
                  emailError
                    ? 'alert-danger'
                    : 'alert-success'
                "
                role="status"
              >
                {{ emailMessage }}
              </div>

              <p class="small text-muted mt-3 mb-0">
                Your PDF report includes your saved journeys, total
                distance travelled, and estimated CO₂ emissions avoided.
                Report data is securely retrieved from Cloud Firestore.
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
