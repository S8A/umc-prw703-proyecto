import * as utils from './utils.js';
import { TrainingSession, SetType } from './data-classes.js';
import { auth, getTrainingSession } from './firebase.js';


/**
 * Construct detail page with the given training session's data.
 *
 * @param {string} id - ID of the training session's document in Firestore.
 * @param {TrainingSession} trainingSession - TrainingSession object.
 */
function constructTrainingSessionDetailsPage(id, trainingSession) {
  // Training session details container
  const container = document.querySelector('#training-session-detail');

  // Title
  const mainTitle = container.querySelector('h1#main-title');
  mainTitle.textContent = trainingSession.fullTitle;

  // Page title
  document.title =
    'Sesión de entrenamiento: ' + trainingSession.fullTitle + ' ' + utils.NDASH
    + ' 8A Training';

  // Remove #empty-text element
  const emptyText = container.querySelector('p#empty-text');
  container.removeChild(emptyText);

  // Main buttons
  const mainButtons = document.createElement('div');
  mainButtons.id = 'main-buttons';
  mainButtons.classList.add('py-3', 'text-center');

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
  const basicDataSection = document.createElement('section');
  basicDataSection.id = 'basic-data';

  const basicDataTitle = document.createElement('h2');
  basicDataTitle.textContent = 'Datos generales';

  const basicDataList = createBasicDataList(trainingSession);

  basicDataSection.appendChild(basicDataTitle);
  basicDataSection.appendChild(basicDataList);

  // Exercises
  const exercisesSection = document.createElement('section');
  exercisesSection.id = 'exercises';

  const exercisesTitle = document.createElement('h2');
  exercisesTitle.textContent = 'Ejercicios';

  const exercisesDiv = document.createElement('div');
  exercisesDiv.classList.add('table-responsive');

  const exercisesTable = createExercisesTable(trainingSession);
  exercisesDiv.appendChild(exercisesTable);

  exercisesSection.appendChild(exercisesTitle);
  exercisesSection.appendChild(exercisesDiv);

  // Put everything together
  container.appendChild(mainButtons);
  container.appendChild(basicDataSection);
  container.appendChild(exercisesSection);
}


function createBasicDataList(trainingSession) {
  /* Create basic data list with the given training session data. */

  const basicDataList = document.createElement('ul');
  basicDataList.classList.add('list-group', 'mb-5');

  // Date and time
  const datetimeListItem = document.createElement('li');
  datetimeListItem.classList.add('list-group-item');

  const datetimeLabel = document.createElement('b');
  datetimeLabel.textContent = 'Fecha y hora:';
  datetimeListItem.appendChild(datetimeLabel);

  const datetime = trainingSession.date + ' ' + trainingSession.time;
  datetimeListItem.appendChild(document.createTextNode(' ' + datetime));

  // Short title
  const shortTitleListItem = document.createElement('li');
  shortTitleListItem.classList.add('list-group-item');

  const shortTitleLabel = document.createElement('b');
  shortTitleLabel.textContent = 'Título breve:';
  shortTitleListItem.appendChild(shortTitleLabel);

  let shortTitle = utils.NDASH;
  if (trainingSession.shortTitle) {
    shortTitle = trainingSession.shortTitle;
  }
  shortTitleListItem.appendChild(document.createTextNode(' ' + shortTitle));

  // Duration
  const durationListItem = document.createElement('li');
  durationListItem.classList.add('list-group-item');

  const durationLabel = document.createElement('b');
  durationLabel.textContent = 'Duración de la sesión:';
  durationListItem.appendChild(durationLabel);

  let duration = utils.NDASH;
  if (trainingSession.duration) {
    duration = trainingSession.duration + utils.NBSP + 'min';
  }
  durationListItem.appendChild(document.createTextNode(' ' + duration));

  // Bodyweight
  const bodyweightListItem = document.createElement('li');
  bodyweightListItem.classList.add('list-group-item');

  const bodyweightLabel = document.createElement('b');
  bodyweightLabel.textContent = 'Peso corporal:';
  bodyweightListItem.appendChild(bodyweightLabel);

  let bodyweight = utils.NDASH;
  if (trainingSession.bodyweight) {
    bodyweight = trainingSession.bodyweight + utils.NBSP + 'kg';
  }
  bodyweightListItem.appendChild(document.createTextNode(' ' + bodyweight));

  // Comments
  const commentsListItem = document.createElement('li');
  commentsListItem.classList.add('list-group-item');

  const commentsLabel = document.createElement('b');
  commentsLabel.textContent = 'Comentarios:';
  commentsListItem.appendChild(commentsLabel);

  let comments = utils.NDASH;
  if (trainingSession.comments) {
    comments = trainingSession.comments;
  }
  commentsListItem.appendChild(document.createTextNode(' ' + comments));

  // Add to list
  basicDataList.appendChild(datetimeListItem);
  basicDataList.appendChild(shortTitleListItem);
  basicDataList.appendChild(durationListItem);
  basicDataList.appendChild(bodyweightListItem);
  basicDataList.appendChild(commentsListItem);

  return basicDataList;
}


