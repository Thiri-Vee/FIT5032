import { ref } from 'vue'

// Shared authentication state
export const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true')

export const loginUser = () => {
  localStorage.setItem('isAuthenticated', 'true')
  isAuthenticated.value = true
}

export const logoutUser = () => {
  localStorage.removeItem('isAuthenticated')
  isAuthenticated.value = false
}
