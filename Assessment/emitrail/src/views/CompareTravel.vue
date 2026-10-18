
<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { addDoc, collection, Timestamp } from 'firebase/firestore'

import { auth, db } from '../firebase/init.js'
import { currentUser } from '../auth/auth.js'

import AppIcon from '../components/AppIcon.vue'
import LocationSearch from '../components/LocationSearch.vue'
import RouteMap from '../components/RouteMap.vue'

import { travelModes } from '../data/travelModes'
import { getAverageRating, getRatings, saveRating } from '../data/ratings.js'
import { containsUnsafeContent, sanitizeText } from '../security/security.js'

// -----------------------------------------
// Journey form
// -----------------------------------------

const form = reactive({
  startLocation: '',
  destination: '',
  distance: '',
})

const errors = reactive({
  startLocation: '',
  destination: '',
  distance: '',
})

const formSubmitted = ref(false)
const savedModes = ref([])

// -----------------------------------------
// BR E.3 - Accessibility
// -----------------------------------------

const distanceRef = ref(null)
const resultsHeadingRef = ref(null)
const formErrorMessage = ref('')

async function focusFirstError() {
  await nextTick()

  if (errors.startLocation) {
    document.getElementById('start-location')?.focus()
  } else if (errors.destination) {
    document.getElementById('destination')?.focus()
  } else if (errors.distance) {
    distanceRef.value?.focus()
  }
}

// -----------------------------------------
// Mapbox routes
// -----------------------------------------

const startCoordinates = ref(null)
const destinationCoordinates = ref(null)
const distanceManuallyEdited = ref(false)

const routes = ref({
  walking: null,
  cycling: null,
  driving: null,
})

const routeError = ref('')

const routeReady = computed(() => Boolean(routes.value.driving))

function clearError(field) {
  errors[field] = ''
  formErrorMessage.value = ''
}

function locationChanged(field) {
  clearError(field)
  distanceManuallyEdited.value = false

  if (field === 'startLocation') {
    startCoordinates.value = null
  }

  if (field === 'destination') {
    destinationCoordinates.value = null
  }

  routes.value = {
    walking: null,
    cycling: null,
    driving: null,
  }

  form.distance = ''
  routeError.value = ''
  formSubmitted.value = false
}

function locationSelected(field, location) {
  if (
    !Array.isArray(location.coordinates) ||
    location.coordinates.length < 2
  ) {
    return
  }

  if (field === 'startLocation') {
    startCoordinates.value = [...location.coordinates]
    clearError('startLocation')
  }

  if (field === 'destination') {
    destinationCoordinates.value = [...location.coordinates]
    clearError('destination')
  }
}

function routesCalculated(result) {
  routes.value = {
    walking: result.walking ?? null,
    cycling: result.cycling ?? null,
    driving: result.driving ?? null,
  }

  if (!distanceManuallyEdited.value) {
    form.distance = result.driving
      ? String(result.driving.distanceKm)
      : ''
  }

  routeError.value = result.driving
    ? ''
    : 'No driving route available. You can enter a distance manually after selecting valid locations.'

  if (result.driving) {
    clearError('distance')
  }
}

function routeFailed(message) {
  routes.value = {
    walking: null,
    cycling: null,
    driving: null,
  }

  if (!distanceManuallyEdited.value) {
    form.distance = ''
  }

  routeError.value = message
}

function distanceForMode(modeName) {
  const enteredDistance = Number(form.distance)

  if (!Number.isFinite(enteredDistance) || enteredDistance <= 0) {
    return null
  }

  const drivingDistance = routes.value.driving?.distanceKm

  if (!drivingDistance || drivingDistance <= 0) {
    return enteredDistance
  }

  if (modeName === 'Car' || modeName === 'Public Transport') {
    return enteredDistance
  }

  const route =
    modeName === 'Walking'
      ? routes.value.walking
      : modeName === 'Cycling'
        ? routes.value.cycling
        : null

  if (!route) return null

  return Number(
    (
      (enteredDistance * route.distanceKm) /
      drivingDistance
    ).toFixed(2),
  )
}

