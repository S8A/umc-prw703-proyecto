import * as utils from './utils.js';
import { auth } from './firebase.js';
'use strict';


window.addEventListener('load', function () {
  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user);
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
