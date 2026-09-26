<script setup>
import { useRouter } from 'vue-router'
import { isAuthenticated, logoutUser } from '../auth'

const router = useRouter()

// Logout
const logout = () => {
  logoutUser()

  // Redirect to login page
  router.push('/login')
}
</script>

<template>
  <div class="container">
    <header class="d-flex justify-content-center py-3">
      <ul class="nav nav-pills">
        <!-- Home -->
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active"> Home (Week 5) </router-link>
        </li>

        <!-- About -->
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active"> About </router-link>
        </li>

        <!-- Login shown when user is NOT logged in -->
        <li v-if="!isAuthenticated" class="nav-item">
          <router-link to="/login" class="nav-link" active-class="active"> Login </router-link>
        </li>

        <!-- Logout shown when user IS logged in -->
        <li v-else class="nav-item">
          <button type="button" class="nav-link" @click="logout">Logout</button>
        </li>
      </ul>
    </header>
  </div>
</template>

<style scoped>
.nav-link {
  cursor: pointer;
}
</style>
