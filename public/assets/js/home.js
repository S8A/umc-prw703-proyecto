import * as utils from './utils.js';
import { auth } from './firebase.js';


/**
 * Replace action call paragraph with customized text for the signed-in
 * user.
 *
 * @param {string} firstName - First name of the user.
 */
function setUpSignedInActionCall(firstName) {

  const actionCall = document.querySelector('#action-call');
  actionCall.textContent =
      'Le damos la bienvenida, ' + firstName + '. Puede revisar su ';

  const trainingLogLink = document.createElement('a');
  trainingLogLink.href = '/historial/';
  trainingLogLink.textContent = 'historial de entrenamiento';

  actionCall.appendChild(trainingLogLink);

  actionCall.appendChild(document.createTextNode(' o '));

  const createTrainingSessionLink = document.createElement('a');
  createTrainingSessionLink.href = '/historial/crear.html';
  createTrainingSessionLink.textContent =
      'registrar una nueva sesión de entrenamiento';

  actionCall.appendChild(createTrainingSessionLink);
  actionCall.appendChild(document.createTextNode('.'));
}


window.addEventListener('load', function () {
  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user).then((userData) => {
        // Then set up custom action call text with the user's first name
        setUpSignedInActionCall(userData.name.first);
      });
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
