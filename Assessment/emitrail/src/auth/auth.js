
import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/init.js'

// Shared Firebase authentication state
export const currentUser = ref(null)
export const authReady = ref(false)

// Listen for Firebase login, logout, and session restoration
export const authReadyPromise = new Promise((resolve) => {
  onAuthStateChanged(
    auth,
    (firebaseUser) => {
      if (firebaseUser) {
        currentUser.value = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          role: 'user',
        }
      } else {
        currentUser.value = null
      }

      authReady.value = true
      resolve()
    },
    (error) => {
      console.error('Firebase authentication state error:', error)
      currentUser.value = null
      authReady.value = true
      resolve()
    }
  )
})

// Get the currently authenticated user
export const getCurrentUser = () => currentUser.value

// Sign out through Firebase
export const logoutUser = async () => {
  await signOut(auth)
}
