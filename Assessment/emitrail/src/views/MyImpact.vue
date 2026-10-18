
<script setup>
import { computed, ref, watch } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, getDocs, query, where } from 'firebase/firestore'

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Doughnut, Line } from 'vue-chartjs'

import AppIcon from '../components/AppIcon.vue'
import InteractiveTable from '../components/InteractiveTable.vue'
import { currentUser } from '../auth/auth.js'
import { auth, db } from '../firebase/init.js'

// --------------------------------------------------
// BR F.1 - Register Chart.js components
// --------------------------------------------------

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
)

// --------------------------------------------------
// BR D.3 - Firestore Journey History
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

let latestRequestId = 0

async function loadJourneys(user) {
  const requestId = ++latestRequestId

  journeys.value = []
  journeyError.value = ''

  if (!user?.uid) {
    loadingJourneys.value = false
    return
  }

  loadingJourneys.value = true

  try {
    const journeysQuery = query(
      collection(db, 'journeys'),
      where('userId', '==', user.uid),
    )

    const snapshot = await getDocs(journeysQuery)

    if (
      requestId !== latestRequestId ||
      auth.currentUser?.uid !== user.uid
    ) {
      return
    }

    journeys.value = snapshot.docs.map((document) => {
      const data = document.data()

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

watch(
  () => currentUser.value?.uid,
  () => {
    loadJourneys(currentUser.value)
  },
  { immediate: true },
)

// --------------------------------------------------
// Existing Climate Impact Statistics
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
// BR F.1 - Innovation 2: Interactive Charts
// --------------------------------------------------

// Select between daily and monthly CO2 trends
const chartPeriod = ref('monthly')

// Count journeys by travel mode
const journeysByMode = computed(() => {
  const counts = {}

  journeys.value.forEach((journey) => {
    const mode = String(journey.mode || 'Unknown').trim()
    const label = mode || 'Unknown'

    counts[label] = (counts[label] || 0) + 1
  })

  return Object.entries(counts).sort(
    (a, b) => b[1] - a[1],
  )
})

// Doughnut chart data
const travelModeChartData = computed(() => ({
  labels: journeysByMode.value.map(([mode]) => mode),

  datasets: [
    {
      label: 'Journeys',
      data: journeysByMode.value.map(([, count]) => count),
      backgroundColor: [
        '#166534',
        '#22c55e',
        '#86efac',
        '#0d9488',
        '#38bdf8',
        '#f59e0b',
        '#8b5cf6',
        '#64748b',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
}))

const travelModeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',

  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 18,
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label(context) {
          const value = Number(context.parsed || 0)

          const total = context.dataset.data.reduce(
            (sum, count) => sum + Number(count),
            0,
          )

          const percentage = total
            ? ((value / total) * 100).toFixed(1)
            : '0.0'

          return `${context.label}: ${value} journeys (${percentage}%)`
        },
      },
    },
  },
}

// Group CO2 savings by date or month
const co2Trend = computed(() => {
  const totals = {}

  journeys.value.forEach((journey) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(journey.date)) {
      return
    }

    const key =
      chartPeriod.value === 'monthly'
        ? journey.date.slice(0, 7)
        : journey.date

    const saved = Number(journey.co2SavedKg)

    totals[key] =
      (totals[key] || 0) +
      (Number.isFinite(saved) ? saved : 0)
  })

  return Object.entries(totals)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, total]) => ({
      date,
      total: Number(total.toFixed(2)),
    }))
})

// Format dates for display
function formatChartDate(date) {
  if (chartPeriod.value === 'monthly') {
    const [year, month] = date.split('-')

    return new Date(
      Number(year),
      Number(month) - 1,
      1,
    ).toLocaleDateString('en-AU', {
      month: 'short',
      year: 'numeric',
    })
  }

  const [year, month, day] = date.split('-')

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Line chart data
const co2ChartData = computed(() => ({
  labels: co2Trend.value.map((item) =>
    formatChartDate(item.date),
  ),

  datasets: [
    {
      label: 'CO₂ Saved (kg)',
      data: co2Trend.value.map((item) => item.total),
      borderColor: '#166534',
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      pointBackgroundColor: '#166534',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      borderWidth: 3,
      tension: 0.3,
      fill: true,
    },
  ],
}))

const co2ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: false,
    mode: 'index',
  },

  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label(context) {
          return `CO₂ saved: ${Number(context.parsed.y).toFixed(2)} kg`
        },
      },
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'CO₂ saved (kg)',
      },
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        autoSkip: true,
      },
    },
  },
}

