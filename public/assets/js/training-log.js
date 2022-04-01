import * as utils from './utils.js';
import { auth, getTrainingSessions } from './firebase.js';
import { TrainingSession, ExerciseItem, SetType } from './data-classes.js';


/**
 * Create training log query parameters object with the given data.
 * @param {?Date} startDate
 * @param {?Date} endDate
 * @returns {Object} Data object with the query parameters specified by the function's parameters.
 */
function createQuery(startDate, endDate) {
  let query = {};

  if (startDate) {
    query.startDate = utils.toISODateOnly(startDate);
  }

  if (endDate) {
    query.endDate = utils.toISODateOnly(endDate);
  }

  return query;
}


/**
 * Construct training log page with the given parameters.
 * @param {HTMLDivElement} container - Container div for the training sessions.
 * @param {string} uid - UID of the signed-in user.
 * @param {?Date} [startDate=null]
 * Start date by which to filter the training sessions, or null.
 * @param {?Date} [endDate=null]
 * End date by which to filter the training sessions, or null.
 */
async function constructTrainingLog(
    container, uid, startDate = null, endDate = null
) {
  try {
    // Get first page of training session objects
    const trainingSessions = await getTrainingSessions(
        uid,
        utils.TRAINING_LOG_ITEMS_PER_PAGE,
        startDate,
        endDate
    );

    // Set page title with date filters, if any
    setPageTitle(startDate, endDate);

    // Add training sessions to page
    addTrainingSessions(container, trainingSessions);

    // Add pagination buttons
    addPagination(trainingSessions, startDate, endDate);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`${errorCode}: ${errorMessage}`);

    let statusText = '';

    if (errorCode === 'deadline-exceeded') {
      statusText = 'El tiempo de consulta expiró. Intente de nuevo más tarde.';
    } else if (errorCode === 'not-found') {
      statusText = 'Sesiones de entrenamiento no encontradas.';
    } else if (errorCode === 'unavailable') {
      statusText =
          'Servicio temporalmente no disponible. Intente de nuevo más tarde';
    } else {
      statusText = `Error inesperado. Código: ${errorCode}`;
    }

    utils.addStatusMessage('alert-danger', [statusText]);
  }
}


/**
 * Add the given training sessions to the container, or add a message
 * indicating that no training sessions were found.
 * @param {HTMLDivElement} container
 * @param {TrainingSession[]} trainingSessions 
 */
function addTrainingSessions(container, trainingSessions) {
  if (trainingSessions && trainingSessions.length) {
    // If there are training sessions to add, clear out container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // For each training session, construct its corresponding container
    // element and append it to the container
    for (let item of trainingSessions) {
      container.append(createTrainingSessionContainer(item));
    }
  } else {
    // If there are no training sessions, add empty results text
    addEmptyResultsText(container);
  }
}


/**
 * Add empty results text to the given container.
 * @param {HTMLDivElement} container
 * Div container to which the text will be added.
 */
function addEmptyResultsText(container) {
  const emptyResults = document.createElement('p');
  emptyResults.textContent = 'No se encontraron sesiones de entrenamiento.';
  container.appendChild(emptyResults);
}


/**
 * Create a div container with representative data of the given
 * training session.
 * @param {TrainingSession} trainingSession
 * The training session to represent.
 * @returns {HTMLDivElement}
 */
function createTrainingSessionContainer(trainingSession) {
  // Training session card
  let container = document.createElement('div');
  container.classList.add(
      'training-session', 'card', 'mb-5', 'shadow');

  // Card body
  let cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  // Card title
  let h2 = document.createElement('h2');
  h2.classList.add('card-title')

  let a = document.createElement('a');
  a.href = '/historial/detalle.html?id=' + trainingSession.id;
  a.textContent = trainingSession.fullTitle;

  h2.appendChild(a);

  // Subtitle
  let p = document.createElement('p');
  p.classList.add('card-subtitle', 'mb-2', 'text-muted');
  p.textContent =
      'Número de ejercicios realizados: ' + trainingSession.exercisesItemCount;


  // Add everything to card
  cardBody.appendChild(h2);
  cardBody.appendChild(p);

  container.appendChild(cardBody);

  return container;
}


