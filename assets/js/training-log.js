import * as utils from '/assets/js/utils.js';


function createQuery(date, page) {
  /* Create query parameters object with the given date and page. */

  let query = {};

  if (date) {
    query.date = date;
  }

  if (page) {
    query.page = page;
  }

  return query;
}


function constructTrainingLog(date, page) {
  /* Construct training log page with the given date and page parameters. */

  // Set page title with filter date and page number
  setPageTitle(date, page);

  // Get this account's training sessions, filtered by date if the
  // parameter is set
  let sessions = utils.getTrainingSessions(date);

  // Computer total number of pages
  let numPages = 1;
  if (sessions.length) {
    numPages = Math.ceil(sessions.length / utils.TRAINING_LOG_ITEMS_PER_PAGE);
  }

  // Redirect to first page if the page number is too high
  if (page > numPages) {
    utils.setQueryParams(createQuery(date, null));
    return;
  }

  // Compute indexes of first and last items
  let first = utils.TRAINING_LOG_ITEMS_PER_PAGE * (page - 1);
  let last = first + utils.TRAINING_LOG_ITEMS_PER_PAGE;

  // Keep only this page's training sessions
  sessions = sessions.slice(first, last);

  // Add sessions data to page
  addTrainingSessions(sessions);

  // Get date filter and field
  let dateFilter = document.querySelector('form#date-filter');
  let dateField =
      dateFilter.querySelector('input[type="date"]#date-filter-input');

  // Set date field value if date query param is set
  if (date) {
    dateField.value = date;
  }

  // Add event listener for date filter form submission
  dateFilter.addEventListener('submit', function (event) {
    event.preventDefault();

    if (dateFilter.reportValidity()) {
      // If form is valid, filter by the selected date
      let filterDate = dateField.value;
      utils.setQueryParams(createQuery(filterDate, null));
    }
  });

  // Add pagination
  addPagination(date, numPages, page);

  // Add pending status message to page
  utils.addPendingStatusMessage();
}


function addTrainingSessions(sessions) {
  /* Add the given training sessions to the page. */

  if (sessions && sessions.length) {
    let trainingSessions = document.querySelector('#training-sessions');

    let emptyText = trainingSessions.querySelector('#empty-text');
    trainingSessions.removeChild(emptyText);

    for (let session of sessions) {
      trainingSessions.append(createTrainingSessionContainer(session));
    }
  }
}


