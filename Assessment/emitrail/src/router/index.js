import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import CompareTravel from '../views/CompareTravel.vue'
import ExplorePlaces from '../views/ExplorePlaces.vue'
import MyImpact from '../views/MyImpact.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
//security resgister rule
import Register from '../views/Register.vue'
import Admin from '../views/Admin.vue'

import { getCurrentUser, authReadyPromise } from '../auth/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },

    {
      path: '/compare',
      name: 'compare',
      component: CompareTravel,
    },

    {
      path: '/explore',
      name: 'explore',
      component: ExplorePlaces,
    },

    {
      path: '/impact',
      name: 'impact',
      component: MyImpact,
    },

    {
      path: '/about',
      name: 'about',
      component: About,
    },

    {
      path: '/login',
      name: 'login',
      component: Login,
    },

    {
      path: '/register',
      name: 'register',
      component: Register,
    },

    {
      path: '/admin',
      name: 'admin',
      component: Admin,

      // Admin page requires authentication and admin role
      meta: {
        requiresAuth: true,
        role: 'admin',
      },
    },
  ],
})

// Check access before opening a page
router.beforeEach(async (to) => {
  // Wait until Firebase has restored the authentication session
  await authReadyPromise

  const currentUser = getCurrentUser()

  // Redirect authenticated users away from Login and Register
  if (currentUser && (to.path === '/login' || to.path === '/register')) {
    return '/'
  }

  // Block pages that require authentication
  if (to.meta.requiresAuth && !currentUser) {
    return '/login'
  }

  // Block access when the required role is missing
  if (to.meta.role && currentUser?.role !== to.meta.role) {
    return '/'
  }
})


export default router
