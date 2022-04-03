import {
  initializeApp,
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';

import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

import { TrainingSession, ExerciseItem, SetType } from './data-classes.js';
import { toISODateOnly, toISOTimeOnly } from './utils.js';


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
export const app = initializeApp(firebaseConfig);


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
 * Create a new user with the given email and password.
 *
 * @param {string} email - Email of the new user.
 * @param {string} firstName - First name of the new user.
 * @param {string} lastName - Last name of the new user.
 * @param {string} password - Password of the new user.
 * @returns {Promise}
 * Promise returned by Firebase's createUserWithEmailAndPassword() method.
 */
export function createUser(email, firstName, lastName, password) {
  return createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;

    // Create user document to save the user's first and last name,
    // as well as the creation timestamp
    return setDoc(doc(db, 'users', user.uid), {
      name: {first: firstName, last: lastName},
      created: serverTimestamp(),
    });
  });
}


/**
 * Sign in with the given user email and password.
 *
 * @param {string} email - Email of the user.
 * @param {string} password - Password of the user.
 * @returns {Promise}
 * Promise returned by Firebase's signInWithEmailAndPassword() method.
 */
export function signInUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}


/**
 * Gets the given user's data from their corresponding document in the
 * users collection.
 *
 * @param {string} uid - UID of the user whose data will be looked up.
 * @returns {Promise} Promise of snapshot of the document's data.
 */
export function getUserDoc(uid) {
  return getDoc(doc(db, 'users', uid));
}


/* TRAINING SESSIONS */

/**
 * Firestore data converter for the TrainingSession class.
 */
const trainingSessionConverter = {
  /**
   * Converts the TrainingSession to a data object that Firestore can store.
   *
   * @param {TrainingSession} trainingSession TrainingSession object to convert.
   * @returns {{
   *   dateTime: Date,
   *   shortTitle: string,
   *   duration: ?number,
   *   bodyweight: ?number,
   *   comments: string
   * }}
   * Data object with all the TrainingSession object's properties,
   * except its exercise items.
   */
  toFirestore: (trainingSession) => {
    return {
      dateTime: trainingSession.dateTime,
      // Exercise items must be added to the appropriate subcollection
      // exercises: trainingSession.exercises,
      exerciseItemsCount: trainingSession.exerciseItemsCount,
      shortTitle: trainingSession.shortTitle,
      duration: trainingSession.duration,
      bodyweight: trainingSession.bodyweight,
      comments: trainingSession.comments,
    };
  },

  /**
   * Converts the data object returned by Firestore into a TrainingSession.
   * @param {QueryDocumentSnapshot} snapshot
   * Snapshot with data read from the training session's document in Firestore.
   * @param {SnapshotOptions} options
   * Options that configure how data is retrieved from the snapshot.
   * @returns {TrainingSession}
   * TrainingSession object constructed with the data, not including
   * its exercise items.
   */
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    // Convert dateTime to Date object
    const dateTime = data.dateTime.toDate();

    // List of exercises must be queried separately from the
    // corresponding exercises subcollection; instead, create a list
    // of the same length as the number of exercises filled with null
    // so that the TrainingSession's exerciseItemsCount property
    // returns the correct count
    const exercises = [];
    for (let i = 0; i < data.exerciseItemsCount; i++) {
      exercises.push(null);
    }

    return new TrainingSession(
        toISODateOnly(dateTime),
        toISOTimeOnly(dateTime),
        exercises,
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
  /**
  * Converts the ExerciseItem to a data object that Firestore can store.
  *
  * @param {ExerciseItem} exerciseItem ExerciseItem to be converted.
  * @returns {{
  *   exercise: string,
  *   setType: string,
  *   sets: number,
  *   reps: number[],
  *   weight: ?number,
  *   comments: string
  * }} Data object with the ExerciseItem object's properties.
  */
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

  /**
   * Converts the data object returned by Firestore into an ExerciseItem.
   *
   * @param {QueryDocumentSnapshot} snapshot
   * Snapshot with data read from the exercise item's document in Firestore.
   * @param {SnapshotOptions} options
   * Options that configure how data is retrieved from the snapshot.
   * @returns {ExerciseItem} ExerciseItem object constructed with the data.
   */
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new ExerciseItem(
      data.exercise,
      SetType.enumValueOf(data.setType),
      data.reps,
      data.weight,
      data.coments
    );
  }
}


