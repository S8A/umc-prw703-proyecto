import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

'use strict';


// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBBWfS3Q02Y-z8_Ga6PF3tCMqH_gVJMV-o',
  authDomain: 's8a-training.firebaseapp.com',
  projectId: 's8a-training',
  storageBucket: 's8a-training.appspot.com',
  messagingSenderId: '154343225852',
  appId: '1:154343225852:web:31bbeaab42374c17805a79'
};


// Initialize Firebase
// export const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(app);

// Connect Firebase Authentication with local emulator
export const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");


// Initialize Cloud Firestore and get a reference to the service
// export const db = getFirestore(app);

// Connect Firestore with local emulator
export const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080);
