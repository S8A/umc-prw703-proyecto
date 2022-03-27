import * as utils from '/assets/js/utils.js';


function showEmailError(email, feedback) {
  /* Show feedback if the email field's input is invalid. */

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


function showFirstNameError(firstName, feedback) {
  /* Show feedback if the first name field's input is invalid. */

  if (firstName.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su nombre.'
  } else if (firstName.validity.tooLong) {
    feedback.textContent = 'Demasiados caracteres (máximo ' + firstName.maxLength + ').';
  } else if (firstName.validity.typeMismatch) {
    feedback.textContent = 'Solo se permiten caracteres alfanuméricos.';
  }
}


function showLastNameError(lastName, feedback) {
  /* Show feedback if the last name field's input is invalid. */

  if (lastName.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar su apellido.'
  } else if (lastName.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + lastName.maxLength + ').';
  } else if (lastName.validity.typeMismatch) {
    feedback.textContent = 'Solo se permiten caracteres alfanuméricos.';
  }
}


function showPasswordError(password, feedback) {
  /* Show feedback if the password field's input is invalid. */

  if (password.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar una contraseña.';
  } else if (password.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + password.maxLength + ').';
  } else if (password.validity.tooShort) {
    feedback.textContent =
        'Insuficientes caracteres (mínimo ' + password.minLength + ').';
  } else if (password.validity.typeMismatch) {
    feedback.textContent = 'Solo se permiten caracteres alfanuméricos.';
  }
}


function checkConfirmPassword(password, confirm, feedback) {
  if (password.value !== confirm.value) {
    let text = 'El texto ingresado no coincide con la contraseña.';
    confirm.setCustomValidity(text);
    feedback.textContent = text;
  } else {
    confirm.setCustomValidity('');
    feedback.textContent = '';
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

  // Get form, fields and feedback elements
  let form = document.querySelector('form#signup-form');

  let email = form.querySelector('input[type="email"]#email');
  let emailFeedback = email.parentElement.querySelector('.invalid-feedback');

  let firstName = form.querySelector('input[type="text"]#first-name');
  let firstNameFeedback =
      firstName.parentElement.querySelector('.invalid-feedback');

  let lastName = form.querySelector('input[type="text"]#last-name');
  let lastNameFeedback =
      lastName.parentElement.querySelector('.invalid-feedback');

  let password = form.querySelector('input[type="password"]#password');
  let passwordFeedback =
      password.parentElement.querySelector('.invalid-feedback');

  let confirm = form.querySelector('input[type="password"]#confirm-password');
  let confirmFeedback =
      confirm.parentElement.querySelector('.invalid-feedback');

  let submit = form.querySelector('button[type="submit"]');

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

  firstName.addEventListener('invalid', function (event) {
    showFirstNameError(firstName, firstNameFeedback);
  });

  firstName.addEventListener('input', function (event) {
    if (firstName.validity.valid) {
      firstNameFeedback.textContent = '';
    } else {
      showFirstNameError(firstName, firstNameFeedback);
    }
  });

  lastName.addEventListener('invalid', function (event) {
    showLastNameError(lastName, lastNameFeedback);
  });

  lastName.addEventListener('input', function (event) {
    if (lastName.validity.valid) {
      lastNameFeedback.textContent = '';
    } else {
      showLastNameError(lastName, lastNameFeedback);
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

    checkConfirmPassword(password, confirm, confirmFeedback);
  });

  confirm.addEventListener('input', function (event) {
    checkConfirmPassword(password, confirm, confirmFeedback);
  });

  // Add event listener for form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let statusText = '';
    let statusType = 'error'

    if (form.reportValidity()) {
      // If form is valid, try to create account with the given data
      let accountCreated = utils.createAccount(
          email.value, firstName.value, lastName.value, password.value);

      if (accountCreated) {
        // If the account was created, create pending success message
        statusType = 'success';
        statusText = 'Cuenta creada exitosamente.';

        email.disabled = true;
        firstName.disabled = true;
        lastName.disabled = true;
        password.disabled = true;
        confirm.disabled = true;
        submit.disabled = true;
      } else {
        // If the account was not created, then email already belongs
        // to an account
        statusText =
            'El correo electrónico ingresado ya está asociado a una cuenta.';
      }
    } else {
      // If the form is not valid
      checkConfirmPassword(password, confirm, confirmFeedback);
      statusText = 'Corrija los errores en los datos ingresados.';
    }

    // Clear status area and add appropriate error message
    utils.clearStatusMessages();
    utils.addStatusMessage(statusType, [statusText]);
  });
});
