<script setup>
// Shared site footer. Keeps secondary links out of the main navigation
// so the top navbar stays uncluttered.
import AppIcon from './AppIcon.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer section-soft border-top mt-5">
    <div class="container py-5">
      <div class="row g-4">
        <!-- Brand blurb -->
        <div class="col-12 col-lg-5">
          <div class="d-flex align-items-center gap-2 mb-2">
            <img src="/images/logo.svg" alt="" width="34" height="34" />
            <span class="brand-font fw-bold fs-5">EMITRAIL</span>
          </div>

          <p class="text-muted mb-0" style="max-width: 34rem">
            A Melbourne not-for-profit initiative connecting everyday travel choices with community
            climate action, healthier lifestyles and active transport.
          </p>
        </div>

        <!-- Explore links -->
        <div class="col-6 col-lg-3">
          <h2 class="h6 fw-bold mb-3">Explore</h2>

          <ul class="list-unstyled d-grid gap-2 mb-0">
            <li>
              <RouterLink class="footer-link" to="/compare">Compare travel</RouterLink>
            </li>
            <li>
              <RouterLink class="footer-link" to="/explore">Explore places</RouterLink>
            </li>
            <li>
              <RouterLink class="footer-link" to="/impact">My impact</RouterLink>
            </li>
          </ul>
        </div>

        <!-- About links -->
        <div class="col-6 col-lg-4">
          <h2 class="h6 fw-bold mb-3">About</h2>

          <ul class="list-unstyled d-grid gap-2 mb-0">
            <li>
              <RouterLink class="footer-link" to="/about">Our mission</RouterLink>
            </li>
            <li>
              <RouterLink class="footer-link" to="/register">Create an account</RouterLink>
            </li>
            <li>
              <RouterLink class="footer-link" to="/login">Log in</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <hr class="my-4" />

      <div
        class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
      >
        <p class="small text-muted mb-0">
          © {{ year }} Emitrail. Built for community climate action.
        </p>

        <p class="small text-muted mb-0 d-flex align-items-center gap-2">
          <AppIcon name="leaf" :size="16" />
          Emissions figures use published emission-factor data.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  color: #333;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--brand-green-dark);
  text-decoration: underline;
}
</style>
