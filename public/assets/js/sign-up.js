import * as utils from './utils.js';
import { auth, createUser } from './firebase.js';
'use strict';


/**
 * Show feedback if the email field's input is invalid.
 *
 * @param {HTMLInputElement} email - Email input element.
 */
function showEmailError(email) {
  const feedback = utils.getInvalidFeedbackElement(email);

  if (email.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar una dirección de correo electrónico.';
  } else if (email.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + email.maxLength + ').';
  } else if (email.validity.typeMismatch) {
    feedback.textContent =
        'El texto ingresado no es una dirección de correo electrónico válida.';
  }
}


/**
 * Show feedback if the first name field's input is invalid.
 *
 * @param {HTMLInputElement} firstName - First name input element.
 */
function showFirstNameError(firstName) {
  const feedback = utils.getInvalidFeedbackElement(firstName);

  if (firstName.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su nombre.'
  } else if (firstName.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + firstName.maxLength + ').';
  } else if (firstName.validity.patternMismatch) {
    feedback.textContent =
        'Solo se permiten caracteres alfanuméricos y espacios.';
  }
}


/**
 * Show feedback if the last name field's input is invalid.
 *
 * @param {HTMLInputElement} lastName - Last name input element.
 */
function showLastNameError(lastName) {
  const feedback = utils.getInvalidFeedbackElement(lastName);

  if (lastName.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su apellido.'
  } else if (lastName.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + lastName.maxLength + ').';
  } else if (lastName.validity.patternMismatch) {
    feedback.textContent =
        'Solo se permiten caracteres alfanuméricos y espacios.';
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
    feedback.textContent = 'Debe ingresar una contraseña.';
  } else if (password.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + password.maxLength + ').';
  } else if (password.validity.tooShort) {
    feedback.textContent =
        'Insuficientes caracteres (mínimo ' + password.minLength + ').';
  }
}


/**
 * Check that the confirm password field's input matches the password
 * field's input, and update feedback accordingly.
 *
 * @param {HTMLInputElement} password - Password input element.
 * @param {HTMLInputElement} confirm - Confirm password input element.
 */
function checkConfirmPassword(password, confirm) {
  const feedback = utils.getInvalidFeedbackElement(confirm);

  if (password.value !== confirm.value) {
    const text = 'El texto ingresado no coincide con la contraseña.';
    confirm.setCustomValidity(text);
    feedback.textContent = text;
  } else {
    confirm.setCustomValidity('');
    feedback.textContent = '';
  }
}


window.addEventListener( "load", function () {
  // Add pending alert message to page
  utils.addPendingAlertMessage();

  // Get form, fields and submit button
  const form = document.querySelector('form#signup-form');

  const email = form.querySelector('input[type="email"]#email');
  const firstName = form.querySelector('input[type="text"]#first-name');
  const lastName = form.querySelector('input[type="text"]#last-name');
  const password = form.querySelector('input[type="password"]#password');
  const confirm = form.querySelector('input[type="password"]#confirm-password');

  const submit = form.querySelector('button[type="submit"]');

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, disable form fields and submit button
      email.disabled = true;
      firstName.disabled = true;
      lastName.disabled = true;
      password.disabled = true;
      confirm.disabled = true;
      submit.disabled = true;

      // Add alert message indicating that the user is already signed-up
      utils.clearAlertMessages();
      utils.addAlertMessage(
          'alert-info',
          ['Usted ya se encuentra registrado.']
      );

      // Scroll to the top of the page
      window.scrollTo({top: 0, behavior: 'smooth'});

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

  firstName.addEventListener('invalid', function (event) {
    showFirstNameError(firstName);
  });

  firstName.addEventListener('input', function (event) {
    if (firstName.validity.valid) {
      utils.getInvalidFeedbackElement(firstName).textContent = '';
    } else {
      showFirstNameError(firstName);
    }
  });

  lastName.addEventListener('invalid', function (event) {
    showLastNameError(lastName);
  });

  lastName.addEventListener('input', function (event) {
    if (lastName.validity.valid) {
      utils.getInvalidFeedbackElement(lastName).textContent = '';
    } else {
      showLastNameError(lastName);
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

    checkConfirmPassword(password, confirm);
  });

  confirm.addEventListener('input', function (event) {
    checkConfirmPassword(password, confirm);
  });

  // Add event listener for form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (form.checkValidity()) {
      // If form is valid, try to create account with the given data
      createUser(email.value, firstName.value, lastName.value, password.value)
      .then(() => {
        // After the user is successfully created and signed in, and
        // the corresponding user document has been created, set
        // pending success message and redirect to home page
        utils.setPendingAlertMessage(
          'alert-success',
          ['Usuario registrado exitosamente.']
        );
        window.location.assign('/');
      })
      .catch((error) => {
        // If the user could not be created, show appropriate error message
        let alertText = '';

        if (utils.isString(error)) {
          // User created, setDoc failed
          alertText =
              'Error registrando sus datos. Comuníquese con el administrador: '
              + 'samuelochoap@gmail.com';
        } else if (error.code === 'auth/email-already-in-use') {
          alertText =
              'El correo electrónico ingresado ya está asociado a '
              + 'una cuenta.';
        } else if (error.code === 'auth/wrong-password') {
          alertText = 'La contraseña ingresada no es válida.';
        } else {
          console.log(`${error.code}: ${error.message}`);
          alertText = `Error inesperado. Código: ${error.code}`;
        }

        utils.clearAlertMessages();
        utils.addAlertMessage('alert-danger', [alertText]);

        // Scroll to the top of the page
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    } else {
      // If the form is not valid, show error message
      utils.clearAlertMessages();
      utils.addAlertMessage(
          'alert-danger',
          ['Corrija los errores en los datos ingresados.']
      );

      // Scroll to the top of the page
      window.scrollTo({top: 0, behavior: 'smooth'});
    }

    // Add .was-validated to form if it wasn't already
    form.classList.add('was-validated');
  });
});
