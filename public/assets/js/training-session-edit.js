import * as utils from '/assets/js/utils.js';
import * as common from '/assets/js/training-session-form-common.js';


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  if (!signedInAccount) {
    // If not signed-in, set pending info message and redirect to sign-in
    let text = 'Inicie sesión para gestionar sus sesiones de entrenamiento.';
    utils.setPendingStatusMessage('alert-info', [text]);
    window.location.assign('/iniciar-sesion.html?next=/historial/');
    return;
  } else {
    // If signed-in, set up signed-in header
    utils.setUpSignedInHeader(signedInAccount);

    // Get query params
    const params = utils.getQueryParams();

    // Training session ID
    const id = Number(params.id);

    // If no valid ID parameter set, redirect to training log page
    if (!Number.isInteger(id) || id <= 0) {
      window.location.assign('/historial/');
      return;
    }

    // Try to get training session with the given ID
    let session = utils.getTrainingSession(id);

    if (!session) {
      // If the training session was not found, add error status message
      let text = 'La sesión de entrenamiento solicitada no existe o '
      + 'no pertenece a su cuenta.';
      utils.clearStatusMessages();
      utils.addStatusMessage('alert-danger', [text]);
    } else {
      // If the training session was found, construct edit form page with
      // the training session's data
      let fullTitle = utils.getTrainingSessionFullTitle(session);
      let mainTitleText = 'Modificar sesión de entrenamiento: ' + fullTitle;
      let formId = 'edit-form';
      let formLabel = 'Modificar datos de la sesión de entrenamiento';
      let submitButtonText = 'Guardar cambios';

      common.constructTrainingSessionForm(
          mainTitleText, formId, formLabel, submitButtonText, session);

      // Set page title
      document.title = mainTitleText + ' ' + utils.NDASH + ' 8A Training';

      // Get form element and add event listener for submission
      const form = document.getElementById(formId);

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        let statusText = '';
        let statusType = 'alert-danger';

        if (form.checkValidity()) {
          // If form is valid, extract data from form fields and try to
          // update training session
          let data = common.extractFormData(form);
          let session = utils.updateTrainingSession(id, data);

          if (session) {
            // If the training session was updated, set pending success message
            statusType = 'alert-success';
            statusText = 'Sesión de entrenamiento modificada exitosamente.'
            utils.setPendingStatusMessage(statusType, [statusText]);

            // Redirect to detail page of the training session
            // and end event handler execution
            window.location.assign('/historial/detalle.html?id=' + session.id);
            return;
          } else {
            // If the training session was not updated, something went wrong
            statusText = 'Error inesperado al tratar de modificar los datos.'
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

    // Add pending status message to page
    utils.addPendingStatusMessage();
  }
});
