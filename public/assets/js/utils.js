import { auth, getUserDoc } from './firebase.js';


/* CONSTANTS */

export const TRAINING_LOG_ITEMS_PER_PAGE = 10;
export const NBSP = '\u00a0';
export const NDASH = '\u2013';


/* QUERY PARAMETERS */

export function getQueryParams() {
  /* Get the current page's query parameters. */

  return new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
}


export function setQueryParams(data) {
  /* Set the current page's query parameters. */

  const params = new URLSearchParams(data);
  window.location.search = params.toString();
}


/* ACCOUNTS */

export function getAccounts() {
  /* Get the list of user accounts from localStorage. */

  let accounts = JSON.parse(localStorage.getItem('accounts'));
  return accounts ? accounts : [];
}


export function getAccountByEmail(email) {
  /* Return user account registered with the given email, or return
  undefined if no such account exists. */

  return getAccounts().find(account => account.email === email);
}


export function createAccount(email, firstName, lastName, password) {
  /* Create a new account, if the email is not already associated to
  an existing account. */

  let accounts = getAccounts();
  for (let account of accounts) {
    if (account.email === email) {
      return false;
    }
  }

  let new_account = {
    email: email,
    firstName: firstName,
    lastName: lastName,
    password: password
  };

  accounts.push(new_account);
  localStorage.setItem('accounts', JSON.stringify(accounts));

  return true;
}


export function getSignedInAccount() {
  /* Return the data of the currently signed-in account, or null if the
  user is not signed in. */

  return JSON.parse(sessionStorage.getItem('account'));
}


/* TRAINING SESSIONS */

export async function getTrainingSessionsJSON() {
  /* Request training sessions JSON file and return data object. */

  const requestURL = '/data/training-sessions.json';
  const request = new Request(requestURL);

  const response = await fetch(request);
  const trainingSessions = await response.json();

  return trainingSessions;
}


export function getAllTrainingSessions() {
  /* Get complete training sessions data from localStorage. */

  let sessions = JSON.parse(localStorage.getItem('trainingSessions'));
  return sessions ? sessions : [];
}


export function getTrainingSessions(date = null, sort = true) {
  /* Get training sessions of the currently signed-in account, or null
  if not signed-in.  */

  let account = getSignedInAccount();

  if (account) {
    let sessions = getAllTrainingSessions();

    if (date) {
      sessions = sessions.filter(
          s => s.accountEmail === account.email && s.date === date);
    } else {
      sessions = sessions.filter(s => s.accountEmail === account.email);
    }

    if (sort) {
      sessions.sort((a, b) => {
        let datetime_a = Date.parse(a.date + 'T' + a.time);
        let datetime_b = Date.parse(b.date + 'T' + b.time);
        return datetime_b - datetime_a;
      });
    }

    return sessions;
  } else {
    return null;
  }
}


export function createTrainingSession(data) {
  /* Create a training session for the current user with the given data
  and return the sanitized session data object, or return null if the
  operation failed for any reason. */

  let account = getSignedInAccount();

  if (account) {
    // If signed-in, try to create a valid training session object with
    // the given data
    let session = createTrainingSessionObject(null, account.email, data);

    if (session) {
      // If a valid training session object is successfully created,
      // append it to the list, store it, and return the object
      let sessions = getAllTrainingSessions();

      if (sessions && sessions.length) {
        // If there are training sessions already stored, sort by ID
        // descending, take the first item's ID and increase it by one
        sessions.sort((a, b) => Number(b.id) - Number(a.id));
        session.id = Number(sessions[0].id) + 1;
      } else {
        // If this is the first item, set its ID to 1 directly
        session.id = 1;
      }

      sessions.push(session);

      localStorage.setItem('trainingSessions', JSON.stringify(sessions));

      return session;
    }
  }

  return null;
}


