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


/* SIGNED-IN HEADER */

/**
 * Remove sign-up and sign-in links from header nav, and add the
 * signed-in user's first name and a sign-out button.
 *
 * @async
 * @param {User} signedInUser - Signed-in user.
 * @returns {Promise<Object>}
 * Promise of data object with content extracted from the user's document.
 */
export async function setUpSignedInHeader(user) {
  try {
    // Get snapshot of user's data document
    const snapshot = await getUserDoc(user.uid);

    // After getting the user's data document, extract its data
    const data = snapshot.data();

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

        const alertText =
            'Error inesperado al tratar de cerrar su sessión. Código: '
            + errorCode

        clearAlertMessages();
        addAlertMessage('alert-danger', [alertText]);
      });
    });

    // Add items to navbar
    accountDiv.appendChild(fullName);
    accountDiv.appendChild(signOut);

    navbarCollapse.appendChild(accountDiv);

    // Return data object
    return data;
  } catch (error) {
    // If the user's data document couldn't be found, show error message
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`${errorCode}: ${errorMessage}`);

    let alertText = '';

    if (errorCode === 'auth/not-found') {
      alertText =
          'El usuario no tiene datos registrados en el sistema. '
          + 'Comuníquese con el administrador: samuelochoap@gmail.com';
    } else {
      alertText =
          'Error inesperado al tratar de consultar los datos del usuario. '
          + `Código: ${errorCode}`;
    }

    clearAlertMessages();
    addAlertMessage('alert-danger', [alertText]);
  }
}


/* ALERT MESSAGES */

/**
 * Add alert message to the top of the page.
 *
 * @param {string} alertType - Bootstrap alert-* class.
 * @param {string[]} text - List of paragraphs of the alert message.
 */
export function addAlertMessage(alertType, text) {
  // Alert messages' area
  const alertMessages = document.getElementById('alert-messages');

  // Alert message
  const alertMessage = document.createElement('div');
  alertMessage.classList.add(
      'alert', alertType, 'my-3', 'alert-dismissible', 'fade', 'show');
  alertMessage.setAttribute('role', 'alert');

  // Message paragraphs
  if (!text || !(text instanceof Array) || !text.length) {
    // If alert message has no content, don't add anything
    return;
  }

  for (const paragraph of text) {
    const p = document.createElement('p');
    p.textContent = paragraph;

    alertMessage.appendChild(p);
  }

  // Remove bottom margin of last paragraph
  alertMessage.lastChild.classList.add('mb-0');

  // Close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.classList.add('btn-close');
  closeButton.dataset.bsDismiss = 'alert';
  closeButton.ariaLabel = 'Cerrar';

  alertMessage.appendChild(closeButton);

  // Add alert message
  alertMessages.prepend(alertMessage);
}


/**
 * Clear all alert messages from the top of the page.
 */
export function clearAlertMessages() {
  const alertMessages = document.getElementById('alert-messages');
  clearOutChildNodes(alertMessages);
}


/**
 * Set pending alert message in sessionStorage.
 *
 * @param {string} alertType - Bootstrap alert-* class.
 * @param {string[]} text - List of paragraphs of the alert message.
 */
export function setPendingAlertMessage(alertType, text) {
  if (alertType && text && text instanceof Array && text.length) {
    const data = {
      alertType: alertType,
      text: text,
    };

    sessionStorage.setItem('pendingAlert', JSON.stringify(data));
  }
}


/**
 * Add pending alert message from sessionStorage, then clear it.
 */
export function addPendingAlertMessage() {
  // Pending alert messsage data
  const data = JSON.parse(sessionStorage.getItem('pendingAlert'));

  if (data && data.alertType && data.text) {
    // Add alert message if the data is complete
    addAlertMessage(data.alertType, data.text);
  }

  sessionStorage.removeItem('pendingAlert');
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
