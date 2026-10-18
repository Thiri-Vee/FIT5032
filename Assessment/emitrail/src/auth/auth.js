
import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/init.js'

// Shared Firebase authentication state
export const currentUser = ref(null)
export const authReady = ref(false)

// Wait until Firebase restores the session
// AND the user's Firestore role has been loaded.
export const authReadyPromise = new Promise((resolve) => {
  onAuthStateChanged(
    auth,

    async (firebaseUser) => {
      // Prevent showing a previous user's profile
      currentUser.value = null

      if (firebaseUser) {
        try {
          // Retrieve the user's Firestore profile
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userSnapshot = await getDoc(userRef)

          const profile = userSnapshot.exists()
            ? userSnapshot.data()
            : null

          // Use the role stored in Firestore.
          // Accounts without a profile default to "user".
          const role =
            profile?.role === 'admin' ? 'admin' : 'user'

          currentUser.value = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name:
              profile?.name ||
              firebaseUser.displayName ||
              firebaseUser.email,
            email: firebaseUser.email,
            role,
          }
        } catch (error) {
          console.error(
            'Error loading Firestore user profile:',
            error,
          )

          // If Firestore cannot be accessed, do not
          // grant administrator privileges.
          currentUser.value = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name:
              firebaseUser.displayName ||
              firebaseUser.email,
            email: firebaseUser.email,
            role: 'user',
          }
        }
      } else {
        currentUser.value = null
      }

      authReady.value = true
      resolve()
    },

    (error) => {
      console.error(
        'Firebase authentication state error:',
        error,
      )

      currentUser.value = null
      authReady.value = true
      resolve()
    },
  )
})

// Get the currently authenticated user
export const getCurrentUser = () => currentUser.value

// Sign out through Firebase
export const logoutUser = async () => {
  await signOut(auth)
}
