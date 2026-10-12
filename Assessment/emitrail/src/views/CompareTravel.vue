<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/init.js'
import { currentUser } from '../auth/auth.js'
import AppIcon from '../components/AppIcon.vue'
import { travelModes } from '../data/travelModes'
import { getAverageRating, getRatings, saveRating } from '../data/ratings.js'
import { containsUnsafeContent, sanitizeText } from '../security/security.js'

// Existing comparison form
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

// Existing rating feature
const selectedRating = ref(0)
const averageRating = ref(0)
const ratingCount = ref(0)
const ratingMessage = ref('')

const loadRatingSummary = () => {
  const ratings = getRatings()
  averageRating.value = getAverageRating()
  ratingCount.value = ratings.length
}

const submitRating = () => {
  ratingMessage.value = ''

  if (selectedRating.value < 1 || selectedRating.value > 5) {
    ratingMessage.value = 'Please select a rating from 1 to 5.'
    return
  }

  if (!auth.currentUser) {
    ratingMessage.value = 'Please log in before submitting a rating.'
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

// Existing validation
const locationPattern = /[A-Za-z]/

const clearError = (field) => {
  errors[field] = ''
}

const comparisonResults = computed(() => {
  const distance = Number(form.distance)

  if (!Number.isFinite(distance) || distance <= 0) {
    return []
  }

  return travelModes.map((mode) => ({
    ...mode,
    emissions: (distance * mode.emissionFactor).toFixed(2),
  }))
})

const validateForm = () => {
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

const compareTravel = () => {
  if (!validateForm()) {
    formSubmitted.value = false
    return
  }

  formSubmitted.value = true
  savedModes.value = []
  saveMessage.value = ''
  saveError.value = false

  const comparison = {
    startLocation: sanitizeText(form.startLocation),
    destination: sanitizeText(form.destination),
    distance: Number(form.distance),
    date: new Date().toISOString(),
  }

  localStorage.setItem(
    'emitrailLastComparison',
    JSON.stringify(comparison),
  )
}

// Hide outdated results when journey inputs change
watch(form, () => {
  savedModes.value = []
  formSubmitted.value = false
  saveMessage.value = ''
  saveError.value = false
})

// BR D.3 - Save Journey to Cloud Firestore
const isSaving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)

async function saveJourney(mode) {
  if (isSaving.value || savedModes.value.includes(mode.name)) return

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

  // Only sustainable modes can be logged
  if (mode.name === 'Car') {
    saveMessage.value = 'Select a sustainable travel mode.'
    saveError.value = true
    return
  }

  const distanceKm = Number(form.distance)

  const carMode = travelModes.find(
    (item) => item.name === 'Car',
  )

  if (!carMode) {
    saveMessage.value = 'Car emission data is unavailable.'
    saveError.value = true
    return
  }

  const carEmissions = distanceKm * carMode.emissionFactor
  const selectedEmissions = distanceKm * mode.emissionFactor

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

    saveMessage.value =
      `${mode.name} journey saved successfully! ` +
      `Estimated CO₂ saved: ${co2SavedKg.toFixed(2)} kg.`

    savedModes.value = [...savedModes.value, mode.name]
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
</script>

<template>
  <div class="compare-page">
    <!-- Page intro -->
    <section class="section-soft border-bottom">
      <div class="container py-5">
        <div class="row justify-content-center text-center">
          <div class="col-12 col-lg-9">
            <p class="eyebrow mb-2">Active travel comparison</p>
            <h1 class="fw-bold mb-3">Compare how you travel</h1>
            <p class="lead text-muted mb-0">
              Enter a journey and compare walking, cycling, public transport and car travel by
              distance and estimated emissions, using established published emission-factor data.
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-5">
      <div class="row g-4 g-lg-5">

        <!-- Travel comparison form -->
        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h5 fw-bold mb-3">Journey details</h2>

              <form @submit.prevent="compareTravel" novalidate>
                <!-- Start location -->
                <div class="mb-4">
                  <label for="startLocation" class="form-label fw-bold">
                    Start location
                  </label>

                  <input
                    id="startLocation"
                    v-model="form.startLocation"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.startLocation }"
                    @input="clearError('startLocation')"
                  />

                  <div class="invalid-feedback">
                    {{ errors.startLocation }}
                  </div>
                </div>

                <!-- Destination -->
                <div class="mb-4">
                  <label for="destination" class="form-label fw-bold">
                    Destination
                  </label>

                  <input
                    id="destination"
                    v-model="form.destination"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.destination }"
                    @input="clearError('destination')"
                  />

                  <div class="invalid-feedback">
                    {{ errors.destination }}
                  </div>
                </div>

                <!-- Travel distance -->
                <div class="mb-4">
                  <label for="distance" class="form-label fw-bold">
                    Distance (km)
                  </label>

                  <input
                    id="distance"
                    v-model="form.distance"
                    type="number"
                    min="0.1"
                    step="0.1"
                    class="form-control"
                    :class="{ 'is-invalid': errors.distance }"
                    @input="clearError('distance')"
                  />

                  <div class="invalid-feedback">
                    {{ errors.distance }}
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-dark px-4 w-100"
                >
                  Compare
                </button>
              </form>

              <p class="small text-muted mt-3 mb-0">
                Your latest comparison is saved locally on this device.
                If you choose to save a journey, its details will also
                be stored securely in Cloud Firestore under your account.
              </p>
            </div>
          </div>
        </div>

        <!-- Result area -->
        <div class="col-12 col-lg-8">
          <section class="results-section p-4">
            <h2 class="fw-bold mb-4">Results</h2>

            <!-- Empty state -->
            <div v-if="!formSubmitted" class="text-center py-4">
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
              <div class="row g-3">
                <div
                  v-for="mode in comparisonResults"
                  :key="mode.id"
                  class="col-12 col-md-6 col-xl-3"
                >
                  <div class="travel-card h-100 p-4">
                    <span class="mode-icon mb-2">
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

                    <h3 class="h5 text-center">
                      {{ mode.name }}
                    </h3>

                    <div class="card-details">
                      <strong>
                        {{ mode.emissions }} kg CO₂
                      </strong>

                      <p class="small mb-0 mt-2">
                        {{ mode.description }}
                      </p>

                      <!-- BR D.3 - Save Journey -->
                      <button
                        v-if="mode.name !== 'Car'"
                        type="button"
                        class="btn btn-brand btn-sm w-100 mt-3"
                        :disabled="isSaving || !currentUser || savedModes.includes(mode.name)"
                        @click="saveJourney(mode)"
                      >
                        {{ savedModes.includes(mode.name) ? 'Journey Saved' : isSaving ? 'Saving...' : 'Save Journey' }}
                      </button>
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

              <div
                v-if="saveMessage"
                class="alert mt-3 mb-0"
                :class="saveError ? 'alert-danger' : 'alert-success'"
                role="status"
              >
                {{ saveMessage }}
              </div>

              <RouterLink
                v-if="saveMessage && !saveError"
                to="/impact"
                class="btn btn-brand mt-3"
              >
                View My Travel History
              </RouterLink>
            </div>
          </section>

          <!-- Existing travel comparison rating -->
          <section class="mt-5">
            <div class="card p-4 shadow-sm">
              <h2 class="h4 mb-3">Rate the Travel Comparison</h2>

              <p class="mb-2">
                How useful was this travel comparison?
              </p>

              <div class="d-flex flex-wrap gap-2 mb-3">
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
                  @click="selectedRating = score"
                >
                  <AppIcon name="star" :size="16" />
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

              <p v-if="ratingMessage" class="mt-3 mb-0">
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
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Results area */
.results-section {
  background-color: #dedede;
  min-height: 420px;
  border-radius: 8px;
}

/* Form inputs */
.form-control {
  min-height: 48px;
}

/* Result card generated for each travel mode */
.travel-card {
  background-color: #b8e8ba;
  min-height: 330px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
}

/* Keep travel mode headings aligned */
.travel-card h3 {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Circular icon badge on each result card */
.mode-icon {
  align-self: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #1c1c1c;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Keep card details aligned */
.travel-card .card-details {
  min-height: 120px;
}

/* Tablet and smaller screens */
@media (max-width: 991.98px) {
  .results-section {
    min-height: auto;
  }

  .travel-card {
    min-height: 220px;
  }
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .results-section {
    padding: 20px !important;
  }

  .travel-card {
    min-height: 160px;
  }

  .travel-card h3,
  .travel-card .card-details {
    min-height: auto;
  }

  form .btn {
    width: 100%;
  }
}
</style>