function createTrainingSessionContainer(session) {
  /* Create div with preview data from the given session data. */

  // Training session card
  let trainingSession = document.createElement('div');
  trainingSession.classList.add(
      'training-session', 'card', 'mb-5', 'shadow');

  // Card body
  let cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  // Card title
  let h2 = document.createElement('h2');
  h2.classList.add('card-title')

  let a = document.createElement('a');
  a.href = '/historial/detalle.html?id=' + session.id;
  a.textContent = utils.getTrainingSessionFullTitle(session);

  h2.appendChild(a);

  // Subtitle
  let p = document.createElement('p');
  p.classList.add('card-subtitle', 'mb-2', 'text-muted');
  p.textContent =
      'Previsualización de ejercicios realizados (solo series de trabajo):'

  // Exercises section
  let exercises = document.createElement('div');
  exercises.classList.add('exercises');

  // Exercises table
  let table = document.createElement('table');
  table.classList.add('table', 'table-striped', 'table-hover', 'table-sm');

  // Table head
  let thead = document.createElement('thead');
  let headers = ['Ejercicio', 'Peso', 'Series', 'Repeticiones'];

  for (let header of headers) {
    let th = document.createElement('th');
    th.textContent = header;
    thead.appendChild(th);
  }

  // Table body
  let tbody = document.createElement('tbody');

  for (let item of session.exercises) {
    if (item.setType === 'work') {
      let tr = document.createElement('tr');

      let exercise = document.createElement('td');
      exercise.textContent = item.exercise;

      let weight = document.createElement('td');
      weight.textContent = utils.NDASH;

      if (item.weight) {
        weight.textContent = item.weight + utils.NBSP + 'kg'
      }

      let sets = document.createElement('td');
      sets.textContent = item.sets;

      let reps = document.createElement('td');
      reps.textContent = item.reps.join(', ');

      tr.appendChild(exercise);
      tr.appendChild(weight);
      tr.appendChild(sets);
      tr.appendChild(reps);

      tbody.appendChild(tr);
    }
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  exercises.appendChild(table);

  // Add everything to card
  cardBody.appendChild(h2);
  cardBody.appendChild(p);
  cardBody.appendChild(exercises);

  trainingSession.appendChild(cardBody);

  return trainingSession;
}


function setPageTitle(date, page) {
  /* Add filter date (if any) and page number to title. */

  let title = ['Historial de entrenamiento'];
  if (date) {
    title[0] += ': ' + date;
  }

  title.push('Página ' + page);
  title.push('8A Training');

  document.title = title.join(utils.NDASH);
}


function addPagination(date, numPages, currentPage) {
  /* Add pagination links based on the given parameters. */

  // Pagination parameters
  let pathname = window.location.pathname;
  let previousPage = (currentPage === 1) ? null : currentPage - 1;
  let nextPage = (currentPage >= numPages) ? null : currentPage + 1;

  // Pagination list
  let paginationList = document.querySelector('nav#pagination ul.pagination');
  
  // Previous page
  if (previousPage) {
    let previous = document.createElement('li');
    previous.classList.add('page-item');

    let queryParams = new URLSearchParams(createQuery(date, previousPage));

    let a = document.createElement('a');
    a.classList.add('page-link');
    a.href = pathname + '?' + queryParams;
    a.rel = 'prev';
    a.textContent = 'Anterior';

    previous.appendChild(a);
    paginationList.appendChild(previous);
  }

  // Page numbers
  for (let page = 1; page <= numPages; page++) {
    let pageItem = document.createElement('li');
    pageItem.classList.add('page-item');

    let a = document.createElement('a');
    a.textContent = page;
    a.classList.add('page-link');

    if (page === currentPage) {
      pageItem.classList.add('active');
      a.href = '#';
    } else {
      let queryParams = new URLSearchParams(createQuery(date, page));
      a.href = pathname + '?' + queryParams;
    }

    pageItem.appendChild(a);
    paginationList.appendChild(pageItem);
  }

  // Next page
  if (nextPage) {
    let next = document.createElement('li');
    next.classList.add('page-item');

    let queryParams = new URLSearchParams(createQuery(date, nextPage));

    let a = document.createElement('a');
    a.classList.add('page-link');
    a.href = pathname + '?' + queryParams;
    a.rel = 'next';
    a.textContent = 'Siguiente';

    next.appendChild(a);
    paginationList.append(next);
  }
}


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  if (!signedInAccount) {
    // If not signed-in, set pending info message and redirect to sign-in
    let text = 'Inicie sesión para acceder a su historial de entrenamiento.';
    utils.setPendingStatusMessage('alert-info', [text]);
    window.location.assign('/iniciar-sesion.html?next=/historial/');
    return;
  } else {
    // If signed-in, set up signed-in header
    utils.setUpSignedInHeader(signedInAccount);

    // Get query params
    const params = utils.getQueryParams();

    // Get filter date from query parameter if given, or set to undefined
    let date = params.date ? params.date : undefined;
    let dateNumber = Date.parse(date);

    if (date && Number.isNaN(dateNumber)) {
      // If the date was given (not undefined) and it's not a valid date
      date = null;
    }

    // Get page number from query parameter if given, or set to 1
    let page = params.page ? params.page : 1;
    let pageNumber = Number(page);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      // If the page number is not an integer or it's lower than one
      page = null;
    } else {
      page = pageNumber;
    }

    if (date === null || page === null) {
      // If either the date or page is null, redirect appropriately
      utils.setQueryParams(createQuery(date, page));
    } else {
      // Otherwise, construct training log page
      constructTrainingLog(date, page);
    }
  }
});
