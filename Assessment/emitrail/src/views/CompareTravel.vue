<script setup>
import { reactive, ref } from 'vue'

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

// Clear the error message when the user updates a field
const clearError = (field) => {
  errors[field] = ''
}

// Location must contain at least one letter
const locationPattern = /[A-Za-z]/

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

          <p v-else>Travel information submitted successfully.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-section {
  background-color: #f5f5f5;
  min-height: 420px;
}

.form-control {
  min-height: 48px;
}

@media (max-width: 768px) {
  .results-section {
    min-height: auto;
  }
}
</style>
