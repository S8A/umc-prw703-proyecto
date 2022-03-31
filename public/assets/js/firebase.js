import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  AuthError
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

import {
  getFirestore,
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';


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


/* USER ACCOUNTS */

/**
 * Callback executed after successfully creating a new user.
 * @callback userCreatedCallback
 * @param {UserCredential} userCredential
 */

/**
 * Callback executed after failing to create a new user.
 * @callback userCreationErrorCallback
 * @param {AuthError} error
 */

/**
 * Create a new user with the given email and password.
 * @param {string} email - Email of the new user.
 * @param {string} firstName - First name of the new user.
 * @param {string} lastName - Last name of the new user.
 * @param {string} password - Password of the new user.
 * @param {userCreatedCallback} successCallback
 * @param {userCreationErrorCallback} errorCallback
 * @returns {Promise} Promise with result of success or error callback.
 */
export async function createUser(
  email, firstName, lastName, password, successCallback, errorCallback
) {
  return createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;

    // Create user document to save the user's first and last name
    await setDoc(doc(db, 'users', user.uid), {
      name: {first: firstName, last: lastName}
    });

    // Execute callback function
    return successCallback(userCredential);
  })
  .catch((error) => errorCallback(error));
}


/**
 * Callback executed after the user signs in successfully.
 * @callback userSignedInCallback
 * @param {UserCredential} userCredential
 */

/**
 * Callback executed after the user's sign in attempt fails.
 * @callback userSignInErrorCallback
 * @param {AuthError} error
 */

/**
 * Sign in with the given user email and password.
 * @param {string} email - Email of the user.
 * @param {string} password - Password of the user.
 * @param {userSignedInCallback} successCallback
 * @param {userSignInErrorCallback} errorCallback
 * @returns {Promise} Promise with result of success or error callback.
 */
export async function signInUser(
  email, password, successCallback, errorCallback
) {
  return signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => successCallback(userCredential))
  .catch((error) => errorCallback(error));
}
