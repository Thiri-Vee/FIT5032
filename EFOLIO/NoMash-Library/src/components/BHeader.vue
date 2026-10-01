<script setup>
import { useRouter } from 'vue-router'
import { isAuthenticated, logoutUser } from '../auth'

const router = useRouter()

// Logout for the previous Week 5 login
const logout = () => {
  logoutUser()
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

        <!-- Previous Week 5 Login -->
        <li v-if="!isAuthenticated" class="nav-item">
          <router-link to="/login" class="nav-link" active-class="active"> Login </router-link>
        </li>

        <!-- Previous Week 5 Logout -->
        <li v-else class="nav-item">
          <button type="button" class="nav-link" @click="logout">Logout</button>
        </li>

        <!-- Firebase Register -->
        <li class="nav-item">
          <router-link to="/FireRegister" class="nav-link" active-class="active">
            Firebase Register
          </router-link>
        </li>

        <!-- Firebase Login -->
        <li class="nav-item">
          <router-link to="/FireLogin" class="nav-link" active-class="active">
            Firebase Login
          </router-link>
        </li>
        <!--Modify header info for add book-->
        <li class="nav-link">
          <router-link to="/addbook" class="nav-link" active-class="active">Add Book</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/GetBookCount" class="nav-link" acitve-class="active"
            >Get Book Count</router-link
          >
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
