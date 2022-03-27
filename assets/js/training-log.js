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


function addTrainingSessions(sessions) {
  /* Add the given training sessions to the page. */

  if (sessions) {
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

  let trainingSession = document.createElement('div');
  trainingSession.classList.add('training-session');

  let h2 = document.createElement('h2');

  let title = session.date + ' ' + session.time;
  if (session.shortTitle) {
    // \u2013 = en dash
    title += ' \u2013 ' + session.shortTitle;
  }

  h2.textContent = title;

  let p = document.createElement('p');
  p.textContent =
      'Previsualización de ejercicios realizados (solo series de trabajo):'

  let exercises = document.createElement('div');
  exercises.classList.add('exercises');

  let table = document.createElement('table');

  let thead = document.createElement('thead');
  let headers = ['Ejercicio', 'Peso', 'Series', 'Repeticiones'];

  for (let header of headers) {
    let th = document.createElement('th');
    th.textContent = header;
    thead.appendChild(th);
  }

  let tbody = document.createElement('tbody');

  for (let item of session.exercises) {
    if (item.setType === 'work') {
      let tr = document.createElement('tr');

      let exercise = document.createElement('td');
      exercise.textContent = item.exercise;

      let weight = document.createElement('td');
      weight.classList.add('ta-center');
      weight.textContent = '\u2013'; // en dash

      if (item.weight) {
        // \u00a0 = non-breaking space
        weight.textContent = item.weight + '\u00a0' + 'kg'
      }

      let sets = document.createElement('td');
      sets.classList.add('ta-center');
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

  trainingSession.appendChild(h2);
  trainingSession.appendChild(p);
  trainingSession.appendChild(exercises);

  return trainingSession;
}


function addPagination(date, numPages, page) {
  /* Add pagination links based on the given parameters. */

  let pathname = window.location.pathname;
  let previousPage = (page === 1) ? null : page - 1;
  let nextPage = (page >= numPages) ? null : page + 1;

  let pagination = document.querySelector('ul#pagination');

  let previous = document.createElement('li');

  if (previousPage) {
    let queryParams = new URLSearchParams(createQuery(date, previousPage));

    let a = document.createElement('a');
    a.href = pathname + '?' + queryParams;
    a.rel = 'prev';
    a.textContent = 'Anterior';

    previous.appendChild(a);
  }

  let current = document.createElement('li');
  current.textContent = 'Página ' + page + ' de ' + numPages;

  let next = document.createElement('li');

  if (nextPage) {
    let queryParams = new URLSearchParams(createQuery(date, nextPage));

    let a = document.createElement('a');
    a.href = pathname + '?' + queryParams;
    a.rel = 'next';
    a.textContent = 'Siguiente';

    next.appendChild(a);
  }

  pagination.appendChild(previous);
  pagination.appendChild(current);
  pagination.appendChild(next);
}


window.addEventListener('load', function () {
  let signedInAccount = utils.getSignedInAccount();

  if (!signedInAccount) {
    // If not signed-in, set pending info message and redirect to sign-in
    let text = 'Inicie sesión para acceder a su historial de entrenamiento.';
    utils.setPendingStatusMessage('info', [text]);
    window.location.assign('/iniciar-sesion.html?next=/historial/');
    return;
  } else {
    // If signed-in, set up signed-in header
    utils.setUpSignedInHeader(signedInAccount);

    // Get query params
    const params = utils.getQueryParams();

    // Get filter date from query parameter, if present
    let date = params.date ? params.date : null;
    let dateNumber = Date.parse(params.date);

    // Get page number from query parameter
    let page = params.page ? Number(params.page) : 1;

    // Handle invalid date and/or page number, if necessary
    if ((date && isNaN(dateNumber)) || isNaN(page) || page <= 0) {
      // Empty out invalid query parameters
      date = isNaN(dateNumber) ? null : date;
      page = (isNaN(page) || page <= 0) ? null : page;

      // Redirect appropriately and end event handler execution
      utils.setQueryParams(createQuery(date, page));
      return;
    }

    // Number of items per page
    const itemsPerPage = 10;

    // Get this account's training sessions, filtered by date if the
    // parameter is set
    let sessions = utils.getTrainingSessions(date);

    // Computer total number of pages
    let numPages = Math.ceil(sessions.length / itemsPerPage);
    if (numPages <= 0) {
      numPages = 1;
    }

    // Redirect to first page if the page number is too high
    if (page > numPages) {
      utils.setQueryParams(createQuery(date, null));
    }

    // Add pagination
    addPagination(date, numPages, page);

    // Compute indexes of first and last items
    let first = itemsPerPage * (page - 1);
    let last = first + itemsPerPage;

    // Keep only this page's training sessions
    sessions = sessions.slice(first, last);

    // Add sessions data to page
    addTrainingSessions(sessions);
  }
});