/**
 * Adds date filter parameters' information to the title.
 * @param {?Date} [startDate=null]
 * Start date by which the training sessions are filtered.
 * @param {?Date} [endDate=null]
 * End date by which the training sessions are filtered.
 */
function setPageTitle(startDate = null, endDate = null) {
  const title = ['Historial de entrenamiento'];

  if (startDate) {
    title.push(`Desde: ${utils.toISODateOnly(startDate)}`);
  }

  if (endDate) {
    title.push(`Hasta: ${utils.toISODateOnly(endDate)}`);
  }

  title.push('8A Training');

  document.title = title.join(utils.NDASH);
}


window.addEventListener('load', function () {
  // Add pending status message to page
  utils.addPendingStatusMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Get start date filter from query parameter if given, or set to undefined
  let startDate = params.start ? new Date(params.start) : undefined;

  if (startDate.toString() === 'Invalid Date') {
    // If start date is invalid, set to null
    startDate = null;
  } else {
    // Otherwise, set the Date object's time to 00:00:00 so that the
    // Firestore query includes the whole start day
    startDate.setHours(0, 0, 0);
  }

  // Get end date filter from query parameters if given, or set to undefined
  let endDate = params.end ? new Date(params.end) : undefined;

  if (endDate.toString() === 'Invalid Date') {
    // If end date is invalid, set to null
    endDate = null;
  } else {
    // Otherwise, set the Date object's time to 23:59:59 so that the
    // Firestore query includes the whole end day
    endDate.setHours(23, 59, 59);
  }

  if (startDate === null || endDate === null) {
    // If either date filter parameter is null, redirect appropriately
    // and end event handler execution.
    utils.setQueryParams(createQuery(startDate, endDate));
    return;
  }

  // Add pending status message to page
  utils.addPendingStatusMessage();

  // Get fixed page elements
  const createButton = document.querySelector('#create-training-session-btn');

  const dateFilter = document.querySelector('form#date-filter');
  const dateFilterStart =
      dateFilter.querySelector('input[type="date"]#start-date');
  const dateFilterEnd = dateFilter.querySelector('input[type="date"]#end-date');
  const dateFilterButton = dateFilter.querySelector('button[type="submit"]');

  const trainingSessionsContainer = document.querySelector('#training-sessions');

  const paginationNav = document.querySelector('nav#pagination');

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up header
      utils.setUpSignedInHeader(user);

      // Enable create button
      createButton.href = '/historial/crear.html';
      createButton.classList.remove(disabled);
      createButton.ariaDisabled = false;
      
      // Enable date filter fields and submit button
      dateFilterStart.disabled = false;
      dateFilterEnd.disabled = false;
      dateFilterButton.disabled = false;

      // Construct training log page
      constructTrainingLog(
        trainingSessionsContainer,
        user.uid,
        startDate,
        endDate
      );

      // Set date filter inputs' values
      if (startDate) {
        dateFilterStart.value = utils.toISODateOnly(startDate);
      }

      if (endDate) {
        dateFilterStart.value = utils.toISODateOnly(endDate);
      }

      // Add event listener for date filter form submission
      dateFilter.addEventListener('submit', function (event) {
        event.preventDefault();
      
        if (dateFilter.reportValidity()) {
          // If form is valid, filter by the selected dates
          utils.setQueryParams(
              createQuery(dateFilterStart.value, dateFilterEnd.value));
        }
      });
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.addStatusMessage(
          'alert-info',
          ['Inicie sesión para gestionar su historial de entrenamiento.']
      );

      // Disable create button
      createButton.href = '';
      createButton.classList.add(disabled);
      createButton.ariaDisabled = true;

      // Disable date filter fields and submit button
      dateFilterStart.disabled = true;
      dateFilterEnd.disabled = true;
      dateFilterButton.disabled = true;

      // Clear out training sessions
      while (trainingSessionsContainer.firstChild) {
        trainingSessionsContainer.removeChild(
            trainingSessionsContainer.firstChild);
      }

      // Add empty results text
      addEmptyResultsText(trainingSessionsContainer);
    }
  });
});
