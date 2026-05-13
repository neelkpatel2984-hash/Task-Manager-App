// src/firebase/config.js

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDV_CAmIUzTITTRPI_ptffL7MsdKXrBDts",
  authDomain: "task-management-c3117.firebaseapp.com",
  projectId: "task-management-c3117",
  storageBucket: "task-management-c3117.firebasestorage.app",
  messagingSenderId: "172922773239",
  appId: "1:172922773239:web:c688d59363ced4c99dbdf2"
};

// Initialize Firebase (using global firebase object from index.html scripts)
// Note: We are using the compat version loaded via CDN in index.html
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();

console.log('%c✅ Firebase Initialized (Module)', 
    'color: #00e5ff; font-weight: bold;');
