import * as utils from '/assets/js/utils.js';
import * as common from '/assets/js/training-session-form-common.js';


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  if (!signedInAccount) {
    // If not signed-in, set pending info message and redirect to sign-in
    let text = 'Inicie sesión para registrar una sesión de entrenamiento.';
    utils.setPendingStatusMessage('alert-info', [text]);
    window.location.assign('/iniciar-sesion.html?next=/historial/crear.html');
    return;
  } else {
    // If signed-in, set up signed-in header
    utils.setUpSignedInHeader(signedInAccount);

    // Get query params
    const params = utils.getQueryParams();

    // Construct create form page
    let mainTitleText = 'Registrar una nueva sesión de entrenamiento';
    let formId = 'create-form';
    let formLabel = 'Registrar datos de la sesión de entrenamiento';
    let submitButtonText = 'Crear registro';

    common.constructTrainingSessionForm(
        mainTitleText, formId, formLabel, submitButtonText);

    // Add initial empty exercise item to table
    common.addExercise();

    // Get form element and add event listener for submission
    let form = document.getElementById(formId);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      let statusText = '';
      let statusType = 'alert-danger';

      if (form.checkValidity()) {
        // If form is valid, extract data from form fields and try to
        // create training session
        let data = common.extractFormData(form);
        let session = utils.createTrainingSession(data);

        if (session) {
          // If the training session was created, set pending success message
          statusType = 'alert-success';
          statusText = 'Sesión de entrenamiento registrada exitosamente.'
          utils.setPendingStatusMessage(statusType, [statusText]);

          // Redirect to detail page of the newly created training session
          // and end event handler execution
          window.location.assign('/historial/detalle.html?id=' + session.id);
          return;
        } else {
          // If the number of valid exercises differs from the number
          // of row items (logically by being lower), show error message
          statusText =
              'Uno o varios ítems de ejercicio contienen datos inválidos. '
              + 'Verifique todos los campos.';
        }
      } else {
        // If the form is not valid
        statusText = 'Corrija los errores en los datos ingresados.';
      }

      // Add .was-validated to form if it wasn't already
      form.classList.add('was-validated');

      // Clear status area and add appropriate error message
      utils.clearStatusMessages();
      utils.addStatusMessage(statusType, [statusText]);
    });
  }
});
