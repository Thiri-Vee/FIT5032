
<script setup>
import { computed, onMounted, ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'

import { db } from '../firebase/init.js'
import { currentUser } from '../auth/auth.js'
import AppIcon from '../components/AppIcon.vue'

// --------------------------------------------------
// BR F.1 - Admin Dashboard
// --------------------------------------------------

const members = ref([])
const journeys = ref([])

const isLoading = ref(false)
const errorMessage = ref('')
const lastUpdated = ref(null)

// Existing admin management areas
const adminAreas = [
  {
    icon: 'users',
    title: 'Members',
    text: 'Review registered accounts and roles.',
  },
  {
    icon: 'star',
    title: 'Ratings & reviews',
    text: 'Moderate community feedback on places.',
  },
  {
    icon: 'award',
    title: 'Challenges',
    text: 'Create and manage community challenges.',
  },
]

// --------------------------------------------------
// Load Firestore data
// --------------------------------------------------

const loadDashboard = async () => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const [usersSnapshot, journeysSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'journeys')),
    ])

    members.value = usersSnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))

    journeys.value = journeysSnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))

    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Error loading admin dashboard:', error)

    errorMessage.value =
      error.code === 'permission-denied'
        ? 'You do not have permission to access dashboard data. Please check your admin role and Firestore security rules.'
        : 'Unable to load dashboard statistics. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// --------------------------------------------------
// Dashboard statistics
// --------------------------------------------------

const totalUsers = computed(() => members.value.length)

const totalAdmins = computed(
  () => members.value.filter((member) => member.role === 'admin').length,
)

const totalRegularUsers = computed(
  () => members.value.filter((member) => member.role === 'user').length,
)

const totalJourneys = computed(() => journeys.value.length)

const totalDistance = computed(() =>
  journeys.value.reduce(
    (total, journey) => total + Number(journey.distanceKm || 0),
    0,
  ),
)

const totalCO2Saved = computed(() =>
  journeys.value.reduce(
    (total, journey) => total + Number(journey.co2SavedKg || 0),
    0,
  ),
)

const dashboardStats = computed(() => [
  {
    label: 'Registered Users',
    value: totalUsers.value,
    unit: 'accounts',
    icon: 'users',
  },
  {
    label: 'Administrators',
    value: totalAdmins.value,
    unit: 'admin accounts',
    icon: 'shield',
  },
  {
    label: 'Regular Users',
    value: totalRegularUsers.value,
    unit: 'member accounts',
    icon: 'users',
  },
  {
    label: 'Total Journeys',
    value: totalJourneys.value,
    unit: 'logged journeys',
    icon: 'route',
  },
  {
    label: 'Distance Travelled',
    value: totalDistance.value.toFixed(1),
    unit: 'km',
    icon: 'route',
  },
  {
    label: 'CO₂ Saved',
    value: totalCO2Saved.value.toFixed(2),
    unit: 'kg estimated',
    icon: 'leaf',
  },
])

// --------------------------------------------------
// Members overview
// --------------------------------------------------

const sortedMembers = computed(() =>
  [...members.value].sort((a, b) =>
    String(a.name || a.email || '').localeCompare(
      String(b.name || b.email || ''),
    ),
  ),
)

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return ''

  return lastUpdated.value.toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

