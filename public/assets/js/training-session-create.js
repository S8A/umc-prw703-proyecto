import * as utils from './utils.js';
import * as common from './training-session-form-common.js';
import { auth, createTrainingSession } from './firebase.js';
'use strict';


window.addEventListener('load', function () {
  // Get create form
  const form = document.getElementById('create-form');

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user);

      // Construct create form page
      common.constructTrainingSessionForm();

      // Add initial empty exercise item
      common.addExerciseItem();

      // Add event listener for form submission
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.checkValidity()) {
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
            } else if (error === 'no-exercise-items') {
              alertText =
                  'La sesión de entrenamiento no tiene ningún '
                  + 'ejercicio registrado.';
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
        this.classList.add('was-validated');
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.clearAlertMessages();
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para registrar una nueva sesión de entrenamiento.']
      );

      // Scroll to the top of the page
      window.scrollTo({top: 0, behavior: 'smooth'});

      // Disable all form controls
      const formControls = form.querySelectorAll('input, button');
      if (formControls.length) {
        for (const element of formControls) {
          element.disabled = true;
        }
      }
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
