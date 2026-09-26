import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// Firebase
import { initializeApp } from 'firebase/app'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyChGqv5k-bR4ChxpPbMperNnaCY7OG4nhc',
  authDomain: 'fit5032-ba823.firebaseapp.com',
  projectId: 'fit5032-ba823',
  storageBucket: 'fit5032-ba823.firebasestorage.app',
  messagingSenderId: '335336554854',
  appId: '1:335336554854:web:5c3441bd54e5225e9848a7'
}

// Initialize Firebase
initializeApp(firebaseConfig)

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
