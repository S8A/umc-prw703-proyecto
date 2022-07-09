import * as utils from './utils.js';
import { TrainingSession } from './data-classes.js';
import { auth, deleteTrainingSession, getTrainingSession } from './firebase.js';
'use strict';


/**
 * Construct delete confirmation page with the given training session data.
 *
 * @param {string} uid - UID of the signed-in user.
 * @param {string} id - ID of the training session's document in Firestore.
 * @param {TrainingSession} trainingSession - TrainingSession object.
 */
function constructDeleteConfirmationPage(uid, id, trainingSession) {
  // Main title
  const mainTitle = document.getElementById('main-title');
  const mainTitleText =
      'Eliminar sesión de entrenamiento: ' + trainingSession.fullTitle;
  mainTitle.textContent = mainTitleText;

  // Page title
  document.title = mainTitleText + ' ' + utils.NDASH + ' 8A Training';

  // Enable and add event listener to confirm button
  const confirmButton = document.getElementById('confirm-delete-btn');
  confirmButton.disabled = false;

  confirmButton.addEventListener('click', function () {
    // Try to delete the training session by its ID
    deleteTrainingSession(uid, id, trainingSession.exerciseItemsCount)
    .then(() => {
      // If the training session is successfully deleted, set pending
      // success message and redirect to training log page
      const text = 'Sesión de entrenamiento eliminada exitosamente.';
      utils.setPendingAlertMessage('alert-success', [text]);
      window.location.assign('/historial/');
    })
    .catch((error) => {
      // If deletion was unsuccessful, add error alert message
      const text = 'No se pudo eliminar la sesión de entrenamiento.';
      utils.addAlertMessage('alert-danger', [text]);
      utils.scrollToTop();
    });
  });

  // Enable and add event listener to cancel button
  const cancelButton = document.getElementById('cancel-delete-btn');
  cancelButton.disabled = false;

  cancelButton.addEventListener('click', function () {
    // If the user cancels the deletion, redirect to detail page
    window.location.assign('/historial/detalle.html?id=' + id);
  });
}


window.addEventListener('load', function () {
  // Add pending alert message to page
  utils.addPendingAlertMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Training session ID
  const id = params.id;

  if (!id) {
    // If ID parameter is not set, redirect to training log page
    window.location.assign('/historial/');
    return;
  }

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user);

      // Try to get the user's requested training session
      getTrainingSession(user.uid, id)
      .then((trainingSession) => {
        // Construct the returned training session's delete confirmation page
        constructDeleteConfirmationPage(user.uid, id, trainingSession);
      })
      .catch((error) => {
        // Show appropriate error message
        let alertText = '';

        if (error === 'training-session-not-found') {
          alertText =
              'La sesión de entrenamiento solicitada no fue encontrada en su '
              + 'historial de entrenamiento.';
        } else if (error === 'exercise-items-not-found') {
          alertText =
              'La sesión de entrenamiento solicitada no contiene ejercicios. '
              + 'Intente de nuevo, o elimine la sesión de entrenamiento desde '
              + 'el historial y regístrela de nuevo si el problema persiste.';
        } else if (error === 'exercise-items-count-does-not-match') {
          alertText =
              'Los datos de uno o varios ejercicios de la sesión de '
              + 'entrenamiento no pudieron ser encontrados. Intente de nuevo, '
              + 'o elimine la sesión de entrenamiento desde el historial y '
              + 'regístrela de nuevo si el problema persiste.';
        } else if (error === 'invalid-training-session') {
          alertText = 'La sesión de entrenamiento contiene datos inválidos.';
        } else if (error === 'deadline-exceeded') {
          alertText =
              'El tiempo de respuesta de la solicitud expiró. '
              + 'Intente de nuevo más tarde.';
        } else if (error === 'permission-denied') {
          alertText = 'No tiene permiso de realizar la operación de consulta.';
        } else if (error === 'unavailable') {
          alertText =
              'Servicio temporalmente no disponible. '
              + 'Intente de nuevo más tarde';
        } else {
          alertText = `Error inesperado. Código: ${error}`;
        }

        utils.clearAlertMessages();
        utils.addAlertMessage('alert-danger', [alertText]);
        utils.scrollToTop();
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.clearAlertMessages();
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para gestionar sus sesiones de entrenamiento.']
      );
      utils.scrollToTop();

      // Disable buttons
      const confirmButton = document.getElementById('confirm-delete-btn');
      confirmButton.disabled = true;

      const cancelButton = document.getElementById('cancel-delete-btn');
      cancelButton.disabled = true;
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
