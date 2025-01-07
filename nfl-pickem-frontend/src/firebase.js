import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBwsWrCbQaFhtjOaKcpS4Q6JN7pWTVMT_I",
    authDomain: "nfl-pickem-63f08.firebaseapp.com",
    projectId: "nfl-pickem-63f08",
    storageBucket: "nfl-pickem-63f08.firebasestorage.app",
    messagingSenderId: "895566577479",
    appId: "1:895566577479:web:14c55c0cc4bbd6edbb1662",
    measurementId: "G-JWYXZMFK0H"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
