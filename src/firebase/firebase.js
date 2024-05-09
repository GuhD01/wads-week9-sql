import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBedda7Nzp9ZhhTkBHUba3sYsb6XQa8uyg",
  authDomain: "randy-todoapp.firebaseapp.com",
  projectId: "randy-todoapp",
  storageBucket: "randy-todoapp.appspot.com",
  messagingSenderId: "136577990737",
  appId: "1:136577990737:web:1926a40156f8f584227870",
  measurementId: "G-QXK6SG06XJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app); // Initialize Firestore
const provider = new GoogleAuthProvider();


export { app, auth, storage, db, provider }; // Export the Firestore instance