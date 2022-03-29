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

  let params = new URLSearchParams(data);
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


/* SIGNED-IN HEADER */

export function setUpSignedInHeader(account) {
  /* Remove sign-in nav link in header, add div with the account's
  name and a sign-out button. */

  let headerNavContainer = document.querySelector('header nav .container');

  let navLinks = headerNavContainer.querySelectorAll('ul > li');
  navLinks[navLinks.length - 1].remove();

  let accountDiv = document.createElement('div');
  accountDiv.classList.add('account');

  let fullName = document.createElement('span');
  fullName.textContent = account.firstName + " " + account.lastName;

  let signOut = document.createElement('button');
  signOut.type = 'button';
  signOut.id = 'sign-out-btn';
  signOut.textContent = 'Salir';

  signOut.addEventListener('click', function (event) {
    sessionStorage.clear();
    window.location.assign('/');
  });

  accountDiv.appendChild(fullName);
  accountDiv.appendChild(signOut);

  headerNavContainer.appendChild(accountDiv);
}


/* STATUS MESSAGES */

export function addStatusMessage(alertType, paragraphs) {
  /* Add status message to the top of the page. */

  let statusMessages = document.getElementById('status-messages');

  let statusMessage = document.createElement('div');
  statusMessage.classList.add('alert', alertType);

  let closeButton = document.createElement('span');
  closeButton.innerHTML = '&#x2715;'
  closeButton.classList.add('close');
  closeButton.setAttribute('aria-label', 'Cerrar esta alerta');

  statusMessage.appendChild(closeButton);

  for (let text of paragraphs) {
    let paragraph = document.createElement('p');
    paragraph.textContent = text;

    statusMessage.appendChild(paragraph);
  }

  statusMessages.prepend(statusMessage);

  closeButton.addEventListener('click', function (event) {
    this.parentElement.remove();
  });
}


export function clearStatusMessages() {
  /* Clear all status messages from the top of the page. */

  let statusMessages = document.getElementById('status-messages');

  while (statusMessages.firstChild) {
    statusMessages.removeChild(statusMessages.firstChild);
  }
}


export function addPendingStatusMessage() {
  /* Add pending status message from sessionStorage then clear it. */

  let statusMessage = JSON.parse(sessionStorage.getItem('pendingStatus'));

  if (statusMessage) {
    if (statusMessage.alertType && statusMessage.paragraphs) {
      addStatusMessage(statusMessage.alertType, statusMessage.paragraphs);
    }
  }

  sessionStorage.removeItem('pendingStatus');
}


export function setPendingStatusMessage(alertType, paragraphs) {
  /* Set pending status message in sessionStorage. */

  if (alertType && paragraphs && paragraphs.length > 0) {
    let status = {
      alertType: alertType,
      paragraphs: paragraphs,
    };

    sessionStorage.setItem('pendingStatus', JSON.stringify(status));
  }
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


export function createTrainingSession(
  date, time, shortTitle, duration, bodyweight, comments, exercises
) {
  /* Create a training session for the current user with the given data
  and return the sanitized session data, or return null if the
  operation failed for any reason. */

  let account = getSignedInAccount();

  if (account) {
    let session = {
      id: null,
      accountEmail: account.email,
      date: date,
      time: time,
      shortTitle: shortTitle ? shortTitle : "",
      duration: null,
      bodyweight: null,
      comments: comments ? comments : "",
      exercises: [],
    };

    if (!Date.parse(date + 'T' + time)) {
      return null;
    }

    if (duration) {
      let durationNumber = Number(duration);

      if (!durationNumber.isNaN()) {
        session.duration = durationNumber;
      }
    }

    if (bodyweight) {
      let bodyweightNumber = Number(bodyweight);

      if (!bodyweightNumber.isNaN()) {
        session.bodyweight = bodyweightNumber;
      }
    }

    for (let itemData of exercises) {
      let item = createTrainingSessionExerciseItem(itemData);
      session.exercises.push(item);
    }

    if (session.exercises.length) {
      let sessions = getAllTrainingSessions();
      session.id = sessions.length + 1;
      sessions.push(session);
      localStorage.setItem('trainingSessions', sessions);
      return session;
    } else {
      return null;
    }
  } else {
    return null;
  }
}


export function createTrainingSessionExerciseItem(data) {
  /* Create a valid training session exercise item from the given data
  and return it, or return null if data is incomplete or invalid. */

  let item = {
    exercise: String(data.exercise),
    setType: data.setType,
    weight: data.weight,
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


export function getTrainingSessionFullTitle(session) {
  /* Get the full title of the given training session by combining its
  date, time, and short title if present. */

  let title = session.date + ' ' + session.time;

  if (session.shortTitle) {
    title += ' ' + NDASH + ' ' + session.shortTitle;
  }

  return title;
}


/* INVALID FEEDBACK ELEMENT */

export function getInvalidFeedbackElement(element) {
  /* Get invalid feedback element corresponding to the given element. */

  return element.parentElement.querySelector('.invalid-feedback');
}


export function createInvalidFeedbackElement() {
  /* Create a generic invalid feedback div. */

  let div = document.createElement('div');
  div.classList.add('invalid-feedback');
  return div;
}