export function updateTrainingSession(id, data) {
  /* Update the training session of the specified ID using the given
  data object, or return null if the session does not exist, does not
  belong to the signed-in account, or if the given data is invalid. */

  let session = getTrainingSession(id);

  if (session) {
    // If the training session exists and belongs to the user, create a
    // new training session object with its ID and the given data
    let newSession =
        createTrainingSessionObject(id, session.accountEmail, data);

    if (newSession) {
      // If a valid training session object is successfully created
      // with the given data, replace the session object in the list
      let sessions = getAllTrainingSessions();
      if (sessions.length) {
        let success = false;

        for (let i in sessions) {
          if (sessions[i].id === id) {
            sessions[i] = newSession;
            success = true;
          }
        }

        if (success) {
          // If the training session object is successfully replaced
          // in the list, store it, and return the object
          localStorage.setItem('trainingSessions', JSON.stringify(sessions));

          return newSession;
        }
      }
    }
  }

  return null;
}


export function createTrainingSessionObject(id, accountEmail, data) {
  /* Create a training session object with the given data, or return
  null if it is incomplete or invalid. */

  // Initial data
  let session = {
    id: id,
    accountEmail: accountEmail,
    date: data.date,
    time: data.time,
    shortTitle: data.shortTitle ? data.shortTitle : '',
    duration: null,
    bodyweight: null,
    comments: data.comments ? data.comments : '',
    exercises: [],
  };

  // Date and time are required and must be valid
  if (!data.date || !data.time || !Date.parse(data.date + 'T' + data.time)) {
    return null;
  }

  // Duration is not required, but if given must be a non-negative integer
  if (data.duration) {
    let durationNumber = Number(data.duration);

    if (Number.isInteger(durationNumber) && durationNumber >= 0) {
      session.duration = durationNumber;
    } else {
      return null;
    }
  }

  // Bodyweight is not required, but if given must be a non-negative integer
  if (data.bodyweight) {
    let bodyweightNumber = Number(data.bodyweight);

    if (Number.isInteger(bodyweightNumber) && bodyweightNumber >= 0) {
      session.bodyweight = bodyweightNumber;
    } else {
      return null;
    }
  }

  // Try to create valid exercise items from the given data and add them
  // to the data object
  if (data.exercises && data.exercises.length) {
    for (let itemData of data.exercises) {
      let item = createTrainingSessionExerciseItem(itemData);

      if (item) {
        session.exercises.push(item);
      }
    }
  }

  let exerciseCount = session.exercises.length;
  if (!exerciseCount || exerciseCount !== data.exercises.length) {
    // If there are no valid exercise items, or if the number of valid
    // exercise items differs from the number of raw exercise items in
    // the data (i.e. some items were invalid), then we must invalidate
    // the entire training session
    return null;
  }

  return session;
}


export function createTrainingSessionExerciseItem(data) {
  /* Create a valid training session exercise item from the given data
  and return it, or return null if data is incomplete or invalid. */

  let item = {
    exercise: String(data.exercise),
    setType: data.setType,
    weight: data.weight ? data.weight : null,
    sets: data.sets ? Number(data.sets) : 0,
    reps: data.reps ? data.reps : [],
    comments: data.comments ? String(data.comments) : '',
  };

  // Exercise field is required and its max length is 50
  if (!item.exercise || item.exercise.length > 50) {
    return null;
  }

  // Set type field is required and its valid values are 'work' and 'warmup'
  if (item.setType !== 'work' && item.setType !== 'warmup') {
    return null;
  }

  // Weight field is not required, but must be a non-negative number if present
  if (item.weight) {
    let weightNumber = Number(item.weight);

    if (!Number.isNaN(weightNumber) && weightNumber >= 0) {
      item.weight = weightNumber;
    } else {
      return null;
    }
  }

  // Sets field is required and must be a non-negative integer
  if (!Number.isInteger(item.sets) || item.sets < 0) {
    return null;
  }

  // Reps field must be a list of integers greater than 0, and the
  // length of the list must match the number of sets
  if (item.sets !== item.reps.length) {
    return null;
  } else if (item.reps.length) {
    let repNumbers = item.reps.map(r => Number(r));

    if (repNumbers.some(r => !Number.isInteger(r) || r <= 0)) {
      return null;
    } else {
      item.reps = repNumbers;
    }
  }

  // Comments field is not required, but its max length is 140 if present
  if (item.comments.length > 140) {
    return null;
  }

  return item;
}


