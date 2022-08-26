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
  endAt,
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
  writeBatch,
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
export const auth = getAuth(app);

// Connect Firebase Authentication with local emulator
// export const auth = getAuth();
// connectAuthEmulator(auth, "http://localhost:9099");


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect Firestore with local emulator
// export const db = getFirestore();
// connectFirestoreEmulator(db, 'localhost', 8080);


/* USER ACCOUNTS */

/**
 * Create a new user with the given email and password.
 *
 * @async
 * @param {string} email - Email of the new user.
 * @param {string} firstName - First name of the new user.
 * @param {string} lastName - Last name of the new user.
 * @param {string} password - Password of the new user.
 * @returns {Promise<void>}
 * Promise of void return value from Firestore's setDoc() method.
 */
export async function createUser(email, firstName, lastName, password) {
  try {
    // Create user and get credential
    const userCredential = await createUserWithEmailAndPassword(
        auth, email, password);

    // Create user document to save the user's first and last name,
    // as well as the creation timestamp
    return await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: {first: firstName, last: lastName},
      created: serverTimestamp(),
    });
  } catch (error) {
    return Promise.reject(error);
  }
}


/**
 * Sign in with the given user email and password.
 *
 * @param {string} email - Email of the user.
 * @param {string} password - Password of the user.
 * @returns {Promise<UserCredential>}
 * Promise of UserCredential returned by Firebase's
 * signInWithEmailAndPassword() method.
 */
export function signInUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}


/**
 * Gets the given user's data from their corresponding document in the
 * users collection.
 *
 * @param {string} uid - UID of the user whose data will be looked up.
 * @returns {Promise<DocumentSnapshot>}
 * Promise of user document snapshot returned by Firestore's getDoc() method.
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
      data.sets,
      data.reps,
      data.weight,
      data.comments
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
 * the previous page (end before cursor), 'last' to get the last page;
 * otherwise, get the first page.
 * @param {?QueryDocumentSnapshot} [cursor=null]
 * Training session document snapshot to be used as query cursor.
 * @returns {Promise<QuerySnapshot>}
 * Promise of query results snapshot returned by Firebase's getDocs() method.
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
    q = query(q, endAt(cursor));
    q = query(q, limitToLast(queryLimit));
  } else if (cursorAction === 'last') {
    // Get the last page of results
    q = query(q, limitToLast(queryLimit));
  } else {
    // Get the first page of results
    q = query(q, limit(queryLimit));
  }

  // Return training session document snapshots, or error
  return getDocs(q);
}


/**
 * Get the training session of the given ID from the user's
 * trainingSessions subcollection.
 *
 * @param {string} uid - UID of the user who is requesting the training session.
 * @param {string} id - ID of the training session document in Firestore.
 * @returns {Promise<TrainingSession>}
 * Promise of TrainingSession constructed from Firestore's data.
 */
export async function getTrainingSession(uid, id) {
  // Try to get the requested training session's document snapshot
  // from the user's trainingSessions subcollection
  const trainingSessionRef = doc(db, 'users', uid, 'trainingSessions', id);
  const trainingSessionDocSnapshot = await getDoc(
      trainingSessionRef.withConverter(trainingSessionConverter));

  if (!trainingSessionDocSnapshot.exists()) {
    // If the document doesn't exist, throw error
    throw 'training-session-not-found';
  }

  // Reference to the training session document's exercises subcollection
  const exercisesRef = collection(trainingSessionRef, 'exercises');

  // Create a query to get all the exercise items of the training session,
  // ordered by ID ascending
  const q = query(exercisesRef.withConverter(exerciseItemConverter));

  // Get the training session's exercise items' query results snapshot
  const exerciseItemsQuerySnapshot = await getDocs(q);

  if (exerciseItemsQuerySnapshot.empty) {
    // If no exercise items were found, throw error
    throw 'exercise-items-not-found';
  }

  // Construct TrainingSession object with the document snapshot's data
  const trainingSession = trainingSessionDocSnapshot.data();

  const exerciseItemsCount = exerciseItemsQuerySnapshot.docs.length;
  if (exerciseItemsCount !== trainingSession.exerciseItemsCount) {
    // If the number of exercise items in the query snapshot somehow
    // doesn't match the number indicated in the training session's
    // document, throw error
    throw 'exercise-items-count-does-not-match';
  }

  // Replace null exercise items of the TrainingSession object with
  // the ExerciseItem objects from the query snapshot
  trainingSession.exercises = [];
  exerciseItemsQuerySnapshot.forEach((snapshot) => {
    const exerciseItem = snapshot.data();
    trainingSession.exercises.push(exerciseItem);
  });

  if (trainingSession.isValid()) {
    // If valid, return Training session object
    return trainingSession;
  } else {
    // Otherwise, throw error
    throw 'invalid-training-session';
  }
}


