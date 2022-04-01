import * as utils from './utils.js';
import { auth, getUserDoc } from './firebase.js';



/**
 * Replace action call paragraph with customized text for the signed-in
 * user.
 * @param {string} firstName - First name of the user.
 */
function setUpSignedInActionCall(firstName) {

  let actionCall = document.querySelector('#action-call');
  actionCall.textContent =
      'Le damos la bienvenida, ' + firstName + '. Puede revisar su ';

  let trainingLogLink = document.createElement('a');
  trainingLogLink.href = '/historial/';
  trainingLogLink.textContent = 'historial de entrenamiento';

  actionCall.appendChild(trainingLogLink);

  actionCall.appendChild(document.createTextNode(' o '));

  let createTrainingSessionLink = document.createElement('a');
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
      // If user is signed in, get user data document
      getUserDoc(user)
      .then((snapshot, options) => {
        // After getting the user's data document, set up header and
        // customized action call
        const data = snapshot.data(options);
        utils.setUpSignedInHeader(data.name.first, data.name.last);
        setUpSignedInActionCall(data.name.first);
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

        utils.clearStatusMessages();
        utils.addStatusMessage('alert-danger', [statusText]);
      });
    }
  });

  // Add pending status message to page
  utils.addPendingStatusMessage();
});
