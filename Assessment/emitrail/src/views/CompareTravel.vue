<script setup>
//travelmodes mock data imported
import { computed, reactive, ref } from 'vue'
import { travelModes } from '../data/travelModes'

// Store values entered in the travel form
const form = reactive({
  startLocation: '',
  destination: '',
  distance: '',
})

// Store validation messages for each input
const errors = reactive({
  startLocation: '',
  destination: '',
  distance: '',
})

const formSubmitted = ref(false)

// Location must contain at least one letter
const locationPattern = /[A-Za-z]/

// Clear the error message when the user updates a field
const clearError = (field) => {
  errors[field] = ''
}

// Calculate CO2 emissions for each travel mode using the entered distance
const comparisonResults = computed(() => {
  const distance = Number(form.distance)

  if (!distance || distance <= 0) {
    return []
  }

  return travelModes.map((mode) => ({
    ...mode,
    emissions: (distance * mode.emissionFactor).toFixed(2),
  }))
})

// Check the form before allowing the comparison
const validateForm = () => {
  let isValid = true

  // Clear old validation messages
  errors.startLocation = ''
  errors.destination = ''
  errors.distance = ''

  // Required field validation
  // Check that a start location has been entered
  if (!form.startLocation.trim()) {
    errors.startLocation = 'Start location is required.'
    isValid = false
  } else if (!locationPattern.test(form.startLocation)) {
    errors.startLocation = 'Please enter a valid start location.'
    isValid = false
  }

  // Check that a valid destination has been entered
  if (!form.destination.trim()) {
    errors.destination = 'Destination is required.'
    isValid = false
  } else if (!locationPattern.test(form.destination)) {
    errors.destination = 'Please enter a valid destination.'
    isValid = false
  }

  // Numeric validation for distance
  if (form.distance === '') {
    errors.distance = 'Distance is required.'
    isValid = false
  } else if (Number(form.distance) <= 0) {
    errors.distance = 'Distance must be greater than 0.'
    isValid = false
  }

  return isValid
}

// Run validation when the Compare button is clicked
const compareTravel = () => {
  if (!validateForm()) {
    formSubmitted.value = false
    return
  }

  formSubmitted.value = true

  // Save the latest valid comparison for future sessions
  const comparison = {
    startLocation: form.startLocation,
    destination: form.destination,
    distance: Number(form.distance),
    date: new Date().toISOString(),
  }

  localStorage.setItem('emitrailLastComparison', JSON.stringify(comparison))
}
</script>

<template>
  <div class="container py-5">
    <h1 class="fw-bold mb-4">Compare Travel</h1>

    <div class="row g-5">
      <!-- Travel comparison form -->
      <div class="col-12 col-lg-4">
        <form @submit.prevent="compareTravel" novalidate>
          <!-- Start location -->
          <div class="mb-4">
            <label for="startLocation" class="form-label fw-bold"> Start location </label>

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
            <label for="destination" class="form-label fw-bold"> Destination </label>

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
            <label for="distance" class="form-label fw-bold"> Distance (km) </label>

            <input
              id="distance"
              v-model="form.distance"
              type="number"
              min="0.1"
              step="0.1"
              class="form-control"
              :class="{ 'is-invalid': errors.distance }"
            />

            <div class="invalid-feedback">
              {{ errors.distance }}
            </div>
          </div>

          <button type="submit" class="btn btn-dark px-4">Compare</button>
        </form>
      </div>

      <!-- Result area will be developed for B.2 -->
      <div class="col-12 col-lg-8">
        <section class="results-section p-4">
          <h2 class="fw-bold mb-4">Results</h2>

          <p v-if="!formSubmitted" class="text-muted">
            Enter your journey information to compare travel options.
          </p>

          <div v-else class="row g-3">
            <!-- Display a result card for each travel mode -->
            <div v-for="mode in comparisonResults" :key="mode.id" class="col-12 col-md-6 col-xl-3">
              <div class="travel-card h-100 p-4">
                <h3 class="h5 text-center">
                  {{ mode.name }}
                </h3>

                <div class="card-details">
                  <strong> {{ mode.emissions }} kg CO₂ </strong>

                  <p class="small mb-0 mt-2">
                    {{ mode.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-section {
  background-color: #dedede;
  min-height: 420px;
}

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
}
.travel-card h3 {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.travel-card .card-details {
  min-height: 120px;
}
/* Adjust result cards for mobile screens */
@media (max-width: 767.98px) {
  .results-section {
    min-height: auto;
  }

  .travel-card {
    min-height: 170px;
  }
}
</style>
