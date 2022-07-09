import * as utils from './utils.js';
import { auth } from './firebase.js';
'use strict';


/**
 * Customize home page to welcome the signed-in user.
 *
 * @param {string} firstName - First name of the user.
 */
function customizeWelcome(firstName) {
  const mainTitle = document.getElementById('main-title');
  mainTitle.textContent = 'Le damos la bienvenida, ' + firstName;

  const paragraphs = document.querySelectorAll('#landing-text p.lead');

  if (paragraphs.length >= 2) {
    const p2 = paragraphs[1];
    p2.textContent = '';

    const trainingLogBtn = document.createElement('a');
    trainingLogBtn.classList.add('btn', 'btn-outline-primary', 'mb-2', 'me-2');
    trainingLogBtn.href = '/historial/';
    trainingLogBtn.appendChild(utils.createBSIcon('journal'));
    trainingLogBtn.appendChild(
        document.createTextNode(' Historial de entrenamiento'));
    p2.appendChild(trainingLogBtn);
  
    const newTrainingSessionBtn = document.createElement('a');
    newTrainingSessionBtn.classList.add(
      'btn', 'btn-outline-success', 'mb-2', 'me-2');
    newTrainingSessionBtn.href = '/historial/crear.html';
    newTrainingSessionBtn.appendChild(utils.createBSIcon('plus-circle-fill'));
    newTrainingSessionBtn.appendChild(
        document.createTextNode(' Registrar nueva sesión'));
  
    p2.appendChild(newTrainingSessionBtn);
  }
}


window.addEventListener('load', function () {
  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user).then((userData) => {
        // Then give the user a custom welcome
        customizeWelcome(userData.name.first);
      });
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
