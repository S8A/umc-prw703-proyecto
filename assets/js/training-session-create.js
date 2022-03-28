import * as utils from '/assets/js/utils.js';
import * as common from '/assets/js/training-session-form-common.js';


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  if (!signedInAccount) {
    // If not signed-in, set pending info message and redirect to sign-in
    let text = 'Inicie sesión para registrar una sesión de entrenamiento.';
    utils.setPendingStatusMessage('info', [text]);
    window.location.assign('/iniciar-sesion.html?next=/historial/crear.html');
    return;
  } else {
    // If signed-in, set up signed-in header
    utils.setUpSignedInHeader(signedInAccount);

    // Get query params
    const params = utils.getQueryParams();

    // Get form, basic data fields and feedback elements
    let form = document.querySelector('form#create-form');

    let date = form.querySelector('input[type="date"]#date');
    let time = form.querySelector('input[type="time"]#time');
    let shortTitle = form.querySelector('input[type="text"]#short-title');
    let duration = form.querySelector('input[type="number"]#duration');
    let bodyweight = form.querySelector('input[type="number"]#bodyweight');
    let comments = form.querySelector('textarea#comments');

    // Get action buttons
    let addButton = document.querySelector('button#add-btn');
    let removeButton = document.querySelector('button#remove-btn');
    let duplicateButton = document.querySelector('button#duplicate-btn');
    let moveUpButton = document.querySelector('button#move-up-btn');
    let moveDownButton = document.querySelector('button#move-down-btn');

    // Add event listeners to form fields
    date.addEventListener('invalid', function (event) {
      common.showDateError(date);
    });

    date.addEventListener('input', function (event) {
      if (date.validity.valid) {
        utils.getInvalidFeedbackElement(date).textContent = '';
      } else {
        common.showDateError(date);
      }
    });

    time.addEventListener('invalid', function (event) {
      common.showTimeError(time);
    });

    time.addEventListener('input', function (event) {
      if (time.validity.valid) {
        utils.getInvalidFeedbackElement(time).textContent = '';
      } else {
        common.showTimeError(time);
      }
    });

    shortTitle.addEventListener('invalid', function (event) {
      common.showShortTitleError(shortTitle);
    });

    shortTitle.addEventListener('input', function (event) {
      if (shortTitle.validity.valid) {
        utils.getInvalidFeedbackElement(shortTitle).textContent = '';
      } else {
        common.showShortTitleError(shortTitle);
      }
    });

    duration.addEventListener('invalid', function (event) {
      common.showDurationError(duration);
    });

    duration.addEventListener('input', function (event) {
      if (duration.validity.valid) {
        utils.getInvalidFeedbackElement(duration).textContent = '';
      } else {
        common.showDurationError(duration);
      }
    });

    bodyweight.addEventListener('invalid', function (event) {
      common.showBodyweightError(bodyweight);
    });

    bodyweight.addEventListener('input', function (event) {
      if (bodyweight.validity.valid) {
        utils.getInvalidFeedbackElement(bodyweight).textContent = '';
      } else {
        common.showBodyweightError(bodyweight);
      }
    });

    comments.addEventListener('invalid', function (event) {
      common.showCommentsError(comments);
    });

    comments.addEventListener('input', function (event) {
      if (comments.validity.valid) {
        utils.getInvalidFeedbackElement(comments).textContent = '';
      } else {
        common.showCommentsError(comments);
      }
    });


    // Add event listeners to action buttons
    addButton.addEventListener('click', function (event) {
      common.addExercise();
    });

    removeButton.addEventListener('click', function (event) {
      common.removeExercise();
    });

    duplicateButton.addEventListener('click', function (event) {
      common.duplicateExercise();
    });

    moveUpButton.addEventListener('click', function (event) {
      common.moveUpExercise();
    });

    moveDownButton.addEventListener('click', function (event) {
      common.moveDownExercise();
    });

    // Add initial empty exercise item to table
    common.addExercise();

    // Add event listener for form submission
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let statusText = '';
      let statusType = 'error';

      if (form.checkValidity()) {
        // If form is valid, try to create training session with the given data
        let exercises = gatherExerciseData();

        let session = utils.createTrainingSession(
          date.value,
          time.value,
          shortTitle.value,
          duration.value,
          bodyweight.value,
          comments.value,
          exercises
        );

        if (session) {
          // If the training session was created, set pending success message
          statusType = 'success';
          statusText = 'Sesión de entrenamiento registrada exitosamente.'
          utils.setPendingStatusMessage(statusType, [statusText]);

          // Redirect to detail page of the newly created training session
          // and end event handler execution
          window.location.assign('/historial/detalle.html?id=' + session.id);
          return;
        } else {
          // If the training session was not created, something went wrong
          statusText = 'Error inesperado al tratar de registrar los datos.'
        }
      } else {
        // If the form is not valid
        statusText = 'Corrija los errores en los datos ingresados.';
      }

      // Clear status area and add appropriate error message
      utils.clearStatusMessages();
      utils.addStatusMessage(statusType, [statusText]);
    });
  }
});
