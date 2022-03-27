import * as utils from '/assets/js/utils.js';


function showEmailError(email, feedback) {
  /* Show feedback if the email field's input is invalid. */

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


function showPasswordError(password, feedback) {
  /* Show feedback if the password field's input is invalid. */

  if (password.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su contraseña.';
  } else if (password.validity.tooLong) {
    feedback.textContent = 'Demasiados caracteres (máximo ' + password.maxLength + ').';
  } else if (password.validity.tooShort) {
    feedback.textContent = 'Insuficientes caracteres (mínimo ' + password.minLength + ').';
  } else if (password.validity.typeMismatch) {
    feedback.textContent = 'Solo se permiten caracteres alfanuméricos.';
  }
}


window.addEventListener( "load", function () {
  let signedInAccount = utils.getSignedInAccount();

  // If signed-in, redirect to home page and end event handler execution
  if (signedInAccount) {
    window.location.assign('/');
    return;
  }

  // Add pending status message to page
  utils.addPendingStatusMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Get form, fields and feedback elements
  let form = document.querySelector('form#signin-form');

  let email = form.querySelector('input[type="email"]#email');
  let emailFeedback = email.parentElement.querySelector('.invalid-feedback');

  let password = form.querySelector('input[type="password"]#password');
  let passwordFeedback = password.parentElement.querySelector('.invalid-feedback');

  // Add event listeners to form fields
  email.addEventListener('invalid', function (event) {
    showEmailError(email, emailFeedback);
  });

  email.addEventListener('input', function (event) {
    if (email.validity.valid) {
      emailFeedback.textContent = '';
    } else {
      showEmailError(email, emailFeedback);
    }
  });

  password.addEventListener('invalid', function (event) {
    showPasswordError(password, passwordFeedback);
  });

  password.addEventListener('input', function (event) {
    if (password.validity.valid) {
      passwordFeedback.textContent = '';
    } else {
      showPasswordError(password, passwordFeedback);
    }
  });

  // Add event listener for form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let statusText = '';

    if (form.reportValidity()) {
      // If form is valid, try to find account linked to email
      let account = utils.getAccountByEmail(email.value);

      if (account) {
        if (account.password === password.value) {
          // If the account exists and password matches, save it for
          // the current session
          delete account.password;
          sessionStorage.setItem('account', JSON.stringify(account));

          // List of valid redirect destinations
          const validRedirects = [
            '/',
            '/historial/',
            '/historial/crear.html'
          ];

          // If the next query parameter is set to a valid destination,
          // redirect to it. Otherwise redirect to home page.
          if (validRedirects.includes(params.next)) {
            window.location.assign(params.next);
          } else {
            window.location.assign('/');
          }

          // End event handler execution
          return;
        } else {
          // If the account exists but the password does not match
          statusText = 'Contraseña incorrecta.';
        }
      } else {
        // If the account does not exist
        statusText = 'No existe ninguna cuenta con ese correo electrónico.';
      }
    } else {
      // If the form is not valid
      statusText = 'Corrija los errores en los datos ingresados.';
    }

    // Clear status area and add appropriate error message
    utils.clearStatusMessages();
    utils.addStatusMessage('error', [statusText]);
  });
});
