import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration (public keys - safe to expose)
const firebaseConfig = {
  apiKey: "AIzaSyDkGZErM37SBKwQST2Liafpp4zG59IORWQ",
  authDomain: "bookme-50db1.firebaseapp.com",
  projectId: "bookme-50db1",
  storageBucket: "bookme-50db1.firebasestorage.app",
  messagingSenderId: "919678012025",
  appId: "1:919678012025:web:b00d4594f76701fd65a2a8",
  measurementId: "G-5H7JK92DLF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set language to Russian for phone auth
auth.languageCode = 'ru';