/**
 * Record a new training session in the user's trainingSessions
 * subcollection, using the data from the given TrainingSession object.
 *
 * @async
 * @param {string} uid - UID of the user creating the training session.
 * @param {TrainingSession} trainingSession - TrainingSession object.
 * @returns {Promise<DocumentReference>}
 * Promise of the new training session's document reference.
 */
export async function createTrainingSession(uid, trainingSession) {
  if (!(trainingSession instanceof TrainingSession)
      || !trainingSession.isValid()) {
    // If the training session is not given or invalid, do not try to
    // record it and throw error
    if (trainingSession.exerciseItemsCount) {
      throw 'invalid-training-session';
    } else {
      throw 'no-exercise-items';
    }
  }

  // Try to create documents for the training session and its exercise
  // items in a single atomic transaction, and return the reference to
  // the newly created training session document if the transaction
  // succeeds
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
      // position in the exercises list, padded by zero if needed to
      // reach two digits
      const paddedOrdinalPosition = String(i).padStart(2, "0");
      const exerciseItemRef = doc(exercisesRef, paddedOrdinalPosition);

      // Try to set the exercise item document
      transaction.set(
          exerciseItemRef.withConverter(exerciseItemConverter),
          trainingSession.exercises[i]
      );
    }

    // If transaction succeeds, return training session document reference
    return trainingSessionRef;
  });
}


/**
 * Update the specified training session in the user's
 * trainingSessions, if it exists, using the data from the given
 * TrainingSession object.
 *
 * @async
 * @param {string} uid - UID of the user updating the training session.
 * @param {string} id - ID of the training session's document.
 * @param {TrainingSession} trainingSession - TrainingSession object.
 * @returns {Promise<void>} Promise of void return value if successful.
 */
 export async function updateTrainingSession(uid, id, trainingSession) {
  if (!(trainingSession instanceof TrainingSession)
      || !trainingSession.isValid()) {
    // If the training session is not given or invalid, do not try to
    // update it and throw error
    if (trainingSession.exerciseItemsCount) {
      throw 'invalid-training-session';
    } else {
      throw 'no-exercise-items';
    }
  }

  // Try to update documents for the training session and its
  // exercise items in a single atomic transaction
  return await runTransaction(db, async (transaction) => {
    // Try to get user document
    const userDoc = await transaction.get(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      // Throw error if the user document doesn't exist
      throw 'user-doc-does-not-exist';
    }

    // Reference to the training session in the user's
    // trainingSessions subcollection
    const trainingSessionRef = doc(userDoc.ref, 'trainingSessions', id);

    // Get training session document snapshot before update
    const trainingSessionDoc = await transaction.get(
        trainingSessionRef.withConverter(trainingSessionConverter));

    if (!trainingSessionDoc.exists()) {
      // Throw error if the training session document doesn't exist
      throw 'training-session-not-found';
    }

    // Get number of exercise items before update
    const oldExerciseCount = trainingSessionDoc.data().exerciseItemsCount;

    // Try to update training session document with the TrainingSession's data
    transaction.set(
        trainingSessionRef.withConverter(trainingSessionConverter),
        trainingSession
    );

    // Reference to the training session's exercises subcollection
    const exercisesRef = collection(trainingSessionRef, 'exercises');

    // Try to update exercise items documents of the subcollection,
    // adding more if necessary
    const newExerciseCount = trainingSession.exerciseItemsCount;
    for (let i = 0; i < newExerciseCount; i++) {
      // Exercise item document reference with ID set to its ordinal
      // position in the exercises list, padded by zero if needed to
      // reach two digits
      const paddedOrdinalPosition = String(i).padStart(2, "0");
      const exerciseItemRef = doc(exercisesRef, paddedOrdinalPosition);

      // Try to set the exercise item document
      transaction.set(
          exerciseItemRef.withConverter(exerciseItemConverter),
          trainingSession.exercises[i]
      );
    }

    if (newExerciseCount < oldExerciseCount) {
      // If the number of exercise items of the given TrainingSession
      // is lower than the number in the document before the update,
      // remove excess documents
      for (let i = newExerciseCount; i < oldExerciseCount; i++) {
        const exerciseItemRef = doc(exercisesRef, String(i));
        transaction.delete(exerciseItemRef);
      }
    }
  });
}


