import * as utils from '/assets/js/utils.js';


function showEmailError(email) {
  /* Show feedback if the email field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(email);

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


function showFirstNameError(firstName) {
  /* Show feedback if the first name field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(firstName);

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


function showLastNameError(lastName) {
  /* Show feedback if the last name field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(lastName);

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


function showPasswordError(password) {
  /* Show feedback if the password field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(password);

  if (password.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar una contraseña.';
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


function checkConfirmPassword(password, confirm) {
  /* Check that the confirm password field's input matches the
  password field's input, and updates feedback accordingly. */

  let feedback = utils.getInvalidFeedbackElement(confirm);

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

  // Get form and fields
  let form = document.querySelector('form#signup-form');

  let email = form.querySelector('input[type="email"]#email');
  let firstName = form.querySelector('input[type="text"]#first-name');
  let lastName = form.querySelector('input[type="text"]#last-name');
  let password = form.querySelector('input[type="password"]#password');
  let confirm = form.querySelector('input[type="password"]#confirm-password');

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

    let statusText = '';
    let statusType = 'alert-danger'

    if (form.checkValidity()) {
      // If form is valid, try to create account with the given data
      let accountCreated = utils.createAccount(
          email.value, firstName.value, lastName.value, password.value);

      if (accountCreated) {
        // If the account was created, create pending success message
        statusType = 'alert-success';
        statusText = 'Cuenta creada exitosamente. Puede iniciar sesión.';
        utils.setPendingStatusMessage(statusType, [statusText]);

        // Redirect to sign-in page and end event handler execution
        window.location.assign('/iniciar-sesion.html');
        return;
      } else {
        // If the account was not created, then email already belongs
        // to an account
        statusText =
            'El correo electrónico ingresado ya está asociado a una cuenta.';
      }
    } else {
      // If the form is not valid
      statusText = 'Corrija los errores en los datos ingresados.';
    }

    // Add .was-validated to form if it wasn't already
    form.classList.add('was-validated');

    // Clear status area and add appropriate error message
    utils.clearStatusMessages();
    utils.addStatusMessage(statusType, [statusText]);
  });
});