export function getTrainingSession(id) {
  /* Get the training session of the given ID if it exists and belongs
  to the signed-in account, or return null otherwise. */

  let sessions = getTrainingSessions();

  if (sessions) {
    let session = sessions.find(s => s.id === id);

    if (session) {
      return session;
    }
  }

  return null;
}


export function deleteTrainingSession(id) {
  /* Delete the given training session with the given ID if it belongs
  to the signed-in account and return whether the operation succeeded. */

  let sessionToDelete = getTrainingSession(id);

  if (sessionToDelete) {
    // If the training session exists and belongs to the signed-in account,
    // delete it from the list of training sessions
    let sessions = getAllTrainingSessions();
    let newSessions = sessions.filter(s => Number(s.id) !== Number(id));

    if (newSessions.length < sessions.length) {
      // If the training session was deleted from the list successfully,
      // store the new list and return true
      localStorage.setItem('trainingSessions', JSON.stringify(newSessions));
      return true;
    }
  }

  return false;
}


export function getTrainingSessionFullTitle(session) {
  /* Get the full title of the given training session by combining its
  date, time, and short title if present. */

  let title = session.date + NBSP + session.time;

  if (session.shortTitle) {
    title += ' ' + NDASH + ' ' + session.shortTitle;
  }

  return title;
}


/* SIGNED-IN HEADER */

/**
 * Remove sign-up and sign-in links from header nav, and add the
 * signed-in user's first name and a sign-out button.
 *
 * @param {User} signedInUser - Signed-in user.
 */
export function setUpSignedInHeader(user) {
  return getUserDoc(user.uid)
  .then((snapshot, options) => {
    // After getting the user's data document, extract its data
    const data = snapshot.data(options);

    // Collapsible navbar items container
    const navbarCollapse =
        document.querySelector('header nav .navbar-collapse');

    // Remove sign-up and sign-in links
    const signUpLink = navbarCollapse.querySelector('li.nav-item.sign-up');
    signUpLink.remove();

    const signInLink = navbarCollapse.querySelector('li.nav-item.sign-in');
    signInLink.remove();

    // User's full name and sign-out link container
    const accountDiv = document.createElement('div');
    accountDiv.classList.add('d-flex');

    // User's full name
    const fullName = document.createElement('span');
    fullName.classList.add('navbar-text', 'me-2');
    fullName.textContent = data.name.first + ' ' + data.name.last;

    // Sign-out link
    const signOut = document.createElement('button');
    signOut.type = 'button';
    signOut.textContent = 'Salir';
    signOut.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    signOut.addEventListener('click', function (event) {
      // Try to sign-out with Firebase Auth
      auth.signOut()
      .then(() => {
        // If sign-out is successful, redirect to home page
        window.location.assign('/');
      })
      .catch((error) => {
        // If sign-out fails, show error message
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`${errorCode}: ${errorMessage}`);

        const statusText =
            'Error inesperado al tratar de cerrar su sessión. Código: '
            + errorCode

        clearStatusMessages();
        addStatusMessage('alert-danger', [statusText]);
      });
    });

    // Add items to navbar
    accountDiv.appendChild(fullName);
    accountDiv.appendChild(signOut);

    navbarCollapse.appendChild(accountDiv);

    // Return data object
    return data;
  })
  .catch((error) => {
    // If the user's data document couldn't be found, show error message
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`${errorCode}: ${errorMessage}`);

    let statusText = '';

    if (errorCode === 'auth/not-found') {
      statusText =
          'El usuario no tiene datos registrados en el sistema. '
          + 'Comuníquese con el administrador: samuelochoap@gmail.com';
    } else {
      statusText =
          'Error inesperado al tratar de consultar los datos del usuario. '
          + `Código: ${errorCode}`;
    }

    clearStatusMessages();
    addStatusMessage('alert-danger', [statusText]);
  });
}


/* STATUS MESSAGES */

