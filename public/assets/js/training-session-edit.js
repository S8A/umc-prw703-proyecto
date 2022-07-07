import * as utils from './utils.js';
import * as common from './training-session-form-common.js';
import { auth, getTrainingSession, updateTrainingSession } from './firebase.js';
'use strict';


window.addEventListener('load', function () {
  // Get main title and edit form
  const mainTitle = document.getElementById('main-title');
  const form = document.getElementById('edit-form');

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
        mainTitle.textContent =
            'Modificar sesión de entrenamiento: ' + trainingSession.fullTitle;
        common.constructTrainingSessionForm(trainingSession);

        // Add event listener for form submission
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          event.stopPropagation();

          if (this.checkValidity()) {
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
              } else if (error === 'no-exercise-items') {
                alertText =
                    'La sesión de entrenamiento no tiene ningún '
                    + 'ejercicio registrado.';
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
              scrollToTop();
            });
          } else {
            // If the form is not valid, show error message
            utils.clearAlertMessages();
            utils.addAlertMessage(
                'alert-danger',
                ['Corrija los errores en los datos ingresados.']
            );

            // Scroll to the top of the page
            scrollToTop();
          }

          // Add .was-validated to form if it wasn't already
          this.classList.add('was-validated');
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

        // Scroll to the top of the page
        scrollToTop();

        // Disable form controls
        utils.disableFormControls(form);
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.clearAlertMessages();
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para gestionar sus sesiones de entrenamiento.']
      );

      // Scroll to the top of the page
      scrollToTop();

      // Disable form controls
      utils.disableFormControls(form);
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