function durationForMode(modeName) {
  if (distanceManuallyEdited.value) return null

  if (modeName === 'Walking') {
    return routes.value.walking?.durationMinutes ?? null
  }

  if (modeName === 'Cycling') {
    return routes.value.cycling?.durationMinutes ?? null
  }

  if (modeName === 'Car') {
    return routes.value.driving?.durationMinutes ?? null
  }

  return null
}

// -----------------------------------------
// CO2 comparison results
// -----------------------------------------

const comparisonResults = computed(() => {
  const distance = Number(form.distance)

  if (!Number.isFinite(distance) || distance <= 0) {
    return []
  }

  return travelModes.map((mode) => {
    const distanceKm = distanceForMode(mode.name)
    const durationMinutes = durationForMode(mode.name)

    return {
      ...mode,
      distanceKm,
      durationMinutes,
      emissions:
        distanceKm === null
          ? null
          : (distanceKm * mode.emissionFactor).toFixed(2),
      isProxy: mode.name === 'Public Transport',
    }
  })
})

// -----------------------------------------
// Validation
// -----------------------------------------

const locationPattern = /[A-Za-z]/

function validateForm() {
  let isValid = true

  errors.startLocation = ''
  errors.destination = ''
  errors.distance = ''

  if (!form.startLocation.trim()) {
    errors.startLocation = 'Start location is required.'
    isValid = false
  } else if (containsUnsafeContent(form.startLocation)) {
    errors.startLocation = 'Start location contains invalid content.'
    isValid = false
  } else if (!locationPattern.test(form.startLocation)) {
    errors.startLocation = 'Please enter a valid start location.'
    isValid = false
  } else if (!startCoordinates.value) {
    errors.startLocation =
      'Please select a valid start location from the suggestions.'
    isValid = false
  }

  if (!form.destination.trim()) {
    errors.destination = 'Destination is required.'
    isValid = false
  } else if (containsUnsafeContent(form.destination)) {
    errors.destination = 'Destination contains invalid content.'
    isValid = false
  } else if (!locationPattern.test(form.destination)) {
    errors.destination = 'Please enter a valid destination.'
    isValid = false
  } else if (!destinationCoordinates.value) {
    errors.destination =
      'Please select a valid destination from the suggestions.'
    isValid = false
  }

  const distance = Number(form.distance)

  if (form.distance === '') {
    errors.distance = 'Distance is required.'
    isValid = false
  } else if (!Number.isFinite(distance) || distance <= 0) {
    errors.distance = 'Distance must be greater than 0.'
    isValid = false
  }

  return isValid
}

// -----------------------------------------
// Compare travel
// -----------------------------------------

async function compareTravel() {
  if (!validateForm()) {
    formSubmitted.value = false

    formErrorMessage.value =
      'Please correct the highlighted journey details.'

    await focusFirstError()
    return
  }

  formErrorMessage.value = ''
  formSubmitted.value = true
  savedModes.value = []
  saveMessage.value = ''
  saveError.value = false

  localStorage.setItem(
    'emitrailLastComparison',
    JSON.stringify({
      startLocation: sanitizeText(form.startLocation),
      destination: sanitizeText(form.destination),
      distance: Number(form.distance),
      date: new Date().toISOString(),
    }),
  )

  // BR E.3 - Focus the results after successful comparison
  await nextTick()
  resultsHeadingRef.value?.focus()
}

watch(form, () => {
  formSubmitted.value = false
  savedModes.value = []
  saveMessage.value = ''
  saveError.value = false
})

// -----------------------------------------
// Save Journey to Firestore
// -----------------------------------------

const isSaving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)

