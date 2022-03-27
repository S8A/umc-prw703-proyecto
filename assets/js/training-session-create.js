import * as utils from '/assets/js/utils.js';


/* ACTION BUTTON FUNCTIONS */

function addExercise() {
  /* add */

  console.log('TODO: add');
}


function removeExercise() {
  /* remove */

  console.log('TODO: remove');
}


function duplicateExercise() {
  /* duplicate */

  console.log('TODO: duplicate');
}


function moveUpExercise() {
  /* moveUp */

  console.log('TODO: moveUp');
}


function moveDownExercise() {
  /* moveDown */

  console.log('TODO: moveDown');
}


/* FORM FIELD ERRORS */

function showDateError(date, feedback) {
  /* showDateError */

  console.log('TODO: showDateError');
}


function showTimeError(time, feedback) {
  /* showTimeError */

  console.log('TODO: showTimeError');
}


function showShortTitleError(shortTitle, feedback) {
  /* showShortTitleError */

  console.log('TODO: showShortTitleError');
}


function showDurationError(duration, feedback) {
  /* showDurationError */

  console.log('TODO: showDurationError');
}


function showBodyweightError(bodyweight, feedback) {
  /* showBodyweightError */

  console.log('TODO: showBodyweightError');
}


function showGeneralCommentsError(comments, feedback) {
  /* showGeneralCommentsError */

  console.log('TODO: showGeneralCommentsError');
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
    let dateFeedback = date.parentElement.querySelector('.invalid-feedback');

    let time = form.querySelector('input[type="time"]#time');
    let timeFeedback = time.parentElement.querySelector('.invalid-feedback');

    let shortTitle = form.querySelector('input[type="text"]#short-title');
    let shortTitleFeedback =
        shortTitle.parentElement.querySelector('.invalid-feedback');

    let duration = form.querySelector('input[type="number"]#duration');
    let durationFeedback =
        duration.parentElement.querySelector('.invalid-feedback');

    let bodyweight = form.querySelector('input[type="number"]#bodyweight');
    let bodyweightFeedback =
        bodyweight.parentElement.querySelector('.invalid-feedback');

    let comments = form.querySelector('textarea#comments');
    let commentsFeedback =
        comments.parentElement.querySelector('.invalid-feedback');

    // Get action buttons
    let addButton = document.querySelector('button#add-btn');
    let removeButton = document.querySelector('button#remove-btn');
    let duplicateButton = document.querySelector('button#duplicate-btn');
    let moveUpButton = document.querySelector('button#move-up-btn');
    let moveDownButton = document.querySelector('button#move-down-btn');

    // Add event listeners to form fields
    date.addEventListener('invalid', function (event) {
      showDateError(date, dateFeedback);
    });

    date.addEventListener('input', function (event) {
      if (date.validity.valid) {
        dateFeedback.textContent = '';
      } else {
        showDateError(date, dateFeedback);
      }
    });

    time.addEventListener('invalid', function (event) {
      showTimeError(time, timeFeedback);
    });

    time.addEventListener('input', function (event) {
      if (time.validity.valid) {
        timeFeedback.textContent = '';
      } else {
        showTimeError(time, timeFeedback);
      }
    });

    shortTitle.addEventListener('invalid', function (event) {
      showShortTitleError(shortTitle, shortTitleFeedback);
    });

    shortTitle.addEventListener('input', function (event) {
      if (shortTitle.validity.valid) {
        shortTitleFeedback.textContent = '';
      } else {
        showShortTitleError(shortTitle, shortTitleFeedback);
      }
    });

    duration.addEventListener('invalid', function (event) {
      showDurationError(duration, durationFeedback);
    });

    duration.addEventListener('input', function (event) {
      if (duration.validity.valid) {
        durationFeedback.textContent = '';
      } else {
        showDurationError(duration, durationFeedback);
      }
    });

    bodyweight.addEventListener('invalid', function (event) {
      showBodyweightError(bodyweight, bodyweightFeedback);
    });

    bodyweight.addEventListener('input', function (event) {
      if (bodyweight.validity.valid) {
        bodyweightFeedback.textContent = '';
      } else {
        showBodyweightError(bodyweight, bodyweightFeedback);
      }
    });

    comments.addEventListener('invalid', function (event) {
      showGeneralCommentsError(comments, commentsFeedback);
    });

    comments.addEventListener('input', function (event) {
      if (comments.validity.valid) {
        commentsFeedback.textContent = '';
      } else {
        showGeneralCommentsError(comments, commentsFeedback);
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
