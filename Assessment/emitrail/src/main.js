//BR (A.1): Responsiveness -set up vue
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
//bootstrap set up
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Create the Vue application
const app = createApp(App)

// Enable page routing
app.use(router)

// Mount Vue to the page
app.mount('#app')
