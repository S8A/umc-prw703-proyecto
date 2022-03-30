import * as utils from '/assets/js/utils.js';


export function constructDeleteConfirmationPage(session) {
  /* Construct delete confirmation page with the given training session data. */

  let mainContainer = document.querySelector('main > .container');

  // Main title
  let mainTitle = mainContainer.querySelector('h1#main-title');
  let fullTitle = utils.getTrainingSessionFullTitle(session);
  let mainTitleText = 'Eliminar sesión de entrenamiento: ' + fullTitle;
  mainTitle.textContent = mainTitleText;

  // Page title
  document.title = mainTitleText + ' ' + utils.NDASH + ' 8A Training';

  // Remove #empty-text element
  let emptyText = mainContainer.querySelector('p#empty-text');
  mainContainer.removeChild(emptyText);

  // Question paragraph
  let p = document.createElement('p');
  p.textContent =
      '¿Está seguro de que desea eliminar el registro de esta sesión de '
      + 'entrenamiento? Esta acción es irreversible.';

  // Action buttons
  let actionButtons = document.createElement('div');
  actionButtons.id = 'action-buttons';

  let confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.id = 'confirm-delete-btn';
  confirmButton.textContent = 'Eliminar el registro';

  confirmButton.addEventListener('click', function () {
    // Try to delete the training session by its ID
    let success = utils.deleteTrainingSession(session.id)

    if (success) {
      // If the training session is successfully deleted, set pending
      // success message and redirect to training log page
      let text = 'Sesión de entrenamiento eliminada exitosamente.';
      utils.setPendingStatusMessage('success', [text]);
      window.location.assign('/historial/');
    } else {
      // If deletion was unsuccessful, add error status message
      let text = 'No se pudo eliminar la sesión de entrenamiento.';
      utils.addStatusMessage('error', [text]);
    }
  });

  let cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.id = 'cancel-delete-btn';
  cancelButton.textContent = 'Cancelar';

  cancelButton.addEventListener('click', function () {
    // If the user cancels the deletion, redirect to detail page
    window.location.assign('/historial/detalle.html?id=' + session.id);
  });

  actionButtons.appendChild(confirmButton);
  actionButtons.appendChild(cancelButton);

  // Put everything together
  mainContainer.appendChild(p);
  mainContainer.appendChild(actionButtons);
}


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  if (!signedInAccount) {
    // If not signed-in, set pending info message and redirect to sign-in
    let text = 'Inicie sesión para gestionar sus sesiones de entrenamiento.';
    utils.setPendingStatusMessage('info', [text]);
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
      utils.addStatusMessage('error', [text]);
    } else {
      // If the training session was found, construct delete confirmation
      // page for the training session
      constructDeleteConfirmationPage(session);
    }
  }
});
