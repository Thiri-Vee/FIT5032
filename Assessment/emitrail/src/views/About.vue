<script setup>
// About page. Static, informational content only.
import AppIcon from '../components/AppIcon.vue'

// Who Emitrail is built for
const audiences = ['Students', 'Young adults', 'Families', 'Community members']

// How Emitrail helps, drawn from the project mission
const pillars = [
  {
    icon: 'route',
    title: 'Transparent comparisons',
    text: 'The Active Travel Comparison tool shows walking, cycling, public transport and car travel by distance and estimated emissions using published emission-factor data.',
  },
  {
    icon: 'chart',
    title: 'Progress you can see',
    text: 'The Climate Impact Dashboard tracks accumulated distance, trips and estimated emissions avoided, so behaviour change is visible and motivating.',
  },
  {
    icon: 'award',
    title: 'Community momentum',
    text: 'Challenges such as Car-Free Week, milestone badges and leaderboards turn individual choices into a shared community effort.',
  },
  {
    icon: 'star',
    title: 'Local knowledge',
    text: 'Active-travel and recreation locations — trails, parks and sporting facilities — are shared with community ratings and reviews.',
  },
]

// Organisations that informed the concept
const influences = [
  { name: 'Bicycle Network', note: 'Practical resources and active-transport advocacy' },
  { name: 'Climate Council', note: 'Clear, evidence-based environmental messaging' },
  {
    name: 'Australian Conservation Foundation',
    note: 'Community engagement and action-oriented content',
  },
]
</script>

<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="container py-5">
      <div class="row align-items-center g-4 g-lg-5">
        <div class="col-12 col-lg-6">
          <p class="eyebrow mb-2">About Emitrail</p>
          <h1 class="fw-bold mb-3">Everyday travel, shared climate action</h1>
          <p class="lead text-muted mb-0">
            Emitrail is a proposed web application for a Melbourne-based not-for-profit that
            promotes climate action through community sport and active travel. It connects
            individual travel decisions with broader community climate action while encouraging
            healthier, more active lifestyles.
          </p>
        </div>

        <div class="col-12 col-lg-6">
          <img
            src="/images/about-mission.svg"
            alt="Community and climate action illustration"
            class="illustration"
          />
        </div>
      </div>
    </section>

    <!-- Mission + problem -->
    <section class="section-soft border-top border-bottom py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-12 col-lg-6">
            <h2 class="h4 fw-bold mb-3">The gap we address</h2>
            <p class="text-muted mb-0">
              Many people want to travel more sustainably but lack a clear, convenient way to
              compare the environmental impact of their options or to track their active-travel
              habits over time. Emitrail turns sustainable travel information into practical
              everyday choices through a simple and engaging platform.
            </p>
          </div>

          <div class="col-12 col-lg-6">
            <h2 class="h4 fw-bold mb-3">Our goal</h2>
            <p class="text-muted mb-0">
              To demonstrate how small, trackable changes in everyday travel behaviour can
              collectively contribute to healthier communities and meaningful local climate action —
              supporting walking, cycling and public transport as alternatives to private car use.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Who it's for -->
    <section class="container py-5">
      <div class="row align-items-center g-4">
        <div class="col-12 col-lg-4">
          <h2 class="fw-bold mb-2">Who it's for</h2>
          <p class="text-muted mb-0">
            Melbourne residents interested in affordable, active and environmentally responsible
            travel.
          </p>
        </div>

        <div class="col-12 col-lg-8">
          <div class="d-flex flex-wrap gap-2">
            <span v-for="audience in audiences" :key="audience" class="audience-pill">
              <AppIcon name="check" :size="16" />
              {{ audience }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- How Emitrail helps -->
    <section class="section-soft border-top py-5">
      <div class="container">
        <div class="row justify-content-center text-center mb-4">
          <div class="col-12 col-lg-8">
            <p class="eyebrow mb-2">How Emitrail helps</p>
            <h2 class="fw-bold">Information, tracking and community in one place</h2>
          </div>
        </div>

        <div class="row g-4">
          <div v-for="pillar in pillars" :key="pillar.title" class="col-12 col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4 d-flex gap-3">
                <span class="icon-tile flex-shrink-0">
                  <AppIcon :name="pillar.icon" />
                </span>
                <div>
                  <h3 class="h5 fw-bold">{{ pillar.title }}</h3>
                  <p class="text-muted mb-0">{{ pillar.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Informed by -->
    <section class="container py-5">
      <div class="row justify-content-center text-center mb-4">
        <div class="col-12 col-lg-8">
          <p class="eyebrow mb-2">Informed by research</p>
          <h2 class="fw-bold">Building on trusted organisations</h2>
        </div>
      </div>

      <div class="row g-4">
        <div v-for="item in influences" :key="item.name" class="col-12 col-md-4">
          <div class="border rounded-3 p-4 h-100">
            <h3 class="h6 fw-bold mb-1">{{ item.name }}</h3>
            <p class="small text-muted mb-0">{{ item.note }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.audience-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--brand-green);
  color: #1c1c1c;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 999px;
}

/* Mobile screens */
@media (max-width: 575.98px) {
  h1 {
    font-size: 1.9rem;
  }
}
</style>
