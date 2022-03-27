import * as utils from '/assets/js/utils.js';


function setUpSignedInActionCall(account) {
  /* Replace action call paragraph with customized text for the
  signed-in account. */

  let actionCall = document.querySelector('#action-call');
  actionCall.textContent =
      'Le damos la bienvenida, ' + account.firstName + '. Puede revisar su ';

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
  let signedInAccount = utils.getSignedInAccount();
  if (signedInAccount) {
    utils.setUpSignedInHeader(signedInAccount);
    setUpSignedInActionCall(signedInAccount);
  }
});
