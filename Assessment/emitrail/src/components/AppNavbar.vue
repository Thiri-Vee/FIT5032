<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, logoutUser } from '../auth/auth.js'

const router = useRouter()

// Store the currently logged-in user
const currentUser = ref(getCurrentUser())

// Log the current user out
const handleLogout = () => {
  logoutUser()
  currentUser.value = null
  router.push('/login')
}
</script>

<template>
  <!-- Responsive navigation bar using Bootstrap -->
  <nav class="navbar navbar-expand-xl bg-white border-bottom">
    <div class="container-fluid px-3 px-lg-4">
      <!-- Logo links back to the home page -->
      <RouterLink class="navbar-brand d-flex align-items-center me-3" to="/">
        <div class="logo-circle">EMITRAIL</div>
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
        <ul class="navbar-nav ms-auto align-items-xl-center">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/"> Home </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/compare"> Compare Travel </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/explore"> Explore Places </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/impact"> My Impact </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/about"> About </RouterLink>
          </li>

          <!-- Show login and register when the user is not logged in -->
          <template v-if="!currentUser">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/login"> Login </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/register"> Register </RouterLink>
            </li>
          </template>

          <!-- Show admin link and logout when the user is logged in -->
          <template v-else>
            <!-- Only show Admin Dashboard to admin users -->
            <li v-if="currentUser?.role === 'admin'" class="nav-item">
              <RouterLink class="nav-link" to="/admin"> Admin Dashboard </RouterLink>
            </li>

            <!-- Logout button -->
            <li class="nav-item">
              <button class="nav-link btn btn-link" type="button" @click="handleLogout">
                Logout
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Emitrail logo */
.logo-circle {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #b8e8ba;

  display: flex;
  align-items: center;
  justify-content: center;

  font-family: Georgia, serif;
  font-weight: 600;
  font-size: 15px;
}

/* Navigation links */
.nav-link {
  color: #222;
  padding: 10px 12px !important;
  border-radius: 6px;
  white-space: nowrap;
}

/* Highlight the current page */
.router-link-active.nav-link {
  background-color: #b8e8ba;
}

/* Tablet and smaller screens */
@media (max-width: 1199.98px) {
  .navbar-collapse {
    margin-top: 15px;
  }

  .nav-link {
    padding: 10px !important;
  }

  .navbar-nav {
    gap: 4px;
  }
}

/* Mobile screens */
@media (max-width: 575.98px) {
  .logo-circle {
    width: 55px;
    height: 55px;
    font-size: 13px;
  }

  .navbar {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .nav-link {
    width: 100%;
    padding: 10px !important;
  }
}
</style>
