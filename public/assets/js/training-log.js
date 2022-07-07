import * as utils from './utils.js';
import { TrainingSession } from './data-classes.js';
import {
  auth,
  getTrainingSessions,
  loadExampleTrainingSessionsJSON,
} from './firebase.js';
'use strict';


/**
 * Create training log query parameters object with the given data.
 * @param {?Date} startDate
 * Start date by which to filter the training sessions, or null.
 * @param {?Date} endDate
 * End date by which to filter the training sessions, or null.
 * @returns {Object} Data object with the requested query parameters' values.
 */
function createQuery(startDate, endDate) {
  const query = {};

  if (startDate) {
    query.start = utils.toISODateOnly(startDate);
  }

  if (endDate) {
    query.end = utils.toISODateOnly(endDate);
  }

  return query;
}


/**
 * Construct training log with the given parameters.
 *
 * @param {string} uid - UID of the signed-in user.
 * @param {number} queryLimit - Number of training sessions to retrieve.
 * @param {?Date} [startDate=null]
 * Start date by which to filter the training sessions, or null.
 * @param {?Date} [endDate=null]
 * End date by which to filter the training sessions, or null.
 * @param {?string} [cursorAction=null]
 * 'next' to get the next page (start after the cursor), 'prev' to get
 * the previous page (end before cursor), 'last' to get the last page;
 * otherwise, get the first page.
 * @param {?QueryDocumentSnapshot} [cursor=null]
 * Training session document snapshot to be used as query cursor.
 * @param {number} [page=1] - Current page number.
 */
function constructTrainingLog(
    uid,
    queryLimit,
    startDate = null,
    endDate = null,
    cursorAction = null,
    cursor = null,
    page = 1
) {
  // Get training sessions from Firestore
  getTrainingSessions(
      uid, queryLimit, startDate, endDate, cursorAction, cursor)
  .then((querySnapshot) => {
    // If the query is successful, use the results' snapshot to add
    // training session cards to the container
    addTrainingSessionCards(querySnapshot);

    // Add pagination buttons
    addPagination(uid, querySnapshot, queryLimit, startDate, endDate, page);
  })
  .catch((error) => {
    console.log(error);

    let alertText = '';

    if (error === 'deadline-exceeded') {
      alertText = 'El tiempo de consulta expiró. Intente de nuevo más tarde.';
    } else if (error === 'not-found') {
      alertText = 'Sesiones de entrenamiento no encontradas.';
    } else if (error === 'unavailable') {
      alertText =
          'Servicio temporalmente no disponible. Intente de nuevo más tarde';
    } else {
      alertText = `Error inesperado. Código: ${error}`;
    }

    utils.addAlertMessage('alert-danger', [alertText]);

    // Scroll to the top of the page
    utils.scrollToTop();
  });
}


/**
 * Create training session cards from the data in the given query
 * snapshot and add them to the container, or add empty results text
 * if no training sessions were found.
 *
 * @param {QuerySnapshot} querySnapshot
 * Query snapshot with the results data to be used to create the cards.
 */
function addTrainingSessionCards(querySnapshot) {
  // Container for the training sessions
  const container = document.querySelector('#training-sessions');

  // Clear out container
  utils.clearOutChildNodes(container);

  if (querySnapshot.empty) {
    // If no training sessions were found, add empty results text.
    addEmptyResultsText(container);
  } else {
    // If training sessions were found, create a summary card for each
    // one and add them to the container
    querySnapshot.forEach(function (snapshot) {
      container.appendChild(createTrainingSessionCard(snapshot));
    });
  }
}


/**
 * Add empty results text to the given container.
 * @param {HTMLElement} container - Container to which the text will be added.
 */
function addEmptyResultsText(container) {
  const emptyText = document.createElement('p');
  emptyText.id = 'empty-text';
  emptyText.textContent = 'No se encontraron sesiones de entrenamiento.';
  container.appendChild(emptyText);
}


/**
 * Create a summary card for the given training session, using its
 * basic data and number of exercise items.
 * @param {QueryDocumentSnapshot} snapshot
 * Document snapshot of the training session to be summarized.
 * @returns {HTMLDivElement} - Resulting summary card div.
 */
