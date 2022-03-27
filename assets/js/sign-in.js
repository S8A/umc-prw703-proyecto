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
  if (signedInAccount) {
    window.location.assign('/');
  }

  const params = utils.getQueryParams();

  let form = document.querySelector('form#signin-form');

  let email = form.querySelector('input[type="email"]#email');
  let emailFeedback = email.parentElement.querySelector('.invalid-feedback');

  let password = form.querySelector('input[type="password"]#password');
  let passwordFeedback = password.parentElement.querySelector('.invalid-feedback');

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

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    let statusText = '';

    if (form.reportValidity()) {
      let account = utils.getAccountByEmail(email.value);

      if (account) {
        if (account.password === password.value) {
          delete account.password;
          sessionStorage.setItem('account', JSON.stringify(account));

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
        } else {
          statusText = 'Contraseña incorrecta.';
        }
      } else {
        statusText = 'No existe ninguna cuenta con ese correo electrónico.';
      }
    } else {
      statusText = 'Corrija los errores en los datos ingresados.';
    }

    utils.clearStatusMessages();
    utils.addStatusMessage('error', [statusText]);
  });
});
