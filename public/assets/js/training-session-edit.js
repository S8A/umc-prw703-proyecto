import * as common from './training-session-form-common.js';
import * as utils from './utils.js';
import { auth, getTrainingSession, updateTrainingSession } from './firebase.js';


/**
 * Add empty form text to the given container.
 * @param {HTMLElement} container - Container to which the text will be added.
 */
 function addEmptyFormText(container) {
  const emptyText = document.createElement('p');
  emptyText.textContent =
      'No se ha podido cargar el formulario para modificar la sesión de'
      + 'entrenamiento solicitada.';
  container.appendChild(emptyText);
}


window.addEventListener('load', function () {
  // Form container
  const container = document.querySelector('#training-session-form-container');

  // Form parameters
  let mainTitleText = 'Modificar sesión de entrenamiento: ';
  const formId = 'edit-form';
  const formLabel = 'Modificar datos de la sesión de entrenamiento';
  const submitButtonText = 'Guardar cambios';

  // Get query params
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
        // Construct edit form page
        mainTitleText += trainingSession.fullTitle;
        common.constructTrainingSessionForm(
            mainTitleText,
            formId,
            formLabel,
            submitButtonText,
            trainingSession
        );

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
            updateTrainingSession(user.uid, id, trainingSession)
            .then(() => {
              // If the training session is created successfully, set
              // pending success message
              utils.setPendingAlertMessage(
                  'alert-success',
                  ['Sesión de entrenamiento modificada exitosamente.']
              );

              // Redirect to detail page of the training session
              window.location.assign('/historial/detalle.html?id=' + id);
            })
            .catch((error) => {
              // If the training session could not be updated, show
              // appropriate error message
              console.log(error);

              let alertText = '';

              if (error === 'user-doc-does-not-exist') {
                alertText =
                    'El usuario no tiene datos registrados en la base de datos.'
                    + 'Comuníquese con el administrador: '
                    + 'samuelochoap@gmail.com';
              } else if (error === 'invalid-training-session') {
                alertText =
                    'La sesión de entrenamiento contiene datos inválidos. '
                    + 'Verifique los datos ingresados.';
              } else if (error === 'training-session-not-found') {
                alertText =
                    'La sesión de entrenamiento fue eliminada antes de '
                    + 'completar la modificación de los datos. '
                    + 'Regrese al historial de entrenamiento.';
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
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para gestionar sus sesiones de entrenamiento.']
      );

      // Remove form if present
      const form = document.getElementById(formId);
      if (form) {
        form.remove();
      }
      
      // Reset main title
      const mainTitle = document.querySelector('h1#main-title');
      mainTitle.textContent = 'Modificar sesión de entrenamiento';

      // Reset page title
      document.title = 'Modificar sesión de entrenamiento ' + utils.NBSP
          + ' 8A Training';

      // Add empty results text if it isn't present
      if (!document.querySelector('p#empty-text')) {
        addEmptyFormText(container);
      }
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