// Accessible text summaries for the charts
const chartSummary = computed(() => {
  if (!journeys.value.length) {
    return 'No journeys have been recorded.'
  }

  return journeysByMode.value
    .map(([mode, count]) => `${mode}: ${count} journeys`)
    .join('; ')
})

const trendSummary = computed(() => {
  if (!co2Trend.value.length) {
    return 'No dated journey records are available.'
  }

  return co2Trend.value
    .map(
      (item) =>
        `${formatChartDate(item.date)}: ${item.total.toFixed(2)} kilograms of CO2 saved`,
    )
    .join('; ')
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
// BR E.4 - CSV Export
// --------------------------------------------------

const exportMessage = ref('')
const exportError = ref(false)

function escapeCSV(value) {
  let text = String(value ?? '')

  // Prevent spreadsheet formula injection
  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  text = text.replace(/"/g, '""')

  if (/[",\r\n]/.test(text)) {
    return `"${text}"`
  }

  return text
}

function downloadCSV() {
  exportMessage.value = ''
  exportError.value = false

  if (
    !currentUser.value ||
    !auth.currentUser ||
    auth.currentUser.uid !== currentUser.value.uid
  ) {
    exportMessage.value =
      'Please log in to export your journeys.'
    exportError.value = true
    return
  }

  if (loadingJourneys.value || journeyError.value) {
    exportMessage.value =
      'Your journeys are not ready. Please try again.'
    exportError.value = true
    return
  }

  if (journeys.value.length === 0) {
    exportMessage.value =
      'No journeys available to export.'
    exportError.value = true
    return
  }

  try {
    const headers = [
      'Date',
      'Travel Mode',
      'Distance (km)',
      'CO2 Saved (kg)',
    ]

    const rows = journeys.value.map((journey) => [
      journey.date,
      journey.mode,
      journey.distanceKm,
      journey.co2SavedKg,
    ])

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n')

    const blob = new Blob(
      ['\uFEFF', csvContent],
      { type: 'text/csv;charset=utf-8;' },
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'Emitrail_Journey_History.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(url), 1000)

    exportMessage.value =
      `${journeys.value.length} journey records prepared for download.`
  } catch (error) {
    console.error('CSV export error:', error)

    exportMessage.value =
      'Unable to export your journeys. Please try again.'
    exportError.value = true
  }
}

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
    emailMessage.value =
      'Please log in to email your report.'
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
    console.error(
      'Email report error:',
      error.code,
      error.message,
    )

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
    <section
      class="container py-5"
      aria-labelledby="impact-heading"
    >
      <div class="row align-items-center g-4 g-lg-5">
        <div class="col-12 col-lg-7">

          <p class="eyebrow mb-2">
            My impact
          </p>

          <h1
            id="impact-heading"
            class="fw-bold mb-3"
          >
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

            <span aria-hidden="true">
              <AppIcon name="arrow" :size="18" />
            </span>
          </RouterLink>

          <RouterLink
            v-else
            to="/compare"
            class="btn btn-brand btn-lg d-inline-flex align-items-center gap-2"
          >
            Log a journey

            <span aria-hidden="true">
              <AppIcon name="arrow" :size="18" />
            </span>
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

    <!-- Existing Dashboard Statistics -->
    <section
      class="section-soft border-top border-bottom py-5"
      aria-labelledby="statistics-heading"
    >
      <div class="container">

        <h2
          id="statistics-heading"
          class="visually-hidden"
        >
          Your climate impact statistics
        </h2>

        <div class="row g-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="col-6 col-lg-3"
          >
            <div class="card h-100 border-0 shadow-sm text-center">
              <div class="card-body p-4">

                <span
                  class="icon-tile mb-3"
                  aria-hidden="true"
                >
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

    <!-- BR F.1 - Interactive Charts -->
    <section
      class="container py-5"
      aria-labelledby="charts-heading"
    >
      <div class="row mb-4">
        <div class="col-12 col-lg-8">

          <p class="eyebrow mb-2">
            Travel analytics
          </p>

          <h2
            id="charts-heading"
            class="fw-bold mb-3"
          >
            Explore your climate impact
          </h2>

          <p class="text-muted mb-0">
            Discover how you travel and how much CO₂
            your sustainable journeys have saved over time.
            Charts are generated from your saved Firestore journeys.
          </p>

        </div>
      </div>

      <!-- User not logged in -->
      <div
        v-if="!currentUser"
        class="card border-0 shadow-sm"
      >
        <div class="card-body p-4 text-center">
          <p class="text-muted">
            Log in to explore your personal travel analytics.
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
        role="status"
        aria-live="polite"
      >
        <div
          class="spinner-border text-success"
          aria-hidden="true"
        ></div>

        <p class="text-muted mt-3">
          Loading your travel analytics...
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="journeyError"
        class="alert alert-danger"
        role="alert"
      >
        {{ journeyError }}
      </div>

      <!-- No data -->
      <div
        v-else-if="journeys.length === 0"
        class="card border-0 shadow-sm"
      >
        <div class="card-body p-4 text-center">
          <p class="text-muted mb-3">
            You haven't logged any journeys yet.
            Add your first journey to see your charts.
          </p>

          <RouterLink
            to="/compare"
            class="btn btn-brand"
          >
            Log a Journey
          </RouterLink>
        </div>
      </div>

      <!-- Charts -->
      <div v-else class="row g-4">

        <!-- Doughnut Chart -->
        <div class="col-12 col-lg-5">
          <div class="card border-0 shadow-sm h-100 chart-card">
            <div class="card-body p-4">

              <h3 class="h5 fw-bold mb-2">
                Journeys by Travel Mode
              </h3>

              <p class="small text-muted mb-3">
                Hover over or select a segment to view
                the number and percentage of journeys.
              </p>

              <div
                class="chart-container"
                role="img"
                :aria-label="
                  'Doughnut chart showing journeys by travel mode. ' +
                  chartSummary
                "
              >
                <Doughnut
                  :data="travelModeChartData"
                  :options="travelModeChartOptions"
                />
              </div>

              <p class="small text-muted mt-3 mb-0">
                Total journeys: {{ journeys.length }}
              </p>

              <details class="mt-3">
                <summary class="small fw-semibold">
                  View chart data as text
                </summary>

                <ul class="small mt-2 mb-0">
                  <li
                    v-for="[mode, count] in journeysByMode"
                    :key="mode"
                  >
                    {{ mode }}: {{ count }} journeys
                  </li>
                </ul>
              </details>

            </div>
          </div>
        </div>

        <!-- Line Chart -->
        <div class="col-12 col-lg-7">
          <div class="card border-0 shadow-sm h-100 chart-card">
            <div class="card-body p-4">

              <div
                class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"
              >
                <div>
                  <h3 class="h5 fw-bold mb-2">
                    CO₂ Savings Over Time
                  </h3>

                  <p class="small text-muted mb-0">
                    Compare estimated emissions avoided
                    across different dates.
                  </p>
                </div>

                <div>
                  <label
                    for="chart-period"
                    class="form-label small fw-semibold"
                  >
                    Time period
                  </label>

                  <select
                    id="chart-period"
                    v-model="chartPeriod"
                    class="form-select form-select-sm"
                  >
                    <option value="daily">
                      Daily
                    </option>

                    <option value="monthly">
                      Monthly
                    </option>
                  </select>
                </div>
              </div>

              <div
                v-if="co2Trend.length > 0"
                class="chart-container"
                role="img"
                :aria-label="
                  'Line chart showing CO2 savings over time. ' +
                  trendSummary
                "
              >
                <Line
                  :data="co2ChartData"
                  :options="co2ChartOptions"
                />
              </div>

              <p
                v-else
                class="text-muted text-center py-5"
              >
                No dated journey records are available.
              </p>

              <p class="small text-muted mt-3 mb-0">
                Values show estimated CO₂ savings
                compared with car travel.
              </p>

              <details
                v-if="co2Trend.length > 0"
                class="mt-3"
              >
                <summary class="small fw-semibold">
                  View chart data as text
                </summary>

                <div class="table-responsive mt-2">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th scope="col">Period</th>
                        <th scope="col">CO₂ saved (kg)</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="item in co2Trend"
                        :key="item.date"
                      >
                        <td>
                          {{ formatChartDate(item.date) }}
                        </td>

                        <td>
                          {{ item.total.toFixed(2) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>

            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Existing Information Cards -->
    <section
      class="section-soft border-top py-5"
      aria-labelledby="tracking-heading"
    >
      <div class="container">

        <div class="row justify-content-center text-center mb-4">
          <div class="col-12 col-lg-8">

            <p class="eyebrow mb-2">
              What you can track
            </p>

            <h2
              id="tracking-heading"
              class="fw-bold"
            >
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

                <span
                  class="icon-tile mb-3"
                  aria-hidden="true"
                >
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

      </div>
    </section>

    <!-- BR D.3 - Interactive Journey History -->
    <section
      class="section-soft border-top py-5"
      aria-labelledby="journey-history-heading"
    >
      <div class="container">

        <div class="row mb-4">
          <div class="col-12 col-lg-8">

            <p class="eyebrow mb-2">
              My travel history
            </p>

            <h2
              id="journey-history-heading"
              class="fw-bold mb-3"
            >
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

        <!-- Loading journeys -->
        <div
          v-else-if="loadingJourneys"
          class="text-center py-4"
          role="status"
          aria-live="polite"
        >
          <div
            class="spinner-border text-success"
            aria-hidden="true"
          ></div>

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
          <p class="mb-2">
            {{ journeyError }}
          </p>

          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            aria-label="Retry loading your journeys"
            @click="loadJourneys(currentUser)"
          >
            Retry
          </button>
        </div>

        <!-- Interactive table and CSV export -->
        <div v-else>

          <p
            class="visually-hidden"
            role="status"
            aria-live="polite"
          >
            {{ journeys.length }} journeys loaded.
          </p>

          <!-- BR E.4 - CSV Export Button -->
          <div
            class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
          >
            <p class="text-muted small mb-0">
              Export your saved journey history for your records.
            </p>

            <button
              type="button"
              class="btn btn-success d-inline-flex align-items-center gap-2"
              :disabled="journeys.length === 0"
              @click="downloadCSV"
            >
              <span aria-hidden="true">
                <AppIcon name="download" :size="18" />
              </span>

              Download CSV
            </button>
          </div>

          <!-- CSV export feedback -->
          <div
            v-if="exportMessage"
            class="alert mb-3"
            :class="
              exportError
                ? 'alert-danger'
                : 'alert-success'
            "
            :role="exportError ? 'alert' : 'status'"
          >
            {{ exportMessage }}
          </div>

          <!-- Existing interactive table -->
          <InteractiveTable
            :rows="journeys"
            :columns="journeyColumns"
          />

        </div>

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
    <section
      class="container py-5 border-top"
      aria-labelledby="email-report-heading"
    >
      <div class="row justify-content-center">
        <div class="col-12 col-md-9 col-lg-7">

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">

              <div class="d-flex align-items-center gap-3 mb-3">

                <span
                  class="icon-tile"
                  aria-hidden="true"
                >
                  <AppIcon name="download" />
                </span>

                <div>
                  <h2
                    id="email-report-heading"
                    class="h4 fw-bold mb-0"
                  >
                    Email My Climate Impact Report
                  </h2>
                </div>

              </div>

              <p
                id="email-report-description"
                class="text-muted mb-4"
              >
                Receive your current Emitrail climate impact summary
                as a PDF attachment directly in your email inbox.
              </p>

              <template v-if="currentUser">

                <p
                  id="report-email-address"
                  class="small mb-3"
                >
                  Report will be sent to:
                  <strong>{{ currentUser.email }}</strong>
                </p>

                <button
                  type="button"
                  class="btn btn-brand"
                  :disabled="isSending"
                  :aria-busy="isSending"
                  aria-describedby="email-report-description report-email-address"
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

              <!-- Email request feedback -->
              <div
                v-if="emailMessage"
                class="alert mt-3 mb-0"
                :class="
                  emailError
                    ? 'alert-danger'
                    : 'alert-success'
                "
                :role="emailError ? 'alert' : 'status'"
                aria-live="polite"
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
/* BR F.1 - Chart styling */
.chart-card {
  border-radius: 12px;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 330px;
}

/* BR E.3 - Keyboard focus visibility */
.impact-page button:focus-visible,
.impact-page a:focus-visible,
.impact-page select:focus-visible,
.impact-page summary:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

/* Stronger focus indicator for dark or green buttons */
.impact-page .btn-brand:focus-visible {
  outline: 3px solid #111827;
  outline-offset: 4px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  h1 {
    font-size: 1.9rem;
  }

  .display-6 {
    font-size: 1.8rem;
  }

  .chart-container {
    height: 280px;
  }

  .chart-card .card-body {
    padding: 20px !important;
  }
}
</style>
