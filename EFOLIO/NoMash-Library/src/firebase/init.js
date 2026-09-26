import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

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
const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firestore
const db = getFirestore(firebaseApp)

// Initialize Firebase Authentication
const auth = getAuth(firebaseApp)

export { firebaseApp, db, auth }

export default db
