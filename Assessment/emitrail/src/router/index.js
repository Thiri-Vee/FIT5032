import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import CompareTravel from '../views/CompareTravel.vue'
import ExplorePlaces from '../views/ExplorePlaces.vue'
import MyImpact from '../views/MyImpact.vue'
import About from '../views/About.vue'
//added login and registers BR category C
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
//added admin router for role base auth
import Admin from '../views/Admin.vue'
import { getCurrentUser } from '../auth/auth.js'
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
      meta: {
        requiresAuth: true,
        role: 'admin',
      },
    },
  ],
})
router.beforeEach((to) => {
  const currentUser = getCurrentUser()

  // Block pages that require login
  if (to.meta.requiresAuth && !currentUser) {
    return '/login'
  }

  // Block users who do not have the required role
  if (to.meta.role && currentUser?.role !== to.meta.role) {
    return '/'
  }
})

export default router
