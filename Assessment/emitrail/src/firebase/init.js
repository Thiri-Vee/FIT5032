

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZ5RJVVg8IW-l3kGORIJjXGJ6VbIyarSw",
  authDomain: "emitrail-4c7e3.firebaseapp.com",
  projectId: "emitrail-4c7e3",
  storageBucket: "emitrail-4c7e3.firebasestorage.app",
  messagingSenderId: "25952538047",
  appId: "1:25952538047:web:93e9d4578e9a8deb93250a",
  measurementId: "G-60G99BBQ7G"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth }