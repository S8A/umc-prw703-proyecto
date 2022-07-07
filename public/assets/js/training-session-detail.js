import * as utils from './utils.js';
import { TrainingSession, SetType, ExerciseItem } from './data-classes.js';
import { auth, getTrainingSession } from './firebase.js';
'use strict';


/**
 * Construct detail page with the given training session's data.
 *
 * @param {string} id - ID of the training session's document in Firestore.
 * @param {TrainingSession} trainingSession - TrainingSession object.
 */
function constructTrainingSessionDetailsPage(id, trainingSession) {
  // Page title
  document.title =
    'Sesión de entrenamiento: ' + trainingSession.fullTitle + ' ' + utils.NDASH
    + ' 8A Training';

  // Title
  const mainTitle = document.getElementById("main-title");
  mainTitle.textContent = trainingSession.fullTitle;

  // Main buttons
  const mainButtons = document.getElementById("main-buttons");

  const editButton = document.createElement('a');
  editButton.classList.add('btn', 'btn-primary', 'mx-2');
  editButton.href = '/historial/modificar.html?id=' + id;
  editButton.textContent = 'Modificar sesión';

  const deleteButton = document.createElement('a');
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.href = '/historial/eliminar.html?id=' + id;
  deleteButton.textContent = 'Eliminar sesión';

  mainButtons.appendChild(editButton);
  mainButtons.appendChild(deleteButton);

  // Basic data
  const datetime = trainingSession.date + ' ' + trainingSession.time;
  const datetimeText = document.getElementById("datetime-text");
  datetimeText.textContent = datetime;

  if (trainingSession.shortTitle) {
    const shortTitleText = document.getElementById("short-title-text");
    shortTitleText.textContent = trainingSession.shortTitle;
  }

  if (trainingSession.duration) {
    const durationText = document.getElementById("duration-text");
    durationText.textContent = trainingSession.duration + utils.NBSP + 'min';
  }

  if (trainingSession.bodyweight) {
    const bodyweightText = document.getElementById("bodyweight-text");
    bodyweightText.textContent = trainingSession.bodyweight + utils.NBSP + 'kg';
  }

  if (trainingSession.comments) {
    const commentsText = document.getElementById("comments-text");
    commentsText.textContent = trainingSession.comments;
  }

  // Exercises
  if (trainingSession.exerciseItemsCount) {
    const exercisesContainer = document.getElementById("exercises-container");
    utils.clearOutChildNodes(exercisesContainer);

    for (const exerciseItem of trainingSession.exercises) {
      const card = createExerciseItemCard(exerciseItem);
      exercisesContainer.appendChild(card);
    }
  }
}


/**
 * Create a card with the given exercise item's data.
 *
 * @param {ExerciseItem} item - List of exercise items to construct.
 * @returns {HTMLElement} Exercise item card.
 */
function createExerciseItemCard(item) {
  const card = document.createElement('section');
  card.classList.add('exercise-item', 'card', 'mb-2');

  const container = document.createElement('div');
  container.classList.add('container-fluid', 'g-2');

  // Row 1: Exercise, set type
  const row1 = document.createElement('div');
  row1.classList.add('row', 'g-2', 'mb-2');

  const exercise = document.createElement('div');
  exercise.classList.add('col-sm-8', 'col-lg-9');

  const exerciseHeading = document.createElement('h3');
  exerciseHeading.classList.add('fs-6', 'fw-bold', 'mb-0', 'lh-base');
  exerciseHeading.textContent = item.exercise;
  exercise.appendChild(exerciseHeading);

  row1.appendChild(exercise);

  const setType = document.createElement('div');
  setType.classList.add('col-sm-4', 'col-lg-3', 'text-sm-end');

  const setTypeBadge = document.createElement('span');

  const setTypeHiddenLabel = document.createElement('span');
  setTypeHiddenLabel.classList.add('visually-hidden');
  setTypeHiddenLabel.textContent = 'Modalidad: ';

  setTypeBadge.appendChild(setTypeHiddenLabel);

  if (item.setType === SetType.Work) {
    setTypeBadge.classList.add('badge', 'bg-primary');
    setTypeBadge.appendChild(document.createTextNode('Trabajo'));
  } else if (item.setType === SetType.WarmUp) {
    setTypeBadge.classList.add('badge', 'bg-secondary');
    setTypeBadge.appendChild(document.createTextNode('Calentamiento'));
  }

  setType.appendChild(setTypeBadge);

  row1.appendChild(setType);

  container.appendChild(row1);

  // Row 2: Weight, sets, reps
  const row2 = document.createElement('div');
  row2.classList.add('row', 'g-2', 'mb-2');

  const weight = document.createElement('div');
  weight.classList.add('col-sm-3', 'small');

  const weightLabel = document.createElement('b');
  weightLabel.textContent = 'Peso:';
  weight.appendChild(weightLabel);

  if (item.weight) {
    weight.appendChild(
        document.createTextNode(' ' + item.weight + utils.NBSP + 'kg'));
  } else {
    weight.appendChild(document.createTextNode(' ' + utils.NDASH));
  }

  row2.appendChild(weight);

  const sets = document.createElement('div');
  sets.classList.add('col-sm-3', 'small');

  const setsLabel = document.createElement('b');
  setsLabel.textContent = 'Series:';
  sets.appendChild(setsLabel);

  sets.appendChild(document.createTextNode(' ' + item.sets));

  row2.appendChild(sets);

  if (item.sets) {
    const reps = document.createElement('div');
    reps.classList.add('col-sm-6', 'small');

    const repsLabel = document.createElement('b');
    repsLabel.textContent = 'Repeticiones:';
    reps.appendChild(repsLabel);

    reps.appendChild(document.createTextNode(' ' + item.reps.join(', ')));

    row2.appendChild(reps);
  }

  container.appendChild(row2);

  // Reps 3: Comments
  if (item.comments) {
    const row3 = document.createElement('div');
    row3.classList.add('row', 'g-2', 'mb-2');

    const comments = document.createElement('div');
    comments.classList.add('col-sm-12', 'small');

    const commentsLabel = document.createElement('b');
    commentsLabel.textContent = 'Comentarios: ';
    comments.appendChild(commentsLabel);

    comments.appendChild(document.createTextNode(' ' + item.comments));

    row3.appendChild(comments);

    container.appendChild(row3);
  }

  card.appendChild(container);

  return card;
}


