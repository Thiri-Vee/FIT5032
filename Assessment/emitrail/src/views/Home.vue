<script setup>
// Landing page. Static, informational content only.
import AppIcon from '../components/AppIcon.vue'

// Feature cards shown on the home page
const features = [
  {
    icon: 'route',
    title: 'Compare your journey',
    text: 'Enter a trip and see walking, cycling, public transport and car options side by side by distance and estimated emissions.',
    to: '/compare',
    link: 'Open the comparison tool',
  },
  {
    icon: 'trending',
    title: 'Track your impact',
    text: 'Log sustainable journeys and watch your accumulated distance, trips and estimated emissions avoided add up over time.',
    to: '/impact',
    link: 'View my impact',
  },
  {
    icon: 'map',
    title: 'Explore active places',
    text: 'Find walking trails, cycling routes, parks and sporting facilities near you, with community ratings and reviews.',
    to: '/explore',
    link: 'Explore places',
  },
  {
    icon: 'users',
    title: 'Join the community',
    text: 'Take part in challenges like Car-Free Week and earn milestone badges as individual choices become shared local action.',
    to: '/about',
    link: 'Learn more',
  },
]

// Simple three-step explanation
const steps = [
  {
    n: '1',
    title: 'Enter a journey',
    text: 'Add your start, destination and distance in the comparison tool.',
  },
  {
    n: '2',
    title: 'See the difference',
    text: 'Compare estimated emissions across transport modes using published data.',
  },
  {
    n: '3',
    title: 'Log and track',
    text: 'Save active trips and follow your climate impact on your dashboard.',
  },
]

// Transport modes with indicative emission factors (kg CO2 per km)
const modes = [
  { icon: 'walk', name: 'Walking', note: 'Zero direct emissions' },
  { icon: 'bike', name: 'Cycling', note: 'Zero direct emissions' },
  { icon: 'bus', name: 'Public transport', note: 'Lower-emission shared travel' },
  { icon: 'car', name: 'Car', note: 'Highest emissions per trip' },
]
</script>

<template>
  <div class="home-page">
    <!-- Hero -->
    <section class="container py-5">
      <div class="row align-items-center g-4 g-lg-5">
        <div class="col-12 col-lg-6">
          <p class="eyebrow mb-2">Melbourne climate action</p>

          <h1 class="display-5 fw-bold mb-3">Make every journey count.</h1>

          <p class="lead text-muted mb-4">
            Emitrail helps you compare the environmental impact of how you travel, track your active
            trips over time, and turn small everyday choices into meaningful community climate
            action.
          </p>

          <div class="d-flex flex-column flex-sm-row gap-2">
            <RouterLink
              to="/compare"
              class="btn btn-brand btn-lg d-inline-flex align-items-center gap-2"
            >
              Compare a journey
              <AppIcon name="arrow" :size="18" />
            </RouterLink>

            <RouterLink to="/explore" class="btn btn-outline-dark btn-lg"
              >Explore places</RouterLink
            >
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <img
            src="/images/hero-home.svg"
            alt="A winding active-travel route through green hills"
            class="illustration"
          />
        </div>
      </div>
    </section>

    <!-- What you can do -->
    <section class="section-soft border-top border-bottom py-5">
      <div class="container">
        <div class="row justify-content-center text-center mb-4">
          <div class="col-12 col-lg-8">
            <p class="eyebrow mb-2">What you can do</p>
            <h2 class="fw-bold">One simple platform for sustainable travel</h2>
          </div>
        </div>

        <div class="row g-4">
          <div v-for="feature in features" :key="feature.title" class="col-12 col-md-6 col-xl-3">
            <div class="card h-100 border-0 shadow-sm feature-card">
              <div class="card-body p-4 d-flex flex-column">
                <span class="icon-tile mb-3">
                  <AppIcon :name="feature.icon" />
                </span>

                <h3 class="h5 fw-bold">{{ feature.title }}</h3>
                <p class="text-muted flex-grow-1">{{ feature.text }}</p>

                <RouterLink :to="feature.to" class="fw-semibold text-decoration-none feature-link">
                  {{ feature.link }} →
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="container py-5">
      <div class="row justify-content-center text-center mb-4">
        <div class="col-12 col-lg-8">
          <p class="eyebrow mb-2">How it works</p>
          <h2 class="fw-bold">Three steps to a lighter footprint</h2>
        </div>
      </div>

      <div class="row g-4">
        <div v-for="step in steps" :key="step.n" class="col-12 col-md-4">
          <div class="d-flex gap-3">
            <span class="step-number">{{ step.n }}</span>
            <div>
              <h3 class="h6 fw-bold mb-1">{{ step.title }}</h3>
              <p class="text-muted mb-0">{{ step.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Transport modes strip -->
    <section class="section-soft border-top py-5">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-4">
            <h2 class="fw-bold mb-2">Every mode, compared</h2>
            <p class="text-muted mb-0">
              Emitrail uses established, published emission-factor data so you can see how transport
              choices really compare.
            </p>
          </div>

          <div class="col-12 col-lg-8">
            <div class="row g-3">
              <div v-for="mode in modes" :key="mode.name" class="col-6 col-lg-3">
                <div class="mode-chip h-100 text-center p-3 bg-white rounded-3 border">
                  <span class="icon-tile mb-2">
                    <AppIcon :name="mode.icon" />
                  </span>
                  <div class="fw-semibold">{{ mode.name }}</div>
                  <div class="small text-muted">{{ mode.note }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to action -->
    <section class="container py-5">
      <div class="cta-panel text-center p-5 rounded-4">
        <h2 class="fw-bold mb-2">Ready to see the difference?</h2>
        <p class="text-muted mb-4">
          Create a free account to log journeys, track your impact and join community challenges.
        </p>
        <RouterLink to="/register" class="btn btn-dark btn-lg">Create an account</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.feature-card {
  transition: transform 0.15s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
}

.feature-link {
  color: var(--brand-green-dark);
}

/* Numbered step marker */
.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--brand-green);
  color: #1c1c1c;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cta-panel {
  background-color: var(--brand-green);
}

.cta-panel .text-muted {
  color: #2f4f33 !important;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  h1.display-5 {
    font-size: 2rem;
  }
}
</style>
