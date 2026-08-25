import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CompareTravelView from '../views/CompareTravelView.vue'
import ExplorePlacesView from '../views/ExplorePlacesView.vue'
import MyImpactView from '../views/MyImpactView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareTravelView,
    },
    {
      path: '/explore',
      name: 'explore',
      component: ExplorePlacesView,
    },
    {
      path: '/impact',
      name: 'impact',
      component: MyImpactView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
  ],
})

export default router
