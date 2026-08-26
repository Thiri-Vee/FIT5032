//BR (A.1): Responsiveness -set up vue
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Create the Vue application
const app = createApp(App)

// Enable page routing
app.use(router)

// Mount Vue to the page
app.mount('#app')