/**
 * Delete the specified training session in the user's
 * trainingSessions, if it exists, as well as the documents of its
 * exercise items.
 *
 * @async
 * @param {string} uid - UID of the user deleting the training session.
 * @param {string} id - ID of the training session's document.
 * @param {number} exerciseItemsCount
 * Number of exercise items in the training session's exercises subcollection.
 * @returns {Promise<void>} Promise of void return value if successful.
 */
 export async function deleteTrainingSession(uid, id, exerciseItemsCount) {
  // Get a new write batch
  const batch = writeBatch(db);

  // Reference to the training session in the user's trainingSessions
  // subcollection
  const trainingSessionRef = doc(db, 'users', uid, 'trainingSessions', id);

  // Reference to the training session's exercises subcollection
  const exercisesRef = collection(trainingSessionRef, 'exercises');

  // Delete all exercise items belonging to the training session
  for (let i = 0; i < exerciseItemsCount; i++) {
    // Exercise item document reference with ID set to its ordinal
    // position in the exercises list, padded by zero if needed to
    // reach two digits
    const paddedOrdinalPosition = String(i).padStart(2, "0");
    const exerciseItemRef = doc(exercisesRef, paddedOrdinalPosition);

    batch.delete(exerciseItemRef);
  }

  // Delete the training session document
  batch.delete(trainingSessionRef);

  // Commit the batch
  return await batch.commit();
}


/**
 * Load the example training sessions from the JSON file in the data folder.
 *
 * @param {string} uid - UID of the user loading the example training sessions.
 * @returns {number}
 * Number of training sessions loaded to Firestore successfully.
 */
export async function loadExampleTrainingSessionsJSON(uid) {
  // JSON file URL and request object
  const requestURL = '/data/training-sessions.json';
  const request = new Request(requestURL);

  // Fetch file and awit response
  const response = await fetch(request);

  if (response.ok) {
    // If request is successful, get data as JSON
    const data = await response.json();

    // List of TrainingSession objects constructed from the data
    const trainingSessions = [];

    if (data instanceof Array && data.length) {
      // If the data object is a non-empty array, go through each item
      for (const item of data) {
        const exerciseItems = [];

        if (item.exercises instanceof Array && item.exercises.length) {
          // If the item's exercises property is a non-empty array,
          // go through each exerciseItem
          for (const exerciseItem of item.exercises) {
            // Create a new ExerciseItem object from the exercise item's data
            // and push it to the exerciseItems list
            exerciseItems.push(new ExerciseItem(
              exerciseItem.exercise,
              SetType.enumValueOf(exerciseItem.setType),
              exerciseItem.sets,
              exerciseItem.reps,
              exerciseItem.weight,
              exerciseItem.comments
            ));
          }

          // Create a new TrainingSession object from the item's data
          // and push it to the trainingSessions list
          trainingSessions.push(new TrainingSession(
            item.date,
            item.time,
            exerciseItems,
            item.shortTitle,
            item.duration,
            item.bodyweight,
            item.comments
          ))
        }
      }
    }

    // Filter out invalid training sessions
    const validItems = trainingSessions.filter(item => item.isValid());

    let createdCount = 0;

    if (validItems.length) {
      // If there are valid TrainingSession objects, go through each
      // one and create them as documents in the user's
      // trainingSessions collection
      for (const i in validItems) {
        try {
          // Try to create training session document and increment counter
          await createTrainingSession(uid, validItems[i]);
          createdCount++;
        } catch (error) {
          console.log(
              `Error creating training session at index ${i}:\t${error}`);
        }
      }
    }

    // Return count of created training session documents
    return createdCount;
  }

  return 0;
}