/**
 * Create table with the given training session's exercise items.
 *
 * @param {TrainingSession} trainingSession
 * TrainingSession from which to extract the ExerciseItem objects to
 * add to the table as rows.
 * @returns {HTMLTableElement} Exercise items table.
 */
function createExercisesTable(trainingSession) {
  // Table
  const table = document.createElement('table');
  table.classList.add('table', 'table-striped', 'table-hover');

  // Table head
  const thead = document.createElement('thead');
  const headers = [
    'Ejercicio',
    'Modalidad',
    'Peso',
    'Series',
    'Repeticiones',
    'Comentarios',
  ];

  for (const header of headers) {
    const th = document.createElement('th');
    th.classList.add('px-2');
    th.textContent = header;
    thead.appendChild(th);
  }

  // Table body
  const tbody = document.createElement('tbody');

  if (trainingSession.exerciseItemsCount) {
    for (const item of trainingSession.exercises) {
      // For each exercise item, create a table row and append it to table body
      const tr = document.createElement('tr');

      const exercise = document.createElement('td');
      exercise.classList.add('px-2');
      exercise.textContent = item.exercise;

      const setType = document.createElement('td');
      setType.classList.add('px-2');
      if (item.setType === SetType.Work) {
        setType.textContent = 'Trabajo';
      } else if (item.setType === SetType.WarmUp) {
        setType.textContent = 'Calentamiento';
      }

      const weight = document.createElement('td');
      weight.classList.add('px-2');
      weight.textContent = utils.NDASH;

      if (item.weight) {
        weight.textContent = item.weight + utils.NBSP + 'kg'
      }

      const sets = document.createElement('td');
      sets.classList.add('px-2');
      sets.textContent = item.sets;

      const reps = document.createElement('td');
      reps.classList.add('px-2');
      reps.textContent = item.reps.join(', ');

      const comments = document.createElement('td');
      comments.classList.add('px-2');
      comments.textContent = utils.NDASH;

      if (item.comments) {
        comments.textContent = item.comments;
      }

      tr.appendChild(exercise);
      tr.appendChild(setType);
      tr.appendChild(weight);
      tr.appendChild(sets);
      tr.appendChild(reps);
      tr.appendChild(comments);

      tbody.appendChild(tr);
    }
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}



/**
 * Add empty page text to the given container.
 * @param {HTMLElement} container - Container to which the text will be added.
 */
 function addEmptyPageText(container) {
  const emptyText = document.createElement('p');
  emptyText.id = 'empty-text';
  emptyText.textContent =
      'No se ha podido cargar la información de la sesión de '
      + 'entrenamiento solicitada.';
  container.appendChild(emptyText);
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
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.addAlertMessage(
        'alert-info',
        ['Inicie sesión para gestionar sus sesiones de entrenamiento.']
      );

      // Scroll to the top of the page
      window.scrollTo({top: 0, behavior: 'smooth'});

      // Remove main buttons and detail page sections
      const container = document.querySelector('#training-session-detail');

      const mainButtons = container.querySelector('#main-buttons');
      mainButtons.remove();

      const sections = container.querySelector('section');
      sections.remove();

      // Reset main title
      const mainTitle = container.querySelector('h1#main-title');
      mainTitle.textContent = 'Sesión de entrenamiento';

      // Reset page title
      document.title = 'Sesión de entrenamiento ' + utils.NBSP + ' 8A Training';

      // Add empty page text if it isn't present
      if (!document.querySelector('p#empty-text')) {
        addEmptyPageText(container);
      }
    }
  });

  // Add pending alert message to page
  utils.addPendingAlertMessage();
});