async function saveJourney(mode) {
  if (isSaving.value || savedModes.value.includes(mode.name)) {
    return
  }

  saveMessage.value = ''
  saveError.value = false

  const user = auth.currentUser

  if (!user) {
    saveMessage.value = 'Please log in to save your journey.'
    saveError.value = true
    return
  }

  if (!formSubmitted.value || !validateForm()) {
    saveMessage.value = 'Please compare a valid journey first.'
    saveError.value = true
    return
  }

  if (mode.name === 'Car') {
    saveMessage.value = 'Select a sustainable travel mode.'
    saveError.value = true
    return
  }

  const distanceKm = distanceForMode(mode.name)

  if (distanceKm === null || distanceKm <= 0) {
    saveMessage.value = 'No route is available for this travel mode.'
    saveError.value = true
    return
  }

  const carMode = travelModes.find((item) => item.name === 'Car')

  if (!carMode) {
    saveMessage.value = 'Car emission data is unavailable.'
    saveError.value = true
    return
  }

  const drivingDistanceKm = Number(form.distance)
  const carEmissions =
    drivingDistanceKm * carMode.emissionFactor

  const selectedEmissions =
    distanceKm * mode.emissionFactor

  const co2SavedKg = Number(
    Math.max(0, carEmissions - selectedEmissions).toFixed(2),
  )

  isSaving.value = true

  try {
    await addDoc(collection(db, 'journeys'), {
      userId: user.uid,
      date: Timestamp.now(),
      mode: mode.name,
      distanceKm,
      co2SavedKg,
      startLocation: sanitizeText(form.startLocation),
      destination: sanitizeText(form.destination),
    })

    savedModes.value = [...savedModes.value, mode.name]

    saveMessage.value =
      `${mode.name} journey saved successfully! ` +
      `Estimated CO₂ saved: ${co2SavedKg.toFixed(2)} kg.`

    saveError.value = false
  } catch (error) {
    console.error('Error saving journey:', error)

    saveMessage.value =
      'Unable to save your journey. Please try again.'

    saveError.value = true
  } finally {
    isSaving.value = false
  }
}

// -----------------------------------------
// Rating feature
// -----------------------------------------

const selectedRating = ref(0)
const averageRating = ref(0)
const ratingCount = ref(0)
const ratingMessage = ref('')

function loadRatingSummary() {
  const ratings = getRatings()
  averageRating.value = getAverageRating()
  ratingCount.value = ratings.length
}

function submitRating() {
  ratingMessage.value = ''

  if (selectedRating.value < 1 || selectedRating.value > 5) {
    ratingMessage.value = 'Please select a rating from 1 to 5.'
    return
  }

  if (!auth.currentUser) {
    ratingMessage.value =
      'Please log in before submitting a rating.'
    return
  }

  saveRating({
    id: Date.now(),
    userId: auth.currentUser.uid,
    score: selectedRating.value,
  })

  ratingMessage.value = 'Thank you for your rating.'
  selectedRating.value = 0
  loadRatingSummary()
}

onMounted(loadRatingSummary)
</script>

