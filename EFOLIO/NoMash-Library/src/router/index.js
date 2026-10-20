import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import AccessDeniedView from '../views/AccessDeniedView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import AddBookView from '../views/AddBookView.vue'
import GetBookCountView from '../views/GetBookCountView.vue'
import WeatherView from '../views/WeatherView.vue'
import CountBookAPI from '../views/CountBookAPI.vue'
import GetAllBookAPI from '../views/GetAllBookAPI.vue'

const routes = [
  {
    path: '/getbookcount',
    name: 'GetBookCount',
    component: GetBookCountView
  },
    {
    path: '/WeatherCheck',
    name: 'WeatherCheck',
    component: WeatherView
  },
      {
    path: '/CountBookAPI',
    name: 'CountBookAPI',
    component: CountBookAPI
  },
    {
    path: '/GetAllBookAPI',
    name: 'GetAllBookAPI',
    component:GetAllBookAPI
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },

  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDeniedView
  },

  // Firebase Sign In
  {
    path: '/FireLogin',
    name: 'FireLogin',
    component: FirebaseSigninView
  },

  // Firebase Registration
  {
    path: '/FireRegister',
    name: 'FireRegister',
    component: FirebaseRegisterView
  },

  {
    path: '/addbook',
    name: 'AddBook',
    component: AddBookView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for the previous Week 5 authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/access-denied')
  } else {
    next()
  }
})

export default router
