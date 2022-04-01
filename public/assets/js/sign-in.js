import * as utils from './utils.js';
import { auth, signInUser } from './firebase.js';


/**
 * Show feedback if the email field's input is invalid.
 * @param {HTMLInputElement} email - input element.
 */
function showEmailError(email) {

  let feedback = utils.getInvalidFeedbackElement(email);

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
 * @param {HTMLInputElement} password - input element.
 */
function showPasswordError(password) {

  let feedback = utils.getInvalidFeedbackElement(password);

  if (password.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su contraseña.';
  } else if (password.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + password.maxLength + ').';
  } else if (password.validity.tooShort) {
    feedback.textContent =
        'Insuficientes caracteres (mínimo ' + password.minLength + ').';
  } else if (password.validity.patternMismatch) {
    feedback.textContent = 'Solo se permiten caracteres alfanuméricos.';
  }
}


window.addEventListener( "load", function () {
  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, redirect to home page
      window.location.assign('/');
    }
  });

  // Add pending status message to page
  utils.addPendingStatusMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Get form and fields
  let form = document.querySelector('form#signin-form');

  let email = form.querySelector('input[type="email"]#email');
  let password = form.querySelector('input[type="password"]#password');

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
      .then((userCredential) => {
        // If the user is successfully signed in, set pending success
        // message and redirect to the destination set in the next
        // query parameter, or to the home page if next is unset or
        // not a valid destination
        utils.setPendingStatusMessage(
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

        let statusText = '';

        if (errorCode === 'auth/user-not-found') {
          statusText =
              'No existe ningún usuario registrado con el correo electrónico '
              + 'ingresado.';
        } else if (errorCode === 'auth/wrong-password') {
          statusText = 'Contraseña incorrecta.'
        } else {
          statusText = `Error inesperado. Código: ${errorCode}`
        }

        utils.clearStatusMessages();
        utils.addStatusMessage('alert-danger', [statusText]);
      });
    } else {
      // If the form is not valid, show error message
      utils.clearStatusMessages();
      utils.addStatusMessage(
          'alert-danger',
          ['Corrija los errores en los datos ingresados.']
      );
    }

    // Add .was-validated to form if it wasn't already
    form.classList.add('was-validated');
  });
});
