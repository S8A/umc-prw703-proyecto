import * as utils from './utils.js';
import * as common from './training-session-form-common.js';
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

          // Try to add the training session as a document to the
          // user's trainingSessions subcollection
          createTrainingSession(user.uid, trainingSession)
          .then((ref) => {
            // If the training session is created successfully, set
            // pending success message
            utils.setPendingAlertMessage(
                'alert-success',
                ['Sesión de entrenamiento registrada exitosamente.']
            );

            // Redirect to detail page of the newly created training session
            window.location.assign('/historial/detalle.html?id=' + ref.id);
          })
          .catch((error) => {
            // If the training session could not be created, show
            // appropriate error message
            console.log(error);

            let alertText = '';

            if (error === 'user-doc-does-not-exist') {
              alertText =
                  'El usuario no tiene datos registrados en la base de datos.'
                  + 'Comuníquese con el administrador: samuelochoap@gmail.com';
            } else if (error === 'invalid-training-session') {
              alertText =
                  'La sesión de entrenamiento contiene datos inválidos. '
                  + 'Verifique los datos ingresados.';
            } else if (error === 'deadline-exceeded') {
              alertText =
                  'El tiempo de respuesta de la solicitud expiró. '
                  + 'Intente de nuevo más tarde.';
            } else if (error === 'permission-denied') {
              alertText = 'No tiene permiso de realizar la operación.';
            } else if (error === 'unavailable') {
              alertText =
                  'Servicio temporalmente no disponible. '
                  + 'Intente de nuevo más tarde';
            } else {
              alertText = `Error inesperado. Código: ${error}`;
            }

            utils.clearAlertMessages();
            utils.addAlertMessage('alert-danger', [alertText]);

            // Scroll to the top of the page
            window.scrollTo({top: 0, behavior: 'smooth'});
          });
        } else {
          // If the form is not valid, show error message
          utils.clearAlertMessages();
          utils.addAlertMessage(
              'alert-danger',
              ['Corrija los errores en los datos ingresados.']
          );

          // Scroll to the top of the page
          window.scrollTo({top: 0, behavior: 'smooth'});
        }

        // Add .was-validated to form if it wasn't already
        form.classList.add('was-validated');
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para registrar una nueva sesión de entrenamiento.']
      );

      // Scroll to the top of the page
      window.scrollTo({top: 0, behavior: 'smooth'});

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

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