// Load data when admin page opens
onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="container py-5 admin-page">

    <!-- Dashboard header -->
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">

      <div>
        <div class="d-flex align-items-center gap-3 mb-3">
          <span class="icon-tile" aria-hidden="true">
            <AppIcon name="shield" />
          </span>

          <div>
            <h1 class="h3 fw-bold mb-1">
              Admin Dashboard
            </h1>

            <p v-if="currentUser" class="text-muted mb-0">
              Welcome, {{ currentUser.name }}.
            </p>
          </div>
        </div>

        <p class="text-muted mb-0">
          Monitor Emitrail's registered members and community climate impact.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-outline-success"
        :disabled="isLoading"
        @click="loadDashboard"
      >
        {{ isLoading ? 'Refreshing...' : 'Refresh Dashboard' }}
      </button>
    </div>

    <!-- Loading message -->
    <div
      v-if="isLoading"
      class="alert alert-info"
      role="status"
      aria-live="polite"
    >
      Loading dashboard data from Firestore...
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="alert alert-danger"
      role="alert"
    >
      {{ errorMessage }}
    </div>

    <!-- Dashboard content -->
    <template v-if="lastUpdated && !errorMessage">

      <!-- Overview statistics -->
      <section
        class="mb-5"
        aria-labelledby="admin-overview-heading"
      >
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2
            id="admin-overview-heading"
            class="h4 fw-bold mb-0"
          >
            Website Overview
          </h2>

          <p class="small text-muted mb-0">
            Last updated: {{ formattedLastUpdated }}
          </p>
        </div>

        <div class="row g-3">
          <div
            v-for="stat in dashboardStats"
            :key="stat.label"
            class="col-12 col-sm-6 col-lg-4"
          >
            <div class="card border-0 shadow-sm h-100 stat-card">
              <div class="card-body p-4">

                <span class="icon-tile mb-3" aria-hidden="true">
                  <AppIcon :name="stat.icon" />
                </span>

                <p class="text-muted small mb-2">
                  {{ stat.label }}
                </p>

                <p class="h2 fw-bold mb-1">
                  {{ stat.value }}
                </p>

                <p class="small text-muted mb-0">
                  {{ stat.unit }}
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Members overview -->
      <section
        class="mb-5"
        aria-labelledby="members-heading"
      >
        <div class="card border-0 shadow-sm admin-card">
          <div class="card-body p-4">

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2
                id="members-heading"
                class="h4 fw-bold mb-0"
              >
                Registered Members
              </h2>

              <span class="badge bg-success">
                {{ totalUsers }} members
              </span>
            </div>

            <p class="text-muted small mb-3">
              Registered users and their assigned access roles.
            </p>

            <div v-if="sortedMembers.length === 0" class="text-muted py-3">
              No member profiles found in Firestore.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">

                <caption class="visually-hidden">
                  Registered Emitrail members and their roles
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="member in sortedMembers"
                    :key="member.id"
                  >
                    <td>
                      {{ member.name || 'Not provided' }}
                    </td>

                    <td>
                      {{ member.email || 'Not provided' }}
                    </td>

                    <td>
                      <span
                        class="badge"
                        :class="
                          member.role === 'admin'
                            ? 'bg-success'
                            : 'bg-secondary'
                        "
                      >
                        {{ member.role || 'user' }}
                      </span>
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>

            <p class="small text-muted mb-0">
              Roles are assigned through Firebase Firestore.
              Only authorised administrators can access this overview.
            </p>

          </div>
        </div>
      </section>

    </template>

    <!-- Existing admin management cards -->
    <section aria-labelledby="admin-tools-heading">

      <h2
        id="admin-tools-heading"
        class="h4 fw-bold mb-3"
      >
        Management Areas
      </h2>

      <div class="row g-3">
        <div
          v-for="area in adminAreas"
          :key="area.title"
          class="col-12 col-md-4"
        >
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">

              <span class="icon-tile mb-3" aria-hidden="true">
                <AppIcon :name="area.icon" />
              </span>

              <h3 class="h6 fw-bold mb-2">
                {{ area.title }}
              </h3>

              <p class="small text-muted mb-0">
                {{ area.text }}
              </p>

            </div>
          </div>
        </div>
      </div>

    </section>

  </div>
</template>

<style scoped>
/* Admin card styling */
.admin-card,
.stat-card {
  border-radius: 10px;
}

/* Dashboard statistic values */
.stat-card .h2 {
  color: #166534;
}

/* Table spacing */
.table th,
.table td {
  padding: 14px 12px;
}

.table th {
  font-weight: 600;
}

/* BR E.3 - Keyboard accessibility */
.admin-page button:focus-visible,
.admin-page a:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .admin-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .stat-card .h2 {
    font-size: 1.7rem;
  }

  .table th,
  .table td {
    padding: 10px 8px;
    font-size: 0.875rem;
  }
}
</style>
