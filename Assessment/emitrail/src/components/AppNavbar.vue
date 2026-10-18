
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Collapse from 'bootstrap/js/dist/collapse'
import { currentUser, logoutUser } from '../auth/auth.js'

const router = useRouter()

// BR E.3 - Keyboard accessibility
const navbarToggle = ref(null)
const navbarMenu = ref(null)

// Close mobile navigation when Escape is pressed
const handleNavbarKeydown = (event) => {
  if (event.key !== 'Escape') return

  const menu = navbarMenu.value

  if (!menu || !menu.classList.contains('show')) return

  // Use Bootstrap's Collapse API to close the menu
  const instance = Collapse.getOrCreateInstance(menu, {
    toggle: false,
  })

  instance.hide()

  // Return keyboard focus to the menu button
  navbarToggle.value?.focus()
}

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
  <!-- BR E.3 - Accessible responsive navigation -->
  <nav
    class="navbar navbar-expand-lg bg-white border-bottom py-2"
    aria-label="Main navigation"
  >
    <div class="container-fluid px-3 px-lg-4">

      <!-- Logo links back to the home page -->
      <RouterLink
        class="navbar-brand d-flex align-items-center gap-2 me-3"
        to="/"
        aria-label="Emitrail - Home"
      >
        <img
          src="/images/logo.svg"
          alt=""
          width="40"
          height="40"
        />
        <span class="brand-font brand-wordmark">
          EMITRAIL
        </span>
      </RouterLink>

      <!-- Mobile navigation toggle -->
      <button
        ref="navbarToggle"
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#emitrailNavbar"
        aria-controls="emitrailNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation menu"
      >
        <span
          class="navbar-toggler-icon"
          aria-hidden="true"
        ></span>
      </button>

      <!-- Collapsible navigation -->
      <div
        id="emitrailNavbar"
        ref="navbarMenu"
        class="collapse navbar-collapse"
        @keydown="handleNavbarKeydown"
      >

        <!-- Primary navigation links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <li class="nav-item">
            <RouterLink class="nav-link" to="/">
              Home
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/compare">
              Compare
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/explore">
              Explore
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/impact">
              My Impact
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/about">
              About
            </RouterLink>
          </li>

        </ul>

        <!-- Account actions -->
        <div
          class="nav-actions d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2"
        >

          <!-- Guest navigation -->
          <template v-if="!currentUser">

            <RouterLink
              class="btn btn-link nav-auth-link"
              to="/login"
            >
              Login
            </RouterLink>

            <RouterLink
              class="btn btn-brand"
              to="/register"
            >
              Register
            </RouterLink>

          </template>

          <!-- Logged-in navigation -->
          <template v-else>

            <span
              class="navbar-text small text-muted d-none d-lg-inline"
            >
              Hi, {{ currentUser.name }}
            </span>

            <!-- Admin dashboard -->
            <RouterLink
              v-if="currentUser?.role === 'admin'"
              class="btn btn-link nav-auth-link"
              to="/admin"
            >
              Admin Dashboard
            </RouterLink>

            <!-- Firebase logout -->
            <button
              class="btn btn-outline-dark btn-sm"
              type="button"
              @click="handleLogout"
            >
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

/* Plain text link style */
.nav-auth-link {
  color: #333;
  text-decoration: none;
  font-weight: 600;
}

.nav-auth-link:hover {
  color: var(--brand-green-dark);
}

/* BR E.3 - Visible keyboard focus */
.navbar a:focus-visible,
.navbar button:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
  border-radius: 6px;
}

/* Focus indicator on active navigation links */
.nav-link.router-link-active:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
  box-shadow: 0 0 0 2px #ffffff;
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
