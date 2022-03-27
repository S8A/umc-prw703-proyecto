import * as utils from '/assets/js/utils.js';


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();
  if (signedInAccount) {
    utils.setUpSignedInHeader(signedInAccount);
  } else {
    window.location.assign('/iniciar-sesion.html?next=/historial/crear.html');
  }
});
