import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'


// Create Vue application
const app = createApp(App)

// PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

// Vue Router
app.use(router)

// Mount Vue application
app.mount('#app')