/**
 * Add status message to the top of the page.
 *
 * @param {string} alertType - Bootstrap alert-* class.
 * @param {string[]} text - List of paragraphs of the alert message.
 */
export function addStatusMessage(alertType, text) {
  // Status messages' area
  const statusMessages = document.getElementById('status-messages');

  // Status message alert
  const statusMessage = document.createElement('div');
  statusMessage.classList.add(
      'alert', alertType, 'my-3', 'alert-dismissible', 'fade', 'show');
  statusMessage.setAttribute('role', 'alert');

  // Message paragraphs
  if (!text || !(text instanceof Array) || !text.length) {
    // If status message has no content, don't add anything
    return;
  }

  for (const paragraph of text) {
    const p = document.createElement('p');
    p.textContent = paragraph;

    statusMessage.appendChild(p);
  }

  // Remove bottom margin of last paragraph
  statusMessage.lastChild.classList.add('mb-0');

  // Close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.classList.add('btn-close');
  closeButton.dataset.bsDismiss = 'alert';
  closeButton.ariaLabel = 'Cerrar';

  statusMessage.appendChild(closeButton);

  // Add alert to status area
  statusMessages.prepend(statusMessage);
}


/**
 * Clear all status messages from the top of the page.
 */
export function clearStatusMessages() {
  const statusMessages = document.getElementById('status-messages');
  clearOutChildNodes(statusMessages);
}


/**
 * Set pending status message in sessionStorage.
 *
 * @param {string} alertType - Bootstrap alert-* class.
 * @param {string[]} text - List of paragraphs of the alert message.
 */
export function setPendingStatusMessage(alertType, text) {
  if (alertType && text && text instanceof Array && text.length) {
    const status = {
      alertType: alertType,
      text: text,
    };

    sessionStorage.setItem('pendingStatus', JSON.stringify(status));
  }
}


/**
 * Add pending status message from sessionStorage, then clear it.
 */
export function addPendingStatusMessage() {
  // Pending status messsage data
  const data = JSON.parse(sessionStorage.getItem('pendingStatus'));

  if (data && data.alertType && data.text) {
    // Add status message if the data is complete
    addStatusMessage(data.alertType, data.text);
  }

  sessionStorage.removeItem('pendingStatus');
}


/* INVALID FEEDBACK ELEMENT */

/**
 * Get invalid feedback element adjacent to the given element.
 *
 * @param {HTMLElement} element
 * @returns {HTMLDivElement}
 */
export function getInvalidFeedbackElement(element) {
  return element.parentElement.querySelector('div.invalid-feedback');
}


/**
 * Create a generic invalid feedback container.
 *
 * @returns {HTMLDivElement}
 */
export function createInvalidFeedbackElement() {
  const div = document.createElement('div');
  div.classList.add('invalid-feedback');
  div.ariaLive = 'polite';
  return div;
}


/* DATE OBJECTS */

/**
 * Convert the given Date object into a string in a date-only form of
 * the ISO 8601 format (YYYY-MM-DD).
 *
 * @param {Date} date - Date object to convert.
 * @returns {string}
 * String representation of the Date object's date in YYYY-MM-DD format.
 */
export function toISODateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


/**
 * Convert the given Date object into a string in a time-only form of
 * the ISO 8601 format (HH:mm).
 *
 * @param {Date} date - Date object to convert.
 * @returns {string}
 * String representation of the Date object's time in HH:mm format.
 */
 export function toISOTimeOnly(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}


/* HTML ELEMENTS/NODES */

/**
 * Remove all child nodes from the given HTML element/node.
 *
 * @param {HTMLElement} element - HTML element/node to clear out.
 */
export function clearOutChildNodes(element) {
  while (element.firstChild) {
    element.removeChild(element.lastChild);
  }
}


/* TYPE CHECKING */

/**
 * Checks if the given variable is a string.
 *
 * @param {any} x - Variable to check.
 * @returns
 * True if the variable is a string literal or a String instace,
 * false otherwise.
 */
export function isString(x) {
  return typeof x === 'string' || x instanceof String;
}
