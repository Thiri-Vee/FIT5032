import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import CompareTravel from '../views/CompareTravel.vue'
import ExplorePlaces from '../views/ExplorePlaces.vue'
import MyImpact from '../views/MyImpact.vue'
import About from '../views/About.vue'

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
  ],
})

export default router
