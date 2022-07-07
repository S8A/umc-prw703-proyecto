import * as utils from './utils.js';
import { auth, signInUser } from './firebase.js';
'use strict';


/**
 * Show feedback if the email field's input is invalid.
 *
 * @param {HTMLInputElement} email - Email input element.
 */
function showEmailError(email) {
  const feedback = utils.getInvalidFeedbackElement(email);

  if (email.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su dirección de correo electrónico.';
  } else if (email.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + email.maxLength + ').';
  } else if (email.validity.typeMismatch) {
    feedback.textContent =
        'El texto ingresado no es una dirección de correo electrónico válida.';
  }
}


/**
 * Show feedback if the password field's input is invalid.
 *
 * @param {HTMLInputElement} password - Password input element.
 */
function showPasswordError(password) {
  const feedback = utils.getInvalidFeedbackElement(password);

  if (password.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su contraseña.';
  } else if (password.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + password.maxLength + ').';
  } else if (password.validity.tooShort) {
    feedback.textContent =
        'Insuficientes caracteres (mínimo ' + password.minLength + ').';
  }
}


window.addEventListener( "load", function () {
  // Add pending alert message to page
  utils.addPendingAlertMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Get form, fields and submit button
  const form = document.querySelector('form#signin-form');

  const email = form.querySelector('input[type="email"]#email');
  const password = form.querySelector('input[type="password"]#password');

  const submit = form.querySelector('button[type="submit"]');

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, disable form fields and submit button
      email.disabled = true;
      password.disabled = true;
      submit.disabled = true;

      // Add alert message indicating that the user is already signed-in
      utils.clearAlertMessages();
      utils.addAlertMessage(
          'alert-info',
          ['Usted ya tiene su sesión iniciada.']
      );

      // Scroll to the top of the page
      scrollToTop();

      // Set up header
      utils.setUpSignedInHeader(user);
    }
  });

  // Add event listeners to form fields
  email.addEventListener('invalid', function (event) {
    showEmailError(email);
  });

  email.addEventListener('input', function (event) {
    if (email.validity.valid) {
      utils.getInvalidFeedbackElement(email).textContent = '';
    } else {
      showEmailError(email);
    }
  });

  password.addEventListener('invalid', function (event) {
    showPasswordError(password);
  });

  password.addEventListener('input', function (event) {
    if (password.validity.valid) {
      utils.getInvalidFeedbackElement(password).textContent = '';
    } else {
      showPasswordError(password);
    }
  });

  // Add event listener for form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      // If form is valid, try to sign in account with the given data
      signInUser(email.value, password.value)
      .then(() => {
        // If the user is successfully signed in, set pending success
        // message and redirect to the destination set in the next
        // query parameter, or to the home page if next is unset or
        // not a valid destination
        utils.setPendingAlertMessage(
            'alert-success',
            ['Sesión iniciada exitosamente.']
        );

        const validRedirects = [
          '/',
          '/historial/',
          '/historial/crear.html'
        ];

        if (validRedirects.find(dest => dest === params.next)) {
          window.location.assign(params.next);
        } else {
          window.location.assign('/');
        }
      })
      .catch((error) => {
        // If the sign-in failed, show the appropriate error message
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`${errorCode}: ${errorMessage}`);

        let alertText = '';

        if (errorCode === 'auth/user-not-found') {
          alertText =
              'No existe ningún usuario registrado con el correo electrónico '
              + 'ingresado.';
        } else if (errorCode === 'auth/wrong-password') {
          alertText = 'Contraseña incorrecta.';
        } else {
          alertText = `Error inesperado. Código: ${errorCode}`;
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
    form.classList.add('was-validated');
  });
});