function createTrainingSessionCard(snapshot) {
  /**
   * Training session object constructed from Firestore data.
   * @type {TrainingSession}
   */
  const trainingSession = snapshot.data();

  // Training session card
  const container = document.createElement('div');
  container.classList.add('training-session', 'card', 'mb-4', 'shadow-sm');

  // Card body 1
  const cardBody1 = document.createElement('div');
  cardBody1.classList.add('card-body');

  // Card title
  const h2 = document.createElement('h2');
  h2.classList.add('card-title')
  h2.textContent = trainingSession.fullTitle;

  // Summary data list
  const summaryList = document.createElement('ul');
  summaryList.classList.add('list-group', 'list-group-flush');

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

  // Exercise items count
  const exerciseCountListItem = document.createElement('li');
  exerciseCountListItem.classList.add('list-group-item');

  const exerciseCountLabel = document.createElement('b');
  exerciseCountLabel.textContent = 'Número de ejercicios registrados:';
  exerciseCountListItem.appendChild(exerciseCountLabel);

  exerciseCountListItem.appendChild(
      document.createTextNode(' ' + trainingSession.exerciseItemsCount));

  // Card body 2
  const cardBody2 = document.createElement('div');
  cardBody2.classList.add('card-body');

  // Detail link button
  const detailLink = document.createElement('a');
  detailLink.classList.add('card-link', 'btn', 'btn-primary', 'mb-2');
  detailLink.href = '/historial/detalle.html?id=' + snapshot.id;
  detailLink.textContent = 'Ver detalles';

  // Edit link button
  const editLink = document.createElement('a');
  editLink.classList.add('card-link', 'btn', 'btn-outline-secondary', 'mb-2');
  editLink.href = '/historial/modificar.html?id=' + snapshot.id;
  editLink.textContent = 'Modificar';

  // Delete link button
  const deleteLink = document.createElement('a');
  deleteLink.classList.add('card-link', 'btn', 'btn-outline-danger', 'mb-2');
  deleteLink.href = '/historial/eliminar.html?id=' + snapshot.id;
  deleteLink.textContent = 'Eliminar';

  // Add everything to card
  cardBody1.appendChild(h2);

  summaryList.appendChild(durationListItem);
  summaryList.appendChild(exerciseCountListItem);

  cardBody2.appendChild(detailLink);
  cardBody2.appendChild(editLink);
  cardBody2.appendChild(deleteLink);

  container.appendChild(cardBody1);
  container.appendChild(summaryList);
  container.appendChild(cardBody2);

  return container;
}


/**
 * Add previous and next buttons to the page navigation container.
 *
 * @param {string} uid - UID of the signed-in user.
 * @param {QuerySnapshot} querySnapshot
 * Query snapshot from which to get the pagination cursors.
 * @param {number} queryLimit - Number of training sessions per page.
 * @param {?Date} startDate
 * Start date by which to filter the training sessions, or null.
 * @param {?Date} endDate
 * End date by which to filter the training sessions, or null.
 * @param {number} page - Current page number.
 */
function addPagination(
    uid, querySnapshot, queryLimit, startDate, endDate, page
) {
  // Pagination nav
  const pagination = document.querySelector('nav#pagination');

  // Previous button
  const previous = document.createElement('button');
  previous.classList.add('btn', 'btn-outline-primary');
  previous.ariaLabel = 'Página anterior';
  previous.title = previous.ariaLabel;

  const previousIcon = document.createElement('span');
  previousIcon.textContent = utils.LAQUO;
  previousIcon.ariaHidden = true;

  previous.appendChild(previousIcon);

  // Disable previous button if this is the first page (or lower, but
  // that should not be possible)
  previous.disabled = page <= 1;

  // Current page indicator
  const currentPage = document.createElement('div');
  currentPage.id = '#current-page-number';
  currentPage.textContent = 'Página ' + page;

  // Next button
  const next = document.createElement('button');
  next.classList.add('btn', 'btn-outline-primary');
  next.ariaLabel = 'Página siguiente';
  next.title = next.ariaLabel;

  const nextIcon = document.createElement('span');
  nextIcon.textContent = utils.RAQUO;
  nextIcon.ariaHidden = true;

  next.appendChild(nextIcon);

  // Number of document snapshots in the query results
  const resultsCount = querySnapshot.docs.length;

  if (!resultsCount) {
    // If no training sessions were found, disable next button if the
    // current page number is greater than 1
    next.disabled = page > 1;
  } else {
    // If training sessions were found, disable next button if the
    // number of documents in the query results is lower than the
    // query limit
    next.disabled = resultsCount < queryLimit;
  }

  // Add event listeners
  previous.addEventListener('click', function (event) {
    // Set query cursor to the first document snapshot in the query results
    const cursor = querySnapshot.docs[0];

    if (cursor) {
      // Construct training log for the previous page
      constructTrainingLog(
          uid, queryLimit, startDate, endDate, 'prev', cursor, page - 1);
    } else {
      // In case the current page has no results, and thus no cursor,
      // go back to the last full page
      constructTrainingLog(
          uid, queryLimit, startDate, endDate, 'last', null, page - 1);
    }
  });

  next.addEventListener('click', function (event) {
    // Set query cursor to the last document snapshot in the query results
    const cursor = querySnapshot.docs[resultsCount - 1];

    // Construct training log for the next page
    constructTrainingLog(
        uid, queryLimit, startDate, endDate, 'next', cursor, page + 1);
  });

  // Clear out pagination nav
  utils.clearOutChildNodes(pagination);

  // Add elements to pagination nav
  pagination.appendChild(previous);
  pagination.appendChild(currentPage);
  pagination.appendChild(next);
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


/**
 * Create a button to load example training sessions data from JSON file.
 *
 * @param {string} uid - UID of the signed-in user-
 * @returns {HTMLButtonElement} - Button to load example data.
 */
function createLoadDataButton(uid) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-warning');
  button.id = 'load-data-btn';
  button.textContent = 'Cargar sesiones desde JSON';

  button.addEventListener('click', function (event) {
    loadExampleTrainingSessionsJSON(uid).then((createdCount) => {
      if (createdCount) {
        // If at least one training session was loaded,
        // show success alert message
        utils.clearAlertMessages();
        utils.addAlertMessage(
          'alert-success',
          [`${createdCount} sesiones de entrenamiento cargadas exitosamente.`]
        );
      } else {
        // Otherwise, show error message
        utils.clearAlertMessages();
        utils.addAlertMessage(
          'alert-danger',
          ['No se pudo cargar ninguna sesión de entrenamiento.']
        );
      }

      // Scroll to the top of the page
      utils.scrollToTop();
    });
  });

  return button;
}


