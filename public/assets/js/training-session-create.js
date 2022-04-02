import * as common from './training-session-form-common.js';
import * as utils from './utils.js';
import { auth, createTrainingSession } from './firebase.js';


/**
 * Add empty form text to the given container.
 * @param {HTMLElement} container - Container to which the text will be added.
 */
 function addEmptyFormText(container) {
  const emptyText = document.createElement('p');
  emptyText.textContent =
      'No se ha podido cargar el formulario para crear un nuevo registro.';
  container.appendChild(emptyText);
}


window.addEventListener('load', function () {
  // Form container
  const container = document.querySelector('#training-session-form-container');

  // Form parameters
  const mainTitleText = 'Registrar una nueva sesión de entrenamiento';
  const formId = 'create-form';
  const formLabel = 'Registrar datos de la sesión de entrenamiento';
  const submitButtonText = 'Crear registro';

  // Get query params
  const params = utils.getQueryParams();

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user);

      // Construct create form page
      common.constructTrainingSessionForm(
          mainTitleText, formId, formLabel, submitButtonText);

      // Add initial empty exercise item row to table
      common.addExerciseItemRow();

      // Get form element and add event listener for submission
      const form = document.getElementById(formId);

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
          // If form is valid, extract form data and create TrainingSession
          const trainingSession = common.extractTrainingSessionData();

          if (trainingSession.isValid()) {
            // If the training session is valid, try to add it as a document
            // to the user's trainingSessions subcollection
            createTrainingSession(user.uid, trainingSession)
            .then((ref) => {
              // If the training session is created successfully, set
              // pending success message
              utils.setPendingStatusMessage(
                  'success',
                  ['Sesión de entrenamiento registrada exitosamente.']
              );

              // Redirect to detail page of the newly created training session
              window.location.assign('/historial/detalle.html?id=' + ref.id);
            })
            .catch((error) => {
              // If the training session could not be created, show
              // appropriate error message
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(`${errorCode}: ${errorMessage}`);

              let statusText = '';

              if (errorCode === 'deadline-exceeded') {
                statusText =
                    'El tiempo de respuesta de la solicitud expiró. '
                    + 'Intente de nuevo más tarde.';
              } else if (errorCode === 'permission-denied') {
                statusText = 'No tiene permiso de realizar la operación.';
              } else if (errorCode === 'unavailable') {
                statusText =
                    'Servicio temporalmente no disponible. '
                    + 'Intente de nuevo más tarde';
              } else {
                statusText = `Error inesperado. Código: ${errorCode}`;
              }

              utils.clearStatusMessages();
              utils.addStatusMessage('alert-danger', [statusText]);
            });
          } else {
            // If the training session is invalid, then some field must
            // have an invalid value somehow
            utils.clearStatusMessages();
            utils.addStatusMessage(
                'alert-danger',
                ['Uno o varios campos contienen datos inválidos. '
                + 'Verifique e intente de nuevo.']
            );
          }
        } else {
          // If the form is not valid, show error message
          utils.clearStatusMessages();
          utils.addStatusMessage(
              'alert-danger',
              ['Corrija los errores en los datos ingresados.']
          );
        }

        // Add .was-validated to form if it wasn't already
        form.classList.add('was-validated');
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.addStatusMessage(
        'alert-info',
        ['Inicie sesión para registrar una nueva sesión de entrenamiento.']
      );

      // Remove form if present
      const form = document.getElementById(formId);
      if (form) {
        form.remove();
      }

      // Add empty results text if it isn't present
      if (!document.querySelector('p#empty-text')) {
        addEmptyFormText(container);
      }
    }
  });

  // Add pending status message to page
  utils.addPendingStatusMessage();
});
