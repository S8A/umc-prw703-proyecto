import * as utils from '/assets/js/utils.js';


function constructTrainingSessionDetailsPage(session) {
  /* Construct detail page with the given training session's data. */

  let container = document.querySelector('#training-session-detail');

  // Title
  let mainTitle = container.querySelector('h1#main-title');
  let fullTitle = utils.getTrainingSessionFullTitle(session);
  mainTitle.textContent = fullTitle;

  // Page title
  document.title =
    'Sesión de entrenamiento: ' + fullTitle + ' ' + utils.NDASH
    + ' 8A Training';

  // Remove #empty-text element
  let emptyText = container.querySelector('p#empty-text');
  container.removeChild(emptyText);

  // Main buttons
  let mainButtons = document.createElement('div');
  mainButtons.id = 'main-buttons';
  mainButtons.classList.add('py-3', 'text-center');

  let editButton = document.createElement('a');
  editButton.classList.add('btn', 'btn-primary', 'mx-2');
  editButton.href = '/historial/modificar.html?id=' + session.id;
  editButton.textContent = 'Modificar sesión';

  let deleteButton = document.createElement('a');
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.href = '/historial/eliminar.html?id=' + session.id;
  deleteButton.textContent = 'Eliminar sesión';

  mainButtons.appendChild(editButton);
  mainButtons.appendChild(deleteButton);

  // Basic data
  let basicDataSection = document.createElement('section');
  basicDataSection.id = 'basic-data';

  let basicDataTitle = document.createElement('h2');
  basicDataTitle.textContent = 'Datos generales';

  let basicDataList = createBasicDataList(session)

  basicDataSection.appendChild(basicDataTitle);
  basicDataSection.appendChild(basicDataList);

  // Exercises
  let exercisesSection = document.createElement('section');
  exercisesSection.id = 'exercises';

  let exercisesTitle = document.createElement('h2');
  exercisesTitle.textContent = 'Ejercicios';

  let exercisesDiv = document.createElement('div');
  exercisesDiv.classList.add('exercises');

  let exercisesTable = createExercisesTable(session.exercises);
  exercisesDiv.appendChild(exercisesTable);

  exercisesSection.appendChild(exercisesTitle);
  exercisesSection.appendChild(exercisesDiv);

  // Put everything together
  container.appendChild(mainButtons);
  container.appendChild(basicDataSection);
  container.appendChild(exercisesSection);
}


function createBasicDataList(session) {
  /* Create basic data list with the given training session data. */

  let basicDataList = document.createElement('ul');
  basicDataList.classList.add('list-group', 'mb-5');

  // Date and time
  let datetimeListItem = document.createElement('li');
  datetimeListItem.classList.add('list-group-item');

  let datetimeLabel = document.createElement('b');
  datetimeLabel.textContent = 'Fecha y hora:';
  datetimeListItem.appendChild(datetimeLabel);

  let datetime = session.date + ' ' + session.time;
  datetimeListItem.appendChild(document.createTextNode(' ' + datetime));

  // Short title
  let shortTitleListItem = document.createElement('li');
  shortTitleListItem.classList.add('list-group-item');

  let shortTitleLabel = document.createElement('b');
  shortTitleLabel.textContent = 'Título breve:';
  shortTitleListItem.appendChild(shortTitleLabel);

  let shortTitle = session.shortTitle ? session.shortTitle : utils.NDASH;
  shortTitleListItem.appendChild(document.createTextNode(' ' + shortTitle));

  // Duration
  let durationListItem = document.createElement('li');
  durationListItem.classList.add('list-group-item');

  let durationLabel = document.createElement('b');
  durationLabel.textContent = 'Duración de la sesión:';
  durationListItem.appendChild(durationLabel);

  let duration = utils.NDASH;
  if (session.duration) {
    duration = session.duration + utils.NBSP + 'min';
  }
  durationListItem.appendChild(document.createTextNode(' ' + duration));

  // Bodyweight
  let bodyweightListItem = document.createElement('li');
  bodyweightListItem.classList.add('list-group-item');

  let bodyweightLabel = document.createElement('b');
  bodyweightLabel.textContent = 'Peso corporal:';
  bodyweightListItem.appendChild(bodyweightLabel);

  let bodyweight = utils.NDASH;
  if (session.bodyweight) {
    bodyweight = session.bodyweight + utils.NBSP + 'kg';
  }
  bodyweightListItem.appendChild(document.createTextNode(' ' + bodyweight));

  // Comments
  let commentsListItem = document.createElement('li');
  commentsListItem.classList.add('list-group-item');

  let commentsLabel = document.createElement('b');
  commentsLabel.textContent = 'Comentarios:';
  commentsListItem.appendChild(commentsLabel);

  let comments = session.comments ? session.comments : utils.NDASH;
  commentsListItem.appendChild(document.createTextNode(' ' + comments));

  // Add to list
  basicDataList.appendChild(datetimeListItem);
  basicDataList.appendChild(shortTitleListItem);
  basicDataList.appendChild(durationListItem);
  basicDataList.appendChild(bodyweightListItem);
  basicDataList.appendChild(commentsListItem);

  return basicDataList;
}


function createExercisesTable(exercises) {
  /* Create table with the given exercise items. */

  let table = document.createElement('table');
  table.classList.add('table', 'table-striped', 'table-hover');

  // Table head
  let thead = document.createElement('thead');
  let headers = [
    'Ejercicio',
    'Modalidad',
    'Peso',
    'Series',
    'Repeticiones',
    'Comentarios',
  ];

  for (let header of headers) {
    let th = document.createElement('th');
    th.classList.add('px-2');
    th.textContent = header;
    thead.appendChild(th);
  }

  // Table body
  let tbody = document.createElement('tbody');

  for (let item of exercises) {
    // For each exercise item, create a table row and append it to table body
    let tr = document.createElement('tr');

    let exercise = document.createElement('td');
    exercise.classList.add('px-2');
    exercise.textContent = item.exercise;

    let setType = document.createElement('td');
    setType.classList.add('px-2');
    if (item.setType === 'work') {
      setType.textContent = 'Trabajo';
    } else if (item.setType === 'warmup') {
      setType.textContent = 'Calentamiento';
    }

    let weight = document.createElement('td');
    weight.classList.add('px-2');
    weight.textContent = utils.NDASH;

    if (item.weight) {
      weight.textContent = item.weight + utils.NBSP + 'kg'
    }

    let sets = document.createElement('td');
    sets.classList.add('px-2');
    sets.textContent = item.sets;

    let reps = document.createElement('td');
    reps.classList.add('px-2');
    reps.textContent = item.reps.join(', ');

    let comments = document.createElement('td');
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

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
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

    // Training session ID
    const id = Number(params.id);

    // If no valid ID parameter set, redirect to training log page
    if (!Number.isInteger(id) || id <= 0) {
      window.location.assign('/historial/');
      return;
    }

    // Try to get training session with the given ID
    let session = utils.getTrainingSession(id);

    if (!session) {
      // If the training session was not found, add error status message
      let text = 'La sesión de entrenamiento solicitada no existe o '
      + 'no pertenece a su cuenta.';
      utils.clearStatusMessages();
      utils.addStatusMessage('error', [text]);
    } else {
      // If the training session was found, construct detail page
      constructTrainingSessionDetailsPage(session);
    }

    // Add pending status message to page
    utils.addPendingStatusMessage();
  }
});