window.addEventListener('load', function () {
  // Add pending alert message to page
  utils.addPendingAlertMessage();

  // Get query parameters
  const params = utils.getQueryParams();

  // Get start date filter from query parameter if given, or set to undefined
  let startDate = params.start ? new Date(params.start + 'T00:00:00') : undefined;

  if (startDate && startDate.toString() === 'Invalid Date') {
    // If start date is invalid, set to null
    startDate = null;
  }

  // Get end date filter from query parameters if given, or set to undefined
  let endDate = params.end ? new Date(params.end + 'T23:59:59') : undefined;

  if (endDate && endDate.toString() === 'Invalid Date') {
    // If end date is invalid, set to null
    endDate = null;
  }

  if (startDate === null || endDate === null) {
    // If either date filter parameter is null, redirect appropriately
    // and end event handler execution.
    utils.setQueryParams(createQuery(startDate, endDate));
    return;
  }

  // Set page title
  setPageTitle(startDate, endDate);

  // Add pending alert message to page
  utils.addPendingAlertMessage();

  // Get fixed page elements
  const createButton = document.querySelector('#create-training-session-btn');

  const dateFilter = document.querySelector('form#date-filter');
  const dateFilterStart =
      dateFilter.querySelector('input[type="date"]#start-date');
  const dateFilterEnd = dateFilter.querySelector('input[type="date"]#end-date');
  const dateFilterButton = dateFilter.querySelector('button[type="submit"]');

  // Add event listener for date filter form submission
  dateFilter.addEventListener('submit', function (event) {
    event.preventDefault();

    if (dateFilter.reportValidity()) {
      // If form is valid, filter by the selected dates
      let start = null;
      if (dateFilterStart.value) {
        start = new Date(dateFilterStart.value + 'T00:00:00');
      }

      let end = null;
      if (dateFilterEnd.value) {
        end = new Date(dateFilterEnd.value + 'T23:59:59');
        }

      utils.setQueryParams(createQuery(start, end));
    }
  });

  // Set up authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is signed in, set up header
      utils.setUpSignedInHeader(user);

      // Enable create button
      createButton.href = '/historial/crear.html';
      createButton.classList.remove('disabled');
      createButton.ariaDisabled = false;

      if (params.test && Number(params.test) === 1) {
        // If test query parameter is set to 1, create button to load
        // example training sessions data
        createButton.parentElement.appendChild(createLoadDataButton(user.uid));
      }

      // Enable date filter fields and submit button
      dateFilterStart.disabled = false;
      dateFilterEnd.disabled = false;
      dateFilterButton.disabled = false;

      // Construct training log first page
      constructTrainingLog(
          user.uid, utils.TRAINING_LOG_ITEMS_PER_PAGE, startDate, endDate);

      // Set date filter inputs' values
      if (startDate) {
        dateFilterStart.value = utils.toISODateOnly(startDate);
      }

      if (endDate) {
        dateFilterEnd.value = utils.toISODateOnly(endDate);
      }
    } else {
      // If the user is signed-out, add info message indicating the
      // user to sign in
      utils.addAlertMessage(
          'alert-info',
          ['Inicie sesión para gestionar su historial de entrenamiento.']
      );

      // Scroll to the top of the page
      utils.scrollToTop();

      // Disable create button
      createButton.href = '';
      createButton.classList.add('disabled');
      createButton.ariaDisabled = true;

      // Remove button to load example data, if present
      const loadDataButton = document.querySelector('#load-data-btn');
      if (loadDataButton) {
        loadDataButton.remove();
      }

      // Disable date filter fields and submit button
      dateFilterStart.disabled = true;
      dateFilterEnd.disabled = true;
      dateFilterButton.disabled = true;

      // Clear out training log and add empty results text
      const trainingLogContainer = document.querySelector('#training-sessions');
      utils.clearOutChildNodes(trainingLogContainer);
      addEmptyResultsText(trainingLogContainer);

      // Clear out pagination nav
      const paginationNav = document.querySelector('nav#pagination');
      utils.clearOutChildNodes(paginationNav);
    }
  });
});