/**
 * Get the specified number of training sessions belonging to the user
 * with the given UID, optionally filtering by start and/or end date.
 *
 * @param {string} uid
 * UID of the user whose training sessions will be queried.
 * @param {number} queryLimit - Number of training sessions to retrieve.
 * @param {?Date} [startDate=null]
 * Start date by which to filter the training sessions, or null.
 * @param {?Date} [endDate=null]
 * End date by which to filter the training sessions, or null.
 * @param {?string} [cursorAction=null]
 * 'next' to get the next page (start after the cursor), 'prev' to get
 * the previous page (end before cursor); otherwise, get the first page.
 * @param {?QueryDocumentSnapshot} [cursor=null]
 * Training session document snapshot to be used as query cursor.
 * @returns {Promise}
 * Promise of list of training session document snapshots returned by
 * Firebase's getDocs() method.
 */
export function getTrainingSessions(
    uid,
    queryLimit,
    startDate = null,
    endDate = null,
    cursorAction = null,
    cursor = null
) {
  // Reference to the user's trainingSessions subcollection
  const ref = collection(db, 'users', uid, 'trainingSessions');

  // Query without constraints
  let q = query(ref.withConverter(trainingSessionConverter));

  if (startDate) {
    // If start date filter is set, contrain query to training sessions
    // done at the given start date or after
    q = query(q, where('dateTime', '>=', startDate));
  }

  if (endDate) {
    // If end date filter is set, contrain query to training sessions
    // done at the given end date or before
    q = query(q, where('dateTime', '<=', endDate));
  }

  // Always order training sessions in reverse chronological order
  q = query(q, orderBy('dateTime', 'desc'));

  if (cursorAction === 'next' && cursor) {
    // Get the next page of results, starting after the given cursor document
    q = query(q, startAfter(cursor));
    q = query(q, limit(queryLimit));
  } else if (cursorAction === 'prev' && cursor) {
    // Get the previous page of results, ending before the given cursor document
    q = query(q, endBefore(cursor));
    q = query(q, limitToLast(queryLimit));
  } else {
    // Get the first page of results
    q = query(q, limit(queryLimit));
  }

  // Return training session document snapshots, or error
  return getDocs(q);
}


/**
 * Record a new training session in the user's trainingSessions
 * subcollection, using the data from the given TrainingSession object.
 *
 * @async
 * @param {string} uid - UID of the user creating the training session.
 * @param {TrainingSession} trainingSession - TrainingSession object.
 * @returns {Promise}
 * Promise of new training session document reference, or an error.
 */
export async function createTrainingSession(uid, trainingSession) {
  if (trainingSession instanceof TrainingSession
      || !trainingSession.isValid()) {
    // If the training session is not given or invalid, do not try to
    // record it and return error
    return Promise.reject('invalid-training-session');
  }

  try {
    // Try to create documents for the training session and its
    // exercise items in a single atomic transaction, and return the
    // reference to the newly created training session document if
    // the transaction succeeds
    return await runTransaction(db, async (transaction) => {
      // Try to get user document
      const userDoc = await transaction.get(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        // Throw error if the user document doesn't exist
        throw 'user-doc-does-not-exist';
      }

      // Reference to the user's trainingSessions subcollection
      const trainingSessionsRef = collection(userDoc.ref, 'trainingSessions');

      // Create training session document reference with random ID
      const trainingSessionRef = doc(trainingSessionsRef);

      // Try to set training session document with the TrainingSession's data
      transaction.set(
          trainingSessionRef.withConverter(trainingSessionConverter),
          trainingSession
      );

      // Reference to the user's training session's exercises subcollection
      const exercisesRef = collection(trainingSessionRef, 'exercises');

      // Try to add exercise items documents to the subcollection
      for (let i = 0; i < trainingSession.exerciseItemsCount; i++) {
        // Exercise item document reference with ID set to its ordinal
        // position in the exercises list
        const exerciseItemRef = doc(exercisesRef, String(i));

        // Try to set the exercise item document
        transaction.set(
            exerciseItemRef.withConverter(exerciseItemConverter),
            trainingSession.exercises[i]
        );
      }

      // If transaction succeeds, return training session document reference
      return trainingSessionRef;
    });
  } catch (error) {
    // Return any error caught trying to execute the transaction
    return Promise.reject(error);
  }
}
