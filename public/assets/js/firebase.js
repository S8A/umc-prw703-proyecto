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
  collection,
  doc,
  getDocs,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

import { TrainingSession, ExerciseItem, SetType } from './data-classes.js';


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
 * @returns {*}
 */

/**
 * Callback executed after failing to create a new user.
 * @callback userCreationErrorCallback
 * @param {AuthError} error
 * @returns {*}
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
 * @returns {*}
 */

/**
 * Callback executed after the user's sign in attempt fails.
 * @callback userSignInErrorCallback
 * @param {AuthError} error
 * @returns {*}
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


/* TRAINING SESSIONS */

/**
 * Firestore data converter for the TrainingSession class.
 */
const trainingSessionConverter = {
  toFirestore: (trainingSession) => {
    return {
      date: trainingSession.date,
      time: trainingSession.time,
      exercises: trainingSession.exercises,
      shortTitle: trainingSession.shortTitle,
      duration: trainingSession.duration,
      bodyweight: trainingSession.bodyweight,
      comments: trainingSession.comments,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const exercisesSnapshot = await getDocs(
        collection(data.ref, 'exercises').withConverter(exerciseItemConverter));

    // TODO: Need to explicitly convert each item?
    // const exercises = exercisesSnapshot.docs.map(documentSnapshot => {
    //     return exerciseItemConverter.fromFirestore(documentSnapshot, options);
    // });

    return new TrainingSession(
        data.date,
        data.time,
        exercisesSnapshot.docs,
        data.shortTitle,
        data.duration,
        data.bodyweight,
        data.comments
    );
  }
}


/**
 * Firestore data converter for the ExerciseItem class.
 */
 const exerciseItemConverter = {
  toFirestore: (exerciseItem) => {
    return {
      exercise: exerciseItem.exercise,
      setType: exerciseItem.setType.name,
      sets: exerciseItem.sets,
      reps: exerciseItem.reps,
      weight: exerciseItem.weight,
      comments: exerciseItem.comments,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new ExerciseItem(
      data.exercise,
      data.setType,
      data.reps,
      data.weight,
      data.coments
    );
  }
}

