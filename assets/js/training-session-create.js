import * as utils from '/assets/js/utils.js';


/* ACTION BUTTON FUNCTIONS */

function addExercise() {
  /* Add an empty exercise item at the end of the table. */

  console.log('TODO: add');
}


function removeExercise() {
  /* Remove selected exercise item. */

  console.log('TODO: remove');
}


function duplicateExercise() {
  /* Duplicate selected exercise item. */

  console.log('TODO: duplicate');
}


function moveUpExercise() {
  /* Move selected exercise item one position up. */

  console.log('TODO: moveUp');
}


function moveDownExercise() {
  /* Move selected exercise item one position down. */

  console.log('TODO: moveDown');
}


/* FORM FIELD ERRORS */

function showDateError(date) {
  /* showDateError */

  console.log('TODO: showDateError');
}


function showTimeError(time) {
  /* showTimeError */

  console.log('TODO: showTimeError');
}


function showShortTitleError(shortTitle) {
  /* showShortTitleError */

  console.log('TODO: showShortTitleError');
}


function showDurationError(duration) {
  /* showDurationError */

  console.log('TODO: showDurationError');
}


function showBodyweightError(bodyweight) {
  /* showBodyweightError */

  console.log('TODO: showBodyweightError');
}


function showCommentsError(comments) {
  /* showCommentsError */

  console.log('TODO: showCommentsError');
}


/* EXERCISE DATA PROCESSING */

function gatherExerciseData() {
  /* Return a list of training sessions with the form fields' data. */

  let exercise =
      document.querySelectorAll('input[type="text"][id^="exercise-"]');
  let setType = document.querySelectorAll('select[id^="set-type-"]');
  let weight = document.querySelectorAll('input[type="number"][id^="weight-"]');
  let sets = document.querySelectorAll('input[type="number"][id^="sets-"]');
  let reps = document.querySelectorAll('input[type="number"][id^="reps-"]');
  let comments =
      document.querySelectorAll('input[type="number"][id^="comments-"]');

  console.log('TODO: gatherExerciseData');
}


/* ON WINDOW LOAD */

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
      showDateError(date);
    });

    date.addEventListener('input', function (event) {
      if (date.validity.valid) {
        utils.getInvalidFeedbackElement(date).textContent = '';
      } else {
        showDateError(date);
      }
    });

    time.addEventListener('invalid', function (event) {
      showTimeError(time);
    });

    time.addEventListener('input', function (event) {
      if (time.validity.valid) {
        utils.getInvalidFeedbackElement(time).textContent = '';
      } else {
        showTimeError(time);
      }
    });

    shortTitle.addEventListener('invalid', function (event) {
      showShortTitleError(shortTitle);
    });

    shortTitle.addEventListener('input', function (event) {
      if (shortTitle.validity.valid) {
        utils.getInvalidFeedbackElement(shortTitle).textContent = '';
      } else {
        showShortTitleError(shortTitle);
      }
    });

    duration.addEventListener('invalid', function (event) {
      showDurationError(duration);
    });

    duration.addEventListener('input', function (event) {
      if (duration.validity.valid) {
        utils.getInvalidFeedbackElement(duration).textContent = '';
      } else {
        showDurationError(duration);
      }
    });

    bodyweight.addEventListener('invalid', function (event) {
      showBodyweightError(bodyweight);
    });

    bodyweight.addEventListener('input', function (event) {
      if (bodyweight.validity.valid) {
        utils.getInvalidFeedbackElement(bodyweight).textContent = '';
      } else {
        showBodyweightError(bodyweight);
      }
    });

    comments.addEventListener('invalid', function (event) {
      showCommentsError(comments);
    });

    comments.addEventListener('input', function (event) {
      if (comments.validity.valid) {
        utils.getInvalidFeedbackElement(comments).textContent = '';
      } else {
        showCommentsError(comments);
      }
    });


    // Add event listeners to action buttons
    addButton.addEventListener('click', function (event) {
      addExercise();
    });

    removeButton.addEventListener('click', function (event) {
      removeExercise();
    });

    duplicateButton.addEventListener('click', function (event) {
      duplicateExercise();
    });

    moveUpButton.addEventListener('click', function (event) {
      moveUpExercise();
    });

    moveDownButton.addEventListener('click', function (event) {
      moveDownExercise();
    });

    // Add event listener for form submission
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let statusText = '';
      let statusType = 'error';

      if (form.reportValidity()) {
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
