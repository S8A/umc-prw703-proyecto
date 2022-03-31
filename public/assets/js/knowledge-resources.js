import * as utils from '/assets/js/utils.js';


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  // If signed-in, set up header
  if (signedInAccount) {
    utils.setUpSignedInHeader(signedInAccount);
  }

  // Add pending status message to page
  utils.addPendingStatusMessage();
});