<template>
  <div class="compare-page">

    <!-- Introduction -->
    <section class="section-soft border-bottom">
      <div class="container py-5">
        <div class="row justify-content-center text-center">
          <div class="col-12 col-lg-9">

            <p class="eyebrow mb-2">
              Active travel comparison
            </p>

            <h1 class="fw-bold mb-3">
              Compare how you travel
            </h1>

            <p class="lead text-muted mb-0">
              Enter a journey and compare walking, cycling,
              public transport and car travel by distance and
              estimated emissions, using established published
              emission-factor data.
            </p>

          </div>
        </div>
      </div>
    </section>

    <div class="container py-5">

      <!-- Journey details and map -->
      <div class="row g-4 g-lg-5 align-items-start">

        <!-- Journey form -->
        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">

              <h2 class="h5 fw-bold mb-3">
                Journey details
              </h2>

              <form
                @submit.prevent="compareTravel"
                novalidate
                aria-label="Journey comparison form"
              >

                <!-- Start location -->
                <div class="mb-4">
                  <label
                    for="start-location"
                    class="form-label fw-bold"
                  >
                    Start location
                  </label>

                  <LocationSearch
                    id="start-location"
                    v-model="form.startLocation"
                    placeholder="Search start location"
                    :aria-invalid="Boolean(errors.startLocation)"
                    :aria-describedby="
                      errors.startLocation
                        ? 'start-location-error'
                        : undefined
                    "
                    @update:model-value="
                      locationChanged('startLocation')
                    "
                    @select="
                      locationSelected('startLocation', $event)
                    "
                  />

                  <div
                    v-if="errors.startLocation"
                    id="start-location-error"
                    class="text-danger small mt-1"
                    role="alert"
                  >
                    {{ errors.startLocation }}
                  </div>
                </div>

                <!-- Destination -->
                <div class="mb-4">
                  <label
                    for="destination"
                    class="form-label fw-bold"
                  >
                    Destination
                  </label>

                  <LocationSearch
                    id="destination"
                    v-model="form.destination"
                    placeholder="Search destination"
                    :aria-invalid="Boolean(errors.destination)"
                    :aria-describedby="
                      errors.destination
                        ? 'destination-error'
                        : undefined
                    "
                    @update:model-value="
                      locationChanged('destination')
                    "
                    @select="
                      locationSelected('destination', $event)
                    "
                  />

                  <div
                    v-if="errors.destination"
                    id="destination-error"
                    class="text-danger small mt-1"
                    role="alert"
                  >
                    {{ errors.destination }}
                  </div>
                </div>

                <!-- Distance -->
                <div class="mb-4">
                  <label
                    for="distance"
                    class="form-label fw-bold"
                  >
                    Distance (km)
                  </label>

                  <input
                    id="distance"
                    ref="distanceRef"
                    v-model="form.distance"
                    type="number"
                    min="0"
                    step="0.1"
                    class="form-control"
                    :class="{
                      'is-invalid': errors.distance
                    }"
                    :aria-invalid="Boolean(errors.distance)"
                    :aria-describedby="
                      errors.distance
                        ? 'distance-error'
                        : undefined
                    "
                    @input="
                      distanceManuallyEdited = true;
                      clearError('distance')
                    "
                  />

                  <div
                    v-if="errors.distance"
                    id="distance-error"
                    class="invalid-feedback d-block"
                    role="alert"
                  >
                    {{ errors.distance }}
                  </div>
                </div>

                <!-- Route information -->
                <p
                  v-if="routes.driving"
                  class="small text-muted"
                >
                  Estimated driving time:
                  {{ routes.driving.durationMinutes }} minutes.
                  Walking and cycling distances are calculated
                  separately.
                </p>

                <p
                  v-if="routeError"
                  class="small text-danger"
                  role="alert"
                >
                  {{ routeError }}
                </p>

                <!-- Form error summary -->
                <p
                  v-if="formErrorMessage"
                  class="small text-danger"
                  role="alert"
                >
                  {{ formErrorMessage }}
                </p>

                <!-- Compare button -->
                <button
                  type="submit"
                  class="btn btn-dark px-4 w-100"
                >
                  Compare
                </button>

              </form>

              <p class="small text-muted mt-3 mb-0">
                Your latest comparison is saved locally on this
                device. If you choose to save a journey, its
                details will also be stored securely in Cloud
                Firestore under your account.
              </p>

            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="col-12 col-lg-8">
          <section aria-labelledby="journey-route-heading">

            <h2
              id="journey-route-heading"
              class="h5 fw-bold mb-3"
            >
              Journey route
            </h2>

            <RouteMap
              :start-coordinates="startCoordinates"
              :destination-coordinates="destinationCoordinates"
              @routes-calculated="routesCalculated"
              @route-error="routeFailed"
            />

            <p class="small text-muted mt-2 mb-0">
              Walking, cycling and driving use their own
              Mapbox routes. Public transport uses the
              driving-route distance as an approximate proxy,
              not an actual public transport route.
            </p>

          </section>
        </div>
      </div>

      <!-- Results -->
      <section
        class="results-section mt-5 p-4"
        aria-labelledby="results-heading"
      >

        <h2
          id="results-heading"
          ref="resultsHeadingRef"
          class="fw-bold mb-4"
          tabindex="-1"
        >
          Results
        </h2>

        <!-- Empty results -->
        <div
          v-if="!formSubmitted"
          class="text-center py-4"
        >
          <img
            src="/images/compare-empty.svg"
            alt=""
            class="illustration mb-3"
            style="max-width: 320px"
          />

          <p class="text-muted mb-0">
            Enter your journey information to compare travel options.
          </p>
        </div>

        <!-- Comparison results -->
        <div v-else>

          <p
            v-if="!routeReady"
            class="small text-muted mb-3"
          >
            Manual comparison: all modes use your entered
            distance. Travel times are unavailable without
            a Mapbox route, and emissions are estimates.
          </p>

          <p
            v-else-if="distanceManuallyEdited"
            class="small text-muted mb-3"
          >
            You edited the driving distance. Walking and
            cycling distances are scaled estimates based
            on the Mapbox routes; displayed travel times
            remain the original Mapbox estimates.
          </p>

          <div class="row g-3">

            <div
              v-for="mode in comparisonResults"
              :key="mode.id"
              class="col-12 col-md-6 col-xl-3"
            >
              <div class="travel-card h-100">

                <!-- Mode icon and heading -->
                <div class="card-top">

                  <span
                    class="mode-icon"
                    aria-hidden="true"
                  >
                    <AppIcon
                      :name="{
                        Walking: 'walk',
                        Cycling: 'bike',
                        'Public Transport': 'bus',
                        Car: 'car',
                      }[mode.name] || 'route'"
                      :size="28"
                    />
                  </span>

                  <h3 class="mode-title">
                    {{ mode.name }}
                  </h3>
                </div>

                <!-- CO2 emissions -->
                <div class="emissions-panel">

                  <template v-if="mode.emissions !== null">

                    <span class="emissions-value">
                      {{ mode.emissions }}
                    </span>

                    <span class="emissions-unit">
                      kg CO₂
                    </span>

                  </template>

                  <span
                    v-else
                    class="unavailable"
                  >
                    Route unavailable
                  </span>
                </div>

                <!-- Distance and time -->
                <div class="journey-stats">

                  <div class="stat">
                    <span aria-hidden="true">
                      <AppIcon name="route" :size="20" />
                    </span>

                    <span>
                      {{
                        mode.distanceKm !== null
                          ? `${mode.distanceKm} km`
                          : 'N/A'
                      }}
                    </span>
                  </div>

                  <div class="stat">
                    <span aria-hidden="true">
                      <AppIcon name="clock" :size="20" />
                    </span>

                    <span>
                      {{
                        mode.durationMinutes !== null
                          ? `${mode.durationMinutes} min`
                          : '—'
                      }}
                    </span>
                  </div>

                </div>

                <p
                  v-if="mode.isProxy"
                  class="proxy-note"
                >
                  Approximate distance proxy
                </p>

                <p class="mode-description">
                  {{ mode.description }}
                </p>

                <!-- Save journey -->
                <button
                  v-if="mode.name !== 'Car'"
                  type="button"
                  class="btn save-journey-btn"
                  :aria-label="
                    savedModes.includes(mode.name)
                      ? `${mode.name} journey saved`
                      : `Save ${mode.name} journey`
                  "
                  :disabled="
                    isSaving ||
                    !currentUser ||
                    mode.distanceKm === null ||
                    savedModes.includes(mode.name)
                  "
                  @click="saveJourney(mode)"
                >
                  {{
                    savedModes.includes(mode.name)
                      ? 'Journey Saved'
                      : isSaving
                        ? 'Saving...'
                        : 'Save Journey'
                  }}
                </button>

                <div
                  v-else
                  class="car-baseline-note"
                >
                  Comparison baseline
                </div>

              </div>
            </div>
          </div>

          <p
            v-if="!currentUser"
            class="small text-muted mt-3 mb-0"
          >
            Please log in to save a journey to your travel history.
          </p>

          <!-- Firestore save feedback -->
          <div
            v-if="saveMessage"
            class="alert mt-3 mb-0"
            :class="
              saveError
                ? 'alert-danger'
                : 'alert-success'
            "
            :role="saveError ? 'alert' : 'status'"
            aria-live="polite"
          >
            {{ saveMessage }}
          </div>

          <RouterLink
            v-if="saveMessage && !saveError"
            to="/impact"
            class="btn btn-success mt-3"
          >
            View My Travel History
          </RouterLink>

        </div>
      </section>

      <!-- Rating -->
      <section
        class="mt-4"
        aria-labelledby="rating-heading"
      >
        <div class="card border-0 shadow-sm rating-card">
          <div class="card-body p-4">

            <h2
              id="rating-heading"
              class="h4 fw-bold mb-3"
            >
              Rate the Travel Comparison
            </h2>

            <p
              id="rating-description"
              class="mb-3"
            >
              How useful was this travel comparison?
            </p>

            <!-- Accessible rating buttons -->
            <div
              class="d-flex flex-wrap gap-2 mb-3"
              role="group"
              aria-labelledby="rating-description"
            >
              <button
                v-for="score in 5"
                :key="score"
                type="button"
                class="btn d-inline-flex align-items-center gap-1"
                :class="
                  selectedRating === score
                    ? 'btn-success'
                    : 'btn-outline-success'
                "
                :aria-pressed="selectedRating === score"
                :aria-label="`Rate ${score} out of 5 stars`"
                @click="selectedRating = score"
              >
                <span aria-hidden="true">
                  <AppIcon name="star" :size="16" />
                </span>
                {{ score }}
              </button>
            </div>

            <button
              type="button"
              class="btn btn-success"
              @click="submitRating"
            >
              Submit Rating
            </button>

            <p
              v-if="ratingMessage"
              class="mt-3 mb-0"
              role="status"
              aria-live="polite"
            >
              {{ ratingMessage }}
            </p>

            <hr />

            <p class="mb-1">
              <strong>Average Rating:</strong>
              {{ averageRating }} / 5
            </p>

            <p class="mb-0">
              Based on {{ ratingCount }} rating(s)
            </p>

          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Results background */