window.addEventListener('load', function () {
  // Add pending alert message to page
  utils.addPendingAlertMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Training session ID
  const id = params.id;

  if (!id) {
    // If ID parameter is not set, redirect to training log page
    window.location.assign('/historial/');
    return;
  }

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up signed-in header
      utils.setUpSignedInHeader(user);

      // Try to get the user's requested training session
      getTrainingSession(user.uid, id)
      .then((trainingSession) => {
        // Construct the returned training session's detail page
        constructTrainingSessionDetailsPage(id, trainingSession);
      })
      .catch((error) => {
        // Show appropriate error message
        let alertText = '';

        if (error === 'training-session-not-found') {
          alertText =
              'La sesión de entrenamiento solicitada no fue encontrada en su '
              + 'historial de entrenamiento.';
        } else if (error === 'exercise-items-not-found') {
          alertText =
              'La sesión de entrenamiento solicitada no contiene ejercicios. '
              + 'Intente de nuevo, o elimine la sesión de entrenamiento desde '
              + 'el historial y regístrela de nuevo si el problema persiste.';
        } else if (error === 'exercise-items-count-does-not-match') {
          alertText =
              'Los datos de uno o varios ejercicios de la sesión de '
              + 'entrenamiento no pudieron ser encontrados. Intente de nuevo, '
              + 'o elimine la sesión de entrenamiento desde el historial y '
              + 'regístrela de nuevo si el problema persiste.';
        } else if (error === 'invalid-training-session') {
          alertText = 'La sesión de entrenamiento contiene datos inválidos.';
        } else if (error === 'deadline-exceeded') {
          alertText =
              'El tiempo de respuesta de la solicitud expiró. '
              + 'Intente de nuevo más tarde.';
        } else if (error === 'permission-denied') {
          alertText = 'No tiene permiso de realizar la operación de consulta.';
        } else if (error === 'unavailable') {
          alertText =
              'Servicio temporalmente no disponible. '
              + 'Intente de nuevo más tarde';
        } else {
          alertText = `Error inesperado. Código: ${error}`;
        }

        utils.clearAlertMessages();
        utils.addAlertMessage('alert-danger', [alertText]);

        // Scroll to the top of the page
        scrollToTop();
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.clearAlertMessages();
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para gestionar sus sesiones de entrenamiento.']
      );

      // Scroll to the top of the page
      scrollToTop();

      // Remove main buttons and training session data
      const mainButtons = document.getElementById('main-buttons');
      utils.clearOutChildNodes(mainButtons);

      const datetimeText = document.getElementById('datetime-text');
      datetimeText.textContent = utils.NDASH;

      const shortTitleText = document.getElementById('short-title-text');
      shortTitleText.textContent = utils.NDASH;

      const durationText = document.getElementById('duration-text');
      durationText.textContent = utils.NDASH;

      const bodyweightText = document.getElementById('bodyweight-text');
      bodyweightText.textContent = utils.NDASH;

      const commentsText = document.getElementById('comments-text');
      commentsText.textContent = utils.NDASH;

      const exercisesContainer = document.getElementById('exercises-container');
      utils.clearOutChildNodes(exercisesContainer);

      const emptyText = document.createElement('p');
      emptyText.textContent = 'No hay ejercicios registrados.';
      exercisesContainer.appendChild(emptyText);

      // Reset main title
      const mainTitle = document.getElementById('main-title');
      mainTitle.textContent = 'Sesión de entrenamiento';

      // Reset page title
      document.title = 'Sesión de entrenamiento ' + utils.NBSP + ' 8A Training';
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
