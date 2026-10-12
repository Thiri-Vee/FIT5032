<script setup>
import { useRouter } from 'vue-router'
import { currentUser, logoutUser } from '../auth/auth.js'

const router = useRouter()

// BR D.1 - Firebase logout
const handleLogout = async () => {
  try {
    await logoutUser()
    await router.push('/login')
  } catch (error) {
    console.error('Firebase logout error:', error)
    alert('Unable to log out. Please try again.')
  }
}
</script>


<template>
  <!-- Responsive navigation bar using Bootstrap -->
  <nav class="navbar navbar-expand-lg bg-white border-bottom py-2">
    <div class="container-fluid px-3 px-lg-4">
      <!-- Logo links back to the home page -->
      <RouterLink class="navbar-brand d-flex align-items-center gap-2 me-3" to="/">
        <img src="/images/logo.svg" alt="" width="40" height="40" />
        <span class="brand-font brand-wordmark">EMITRAIL</span>
      </RouterLink>

      <!-- Button appears when the screen becomes smaller -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#emitrailNavbar"
        aria-controls="emitrailNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation links collapse into the mobile menu -->
      <div id="emitrailNavbar" class="collapse navbar-collapse">
        <!-- Primary sections -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/compare">Compare</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/explore">Explore</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/impact">My Impact</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/about">About</RouterLink>
          </li>
        </ul>

        <!-- Account actions, visually separated from the main sections -->
        <div
          class="nav-actions d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2"
        >
          <!-- Show login and register when the user is not logged in -->
          <template v-if="!currentUser">
            <RouterLink class="btn btn-link nav-auth-link" to="/login">Login</RouterLink>
            <RouterLink class="btn btn-brand" to="/register">Register</RouterLink>
          </template>

          <!-- Show admin link and logout when the user is logged in -->
          <template v-else>
            <span class="navbar-text small text-muted d-none d-lg-inline">
              Hi, {{ currentUser.name }}
            </span>

            <!-- Only show Admin Dashboard to admin users -->
            <RouterLink
              v-if="currentUser?.role === 'admin'"
              class="btn btn-link nav-auth-link"
              to="/admin"
            >
              Admin Dashboard
            </RouterLink>

            <!-- Logout button -->
            <button class="btn btn-outline-dark btn-sm" type="button" @click="handleLogout">
              Logout
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Emitrail wordmark next to the logo */
.brand-wordmark {
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.03em;
  color: #1c1c1c;
}

/* Navigation links */
.nav-link {
  color: #333;
  padding: 8px 12px !important;
  border-radius: 6px;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: #f0f5f0;
}

/* Highlight the current page */
.router-link-active.nav-link {
  background-color: var(--brand-green);
  color: #1c1c1c;
}

/* Plain text link style for the secondary account action */
.nav-auth-link {
  color: #333;
  text-decoration: none;
  font-weight: 600;
}

.nav-auth-link:hover {
  color: var(--brand-green-dark);
}

/* Tablet and smaller screens */
@media (max-width: 991.98px) {
  .navbar-collapse {
    margin-top: 12px;
  }

  .nav-actions {
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--brand-line);
  }
}
</style>