.results-section {
  background-color: #dedede;
  border-radius: 12px;
  min-height: 0;
}

/* Form inputs */
.form-control {
  min-height: 48px;
}

/* Redesigned travel cards */
.travel-card {
  background-color: #b8e8ba;
  border-radius: 12px;
  padding: 22px 18px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;

  min-height: 0;
}

/* Icon and title */
.card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.mode-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #1c1c1c;

  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-title {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.3;
  min-height: 48px;
  margin: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

/* CO2 highlight */
.emissions-panel {
  background: rgba(255, 255, 255, 0.45);
  border-radius: 9px;
  padding: 12px 6px;
  min-height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  color: #064e3b;
}

.emissions-value {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1.1;
}

.emissions-unit {
  font-size: 0.95rem;
  font-weight: 700;
}

.unavailable {
  font-size: 0.9rem;
  font-weight: 600;
}

/* Distance and duration */
.journey-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-items: center;

  padding: 16px 0;
  margin-top: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.8);
}

.stat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.92rem;
  font-weight: 600;
}

.stat + .stat {
  border-left: 1px solid rgba(0, 0, 0, 0.2);
}

.stat span {
  overflow-wrap: anywhere;
}

/* Public transport approximation */
.proxy-note {
  font-size: 0.75rem;
  color: #3f5444;
  margin: 8px 0 0;
}

