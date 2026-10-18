
<script setup>
// Explore Places page with Firestore interactive table
import { onMounted, ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/init'
import AppIcon from '../components/AppIcon.vue'
import InteractiveTable from '../components/InteractiveTable.vue'

// --------------------------------------------------
// Existing location categories
// --------------------------------------------------

const categories = [
  {
    image: '/images/cat-walking.svg',
    title: 'Walking trails',
    text: 'Riverside paths, city loops and nature reserves for an easy active trip on foot.',
  },
  {
    image: '/images/cat-cycling.svg',
    title: 'Cycling trails',
    text: 'Shared paths and on-road routes linking suburbs, stations and the city.',
  },
  {
    image: '/images/cat-parks.svg',
    title: 'Parks & green space',
    text: 'Local parks and gardens that make a great destination for an active journey.',
  },
  {
    image: '/images/cat-sport.svg',
    title: 'Sporting facilities',
    text: 'Courts, ovals and community sport venues connected by walking and cycling routes.',
  },
]

// --------------------------------------------------
// Existing listing features
// --------------------------------------------------

const listingFeatures = [
  { icon: 'map', text: 'Location and distance from you' },
  { icon: 'route', text: 'Trail type, length and difficulty' },
  { icon: 'star', text: 'Community ratings out of 5' },
  { icon: 'users', text: 'Reviews from other members' },
]

// --------------------------------------------------
// BR D.3 - Firestore Places Table
// --------------------------------------------------

const places = ref([])
const loadingPlaces = ref(true)
const placesError = ref('')

const placeColumns = [
  { key: 'name', label: 'Place Name' },
  { key: 'category', label: 'Category' },
  { key: 'suburb', label: 'Suburb' },
  { key: 'distanceKm', label: 'Distance (km)' },
  { key: 'rating', label: 'Rating' },
]

// Retrieve places from Cloud Firestore
async function loadPlaces() {
  loadingPlaces.value = true
  placesError.value = ''

  try {
    const snapshot = await getDocs(collection(db, 'places'))

    places.value = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))
  } catch (error) {
    console.error('Error loading places:', error)

    placesError.value =
      'Unable to load places. Please try again.'
  } finally {
    loadingPlaces.value = false
  }
}

onMounted(loadPlaces)
</script>

<template>
  <div class="explore-page">

    <!-- Hero -->
    <section
      class="container py-5"
      aria-labelledby="explore-heading"
    >
      <div class="row justify-content-center text-center">
        <div class="col-12 col-lg-8">

          <p class="eyebrow mb-2">
            Explore places
          </p>

          <h1
            id="explore-heading"
            class="fw-bold mb-3"
          >
            Find active-travel and recreation spots near you
          </h1>

          <p class="lead text-muted mb-0">
            Discover walking trails, cycling routes, parks and
            sporting facilities across Melbourne — each with
            community ratings and reviews to help you choose
            your next trip.
          </p>

        </div>
      </div>
    </section>

    <!-- Category cards -->
    <section
      class="section-soft border-top border-bottom py-5"
      aria-labelledby="categories-heading"
    >
      <div class="container">

        <h2
          id="categories-heading"
          class="visually-hidden"
        >
          Explore location categories
        </h2>

        <div class="row g-4">
          <div
            v-for="category in categories"
            :key="category.title"
            class="col-12 col-md-6 col-xl-3"
          >
            <div class="card h-100 border-0 shadow-sm overflow-hidden">

              <!-- Decorative illustration -->
              <img
                :src="category.image"
                alt=""
                class="card-img-top"
              />

              <div class="card-body p-4">
                <h3 class="h5 fw-bold">
                  {{ category.title }}
                </h3>

                <p class="text-muted mb-0">
                  {{ category.text }}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Listing features -->
    <section
      class="container py-5"
      aria-labelledby="listing-features-heading"
    >
      <div class="row align-items-center g-4 g-lg-5">

        <div class="col-12 col-lg-6">

          <p class="eyebrow mb-2">
            Every listing
          </p>

          <h2
            id="listing-features-heading"
            class="fw-bold mb-3"
          >
            Enough detail to plan an active journey
          </h2>

          <ul class="list-unstyled d-grid gap-3 mb-0">
            <li
              v-for="feature in listingFeatures"
              :key="feature.text"
              class="d-flex align-items-center gap-3"
            >
              <span
                class="icon-tile flex-shrink-0"
                aria-hidden="true"
              >
                <AppIcon :name="feature.icon" />
              </span>

              <span>{{ feature.text }}</span>
            </li>
          </ul>

        </div>

        <div class="col-12 col-lg-6">

          <div class="review-preview border rounded-4 p-4 bg-white shadow-sm">

            <div class="d-flex justify-content-between align-items-center mb-2">

              <h3 class="h6 fw-bold mb-0">
                Capital City Trail
              </h3>

              <span
                class="badge text-bg-success"
                aria-label="Rating: 4.6 out of 5 stars"
              >
                4.6
                <span aria-hidden="true">★</span>
              </span>

            </div>

            <p class="small text-muted mb-3">
              Shared cycling &amp; walking path · 29 km loop
            </p>

            <div class="border-top pt-3">

              <div class="d-flex align-items-center gap-2 mb-1">

                <span aria-hidden="true">
                  <AppIcon name="star" :size="16" />
                </span>

                <span class="small fw-semibold">
                  Great car-free commute
                </span>

              </div>

              <p class="small text-muted mb-0">
                “Flat, well signed and mostly separated from traffic
                — my go-to route into the city.”
              </p>

            </div>

          </div>

        </div>
      </div>
    </section>

    <!-- BR D.3 - Interactive Firestore Places Table -->
    <section
      class="section-soft border-top py-5"
      aria-labelledby="places-heading"
    >
      <div class="container">

        <div class="row mb-4">
          <div class="col-12 col-lg-8">

            <p class="eyebrow mb-2">
              Explore Melbourne
            </p>

            <h2
              id="places-heading"
              class="fw-bold mb-3"
            >
              Browse active travel locations
            </h2>

            <p class="text-muted mb-0">
              Discover walking trails, cycling routes, parks and
              sporting facilities. Search, filter and sort
              locations to find places that interest you.
            </p>

            <p class="small text-muted mt-2 mb-0">
              Demonstration dataset: distances and ratings are
              illustrative, not verified live measurements
              or community reviews.
            </p>

          </div>
        </div>

        <!-- Loading -->
        <div
          v-if="loadingPlaces"
          class="text-center py-4"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            class="spinner-border text-success"
            aria-hidden="true"
          ></div>

          <p class="text-muted mt-3 mb-0">
            Loading places...
          </p>
        </div>

        <!-- Firestore error -->
        <div
          v-else-if="placesError"
          class="alert alert-danger"
          role="alert"
        >
          <p class="mb-2">
            {{ placesError }}
          </p>

          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            aria-label="Retry loading places"
            @click="loadPlaces"
          >
            Retry
          </button>
        </div>

        <!-- Interactive table -->
        <div v-else>

          <p
            class="visually-hidden"
            role="status"
            aria-live="polite"
          >
            {{ places.length }} places loaded successfully.
          </p>

          <InteractiveTable
            :rows="places"
            :columns="placeColumns"
          />

        </div>

      </div>
    </section>

  </div>
</template>

<style scoped>
.card-img-top {
  background-color: #eef6ef;
}

/* BR E.3 - Keyboard focus visibility */
.explore-page button:focus-visible,
.explore-page a:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  h1 {
    font-size: 1.9rem;
  }
}
</style>