/* Description */
.mode-description {
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 14px 0 18px;
  flex-grow: 1;
}

/* Save Journey button */
.save-journey-btn {
  background-color: #146c43;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 11px 12px;
  width: 100%;
  font-weight: 600;
  margin-top: auto;
}

.save-journey-btn:hover:not(:disabled) {
  background-color: #0f5132;
  color: #ffffff;
}

.save-journey-btn:disabled {
  opacity: 0.65;
}

/* Car comparison baseline */
.car-baseline-note {
  font-size: 0.82rem;
  font-weight: 600;
  color: #375b43;
  padding: 11px 0;
  margin-top: auto;
}

/* Rating card */
.rating-card {
  border-radius: 12px;
}

/* BR E.3 - Visible keyboard focus */
.compare-page button:focus-visible,
.compare-page a:focus-visible,
.compare-page input:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

/* Visible focus for results heading */
.compare-page h2:focus {
  outline: 3px solid #14532d;
  outline-offset: 5px;
  border-radius: 4px;
}

/* Strong focus for green buttons */
.save-journey-btn:focus-visible {
  outline: 3px solid #111827;
  outline-offset: 3px;
}

/* Responsive */
@media (max-width: 1199.98px) {
  .travel-card {
    padding: 20px;
  }
}

@media (max-width: 575.98px) {
  .container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .results-section {
    padding: 18px !important;
  }

  .travel-card {
    padding: 20px;
  }

  .mode-title {
    min-height: auto;
  }

  .emissions-value {
    font-size: 1.5rem;
  }

  .journey-stats {
    gap: 12px;
  }
}
</style>
