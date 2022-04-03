import { TrainingSession, ExerciseItem, SetType } from './data-classes.js';
import * as utils from './utils.js';


/* CONSTRUCT FORM PAGE */

/**
 * Construct form page for creating a new training session or editing
 * an existing one.
 *
 * @param {string} mainTitleText - Text for the main title heading.
 * @param {string} formId - ID of the main form element.
 * @param {string} formLabel - ARIA label for the form.
 * @param {string} submitButtonText - Text for the form's submit button.
 * @param {?TrainingSession} [trainingSession=null]
 * TrainingSession object with the data of the training session to edit,
 * or null to create a new training session.
 */
export function constructTrainingSessionForm(
    mainTitleText, formId, formLabel, submitButtonText, trainingSession = null
) {
  // Training session form container
  const container = document.querySelector('#training-session-form-container');

  // Main title
  const mainTitle = container.querySelector('h1#main-title');
  mainTitle.textContent = mainTitleText;

  // Remove #empty-text element
  const emptyText = container.querySelector('p#empty-text');
  container.removeChild(emptyText);

  // Form
  const form = document.createElement('form');
  form.classList.add('needs-validation');
  form.id = formId;
  form.ariaLabel = formLabel;
  form.noValidate = true;

  // Basic data
  const basicDataSection = document.createElement('section');
  basicDataSection.id = 'basic-data';

  const basicDataTitle = document.createElement('h2');
  basicDataTitle.textContent = 'Datos generales';

  const basicDataRequired = document.createElement('p');
  basicDataRequired.appendChild(
      document.createTextNode('Los campos requeridos son indicados por '));

  const requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.textContent = '*';
  requiredAsterisk.title = 'requerido';

  basicDataRequired.appendChild(requiredAsterisk);
  basicDataRequired.appendChild(document.createTextNode('.'));

  const basicDataFormFields = createBasicDataFormFields(trainingSession);

  basicDataSection.appendChild(basicDataTitle);
  basicDataSection.appendChild(basicDataRequired);
  basicDataSection.appendChild(basicDataFormFields);

  // Exercises
  const exercisesSection = document.createElement('section');
  exercisesSection.id = 'exercises';

  const exercisesTitle = document.createElement('h2');
  exercisesTitle.textContent = 'Ejercicios';

  const exercisesRequired = basicDataRequired.cloneNode(true);

  const actionButtons = createActionButtons();

  const exercisesDiv = document.createElement('div');
  exercisesDiv.classList.add('table-responsive');

  const exercisesTable = createExercisesTable(trainingSession);
  exercisesDiv.appendChild(exercisesTable);

  exercisesSection.appendChild(exercisesTitle);
  exercisesSection.appendChild(exercisesRequired);
  exercisesSection.appendChild(actionButtons);
  exercisesSection.appendChild(exercisesDiv);

  // Form buttons
  const formButtonsSection = document.createElement('section');
  formButtonsSection.classList.add('text-center');
  formButtonsSection.id = 'form-buttons';

  const submitButton = document.createElement('button');
  submitButton.classList.add('btn', 'btn-primary');
  submitButton.type = 'submit';
  submitButton.textContent = submitButtonText;

  formButtonsSection.appendChild(submitButton);

  // Put everything together
  form.appendChild(basicDataSection);
  form.appendChild(exercisesSection);
  form.appendChild(formButtonsSection);

  container.appendChild(form);

  // Toggle action buttons
  toggleActionButtons();
}


/**
 * Create basic data form fields with the data of the given training session.
 *
 * @param {?TrainingSession} [trainingSession=null]
 * TrainingSession object from which to extract the fields' initial
 * values, or null to leave them empty.
 * @returns {HTMLDivElement}
 * Div containing the basic data form fields and their labels.
 */
function createBasicDataFormFields(trainingSession = null) {
  // Div container for the form fields
  const container = document.createElement('div');
  container.classList.add('row');

  // Fields' initial values
  let date = undefined;
  let time = undefined;
  let shortTitle = undefined;
  let duration = undefined;
  let bodyweight = undefined;
  let comments = undefined;

  if (trainingSession && trainingSession instanceof TrainingSession) {
    // If given a training session, use its data for the initial values
    date = trainingSession.date;
    time = trainingSession.time;
    shortTitle = trainingSession.shortTitle;
    duration = trainingSession.duration;
    bodyweight = trainingSession.bodyweight;
    comments = trainingSession.comments;
  }

  // Create form fields and add them to the container
  container.appendChild(createDateDiv(date));
  container.appendChild(createTimeDiv(time));
  container.appendChild(createShortTitleDiv(shortTitle));
  container.appendChild(createDurationDiv(duration));
  container.appendChild(createBodyweightDiv(bodyweight));
  container.appendChild(createGeneralCommentsDiv(comments));

  return container;
}


/**
 * Create action buttons for manipulating exercise items.
 *
 * @returns {HTMLDivElement} Div containing the action buttons.
 */
function createActionButtons() {
  // Div container for the action buttons
  const container = document.createElement('div');
  container.classList.add(
      'd-grid', 'gap-2', 'd-sm-block', 'mb-3', 'text-center');
  container.id = 'action-buttons';
  container.ariaLabel = 'Acciones';
  container.setAttribute('role', 'toolbar');

  // Add button
  const addButton = document.createElement('button');
  addButton.classList.add(
      'btn', 'btn-success', 'btn-sm', 'me-sm-2', 'mb-sm-2');
  addButton.type = 'button';
  addButton.id = 'add-btn';
  addButton.textContent = 'Agregar ejercicio';

  addButton.addEventListener('click', function (event) {
    addExerciseItemRow();
  });

  // Remove button
  const removeButton = document.createElement('button');
  removeButton.classList.add(
      'btn', 'btn-danger', 'btn-sm', 'me-sm-2', 'mb-sm-2');
  removeButton.type = 'button';
  removeButton.id = 'remove-btn';
  removeButton.textContent = 'Eliminar seleccionado';

  removeButton.addEventListener('click', function (event) {
    removeExerciseItemRow();
  });

  // Duplicate button
  const duplicateButton = document.createElement('button');
  duplicateButton.classList.add(
      'btn', 'btn-secondary', 'btn-sm', 'me-sm-2', 'mb-sm-2');
  duplicateButton.type = 'button';
  duplicateButton.id = 'duplicate-btn';
  duplicateButton.textContent = 'Duplicar seleccionado';

  duplicateButton.addEventListener('click', function (event) {
    duplicateExerciseItemRow();
  });

  // Move up button
  const moveUpButton = document.createElement('button');
  moveUpButton.classList.add(
      'btn', 'btn-secondary', 'btn-sm', 'me-sm-2', 'mb-sm-2');
  moveUpButton.type = 'button';
  moveUpButton.id = 'move-up-btn';
  moveUpButton.textContent = 'Subir seleccionado';

  moveUpButton.addEventListener('click', function (event) {
    moveUpExerciseItemRow();
  });

  // Move down button
  const moveDownButton = document.createElement('button');
  moveDownButton.classList.add(
      'btn', 'btn-secondary', 'btn-sm', 'me-sm-2', 'mb-sm-2');
  moveDownButton.type = 'button';
  moveDownButton.id = 'move-down-btn';
  moveDownButton.textContent = 'Bajar seleccionado';

  moveDownButton.addEventListener('click', function (event) {
    moveDownExerciseItemRow();
  });

  // Add buttons to container
  container.appendChild(addButton);
  container.appendChild(removeButton);
  container.appendChild(duplicateButton);
  container.appendChild(moveUpButton);
  container.appendChild(moveDownButton);

  return container;
}


/**
 * Create table of editable exercise items, optionally using the data
 * of the exercise items of the given TrainingSession.
 *
 * @param {?TrainingSession} trainingSession
 * TrainingSession from which to extract the ExerciseItem objects to
 * add to the table as initial rows.
 * @returns {HTMLTableElement} Editable exercise items table.
 */
function createExercisesTable(trainingSession = null) {
  // Table
  const table = document.createElement('table');
  table.classList.add('table', 'table-striped', 'table-hover')

  // Table head
  const thead = document.createElement('thead');
  const headers = [
    {id: 'selection-th', text: '', required: false},
    {id: 'exercise-th', text: 'Ejercicio', required: true},
    {id: 'set-type-th', text: 'Modalidad', required: true},
    {id: 'weight-th', text: 'Peso' + utils.NBSP + '(kg)', required: false},
    {id: 'sets-th', text: 'Series', required: true},
    {id: 'reps-th', text: 'Repeticiones', required: true},
    {id: 'comments-th', text: 'Comentarios', required: false},
  ];

  for (const header of headers) {
    const th = document.createElement('th');
    th.classList.add('px-2');
    th.id = header.id;
    th.appendChild(document.createTextNode(header.text));

    if (header.required) {
      const requiredAsterisk = document.createElement('abbr');
      requiredAsterisk.textContent = '*';
      requiredAsterisk.title = 'requerido';
      requiredAsterisk.ariaLabel = 'requerido';

      th.appendChild(requiredAsterisk);
    }

    thead.appendChild(th);
  }

  // Table body
  const tbody = document.createElement('tbody');

  if (trainingSession instanceof TrainingSession
      && trainingSession.exerciseItemsCount) {
    // If a training session was given and it has at least one ExerciseItem
    for (const i in trainingSession.exercises) {
      // For each ExerciseItem object, create a new exercise item row
      // and append it to the table body
      const indexNumber = Number(i);
      const rowNumber = indexNumber + 1;
      const exerciseItem = trainingSession.exercises[indexNumber];
      const row = createEditableExerciseItemRow(rowNumber, exerciseItem);
      tbody.appendChild(row);
    }
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}


/**
 * Create date field div element with the given value, if any.
 *
 * @param {?any} [value=null] - Initial value for the field.
 * @returns {HTMLDivElement} Div containing the field and its label.
 */
function createDateDiv(value = null) {
  // Div container
  const dateDiv = document.createElement('div');
  dateDiv.classList.add('mb-3', 'col', 'col-12', 'col-sm-6', 'col-lg-4');

  // Label
  const dateLabel = document.createElement('label');
  dateLabel.classList.add('form-label');
  dateLabel.htmlFor = 'date';

  dateLabel.appendChild(document.createTextNode('Fecha:'));

  const requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.textContent = '*';
  requiredAsterisk.title = 'requerido';
  requiredAsterisk.ariaLabel = 'requerido';

  dateLabel.appendChild(requiredAsterisk);
  dateLabel.appendChild(document.createTextNode(' '));

  // Input
  const date = document.createElement('input');
  date.classList.add('form-control');
  date.type = 'date';
  date.id = dateLabel.htmlFor;
  date.name = date.id;
  date.pattern = '\d{4}-\d{2}-\d{2}';
  date.required = true;
  date.value = value;

  // Event listeners
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

  // Add to div
  dateDiv.appendChild(dateLabel);
  dateDiv.appendChild(date);
  dateDiv.appendChild(utils.createInvalidFeedbackElement());

  return dateDiv;
}


/**
 * Create time field div element with the given value, if any.
 *
 * @param {?any} [value=null] - Initial value for the field.
 * @returns {HTMLDivElement} Div containing the field and its label.
 */
function createTimeDiv(value = null) {
  // Div container
  const timeDiv = document.createElement('div');
  timeDiv.classList.add('mb-3', 'col', 'col-12', 'col-sm-6', 'col-lg-4');

  // Label
  const timeLabel = document.createElement('label');
  timeLabel.classList.add('form-label');
  timeLabel.htmlFor = 'time';

  timeLabel.appendChild(document.createTextNode('Hora:'));

  const requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.textContent = '*';
  requiredAsterisk.title = 'requerido';
  requiredAsterisk.ariaLabel = 'requerido';

  timeLabel.appendChild(requiredAsterisk);
  timeLabel.appendChild(document.createTextNode(' '));

  // Input
  const time = document.createElement('input');
  time.classList.add('form-control');
  time.type = 'time';
  time.id = timeLabel.htmlFor;
  time.name = time.id;
  time.pattern = '\d{2}:\d{2}';
  time.required = true;
  time.value = value;

  // Event listeners
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

  // Add to div
  timeDiv.appendChild(timeLabel);
  timeDiv.appendChild(time);
  timeDiv.appendChild(utils.createInvalidFeedbackElement());

  return timeDiv;
}


/**
 * Create short title field div element with the given value, if any.
 *
 * @param {?any} [value=null] - Initial value for the field.
 * @returns {HTMLDivElement} Div containing the field and its label.
 */
function createShortTitleDiv(value = null) {
  // Div container
  const shortTitleDiv = document.createElement('div');
  shortTitleDiv.classList.add('mb-3', 'col', 'col-12', 'col-sm-6', 'col-lg-4');

  // Label
  const shortTitleLabel = document.createElement('label');
  shortTitleLabel.classList.add('form-label');
  shortTitleLabel.htmlFor = 'short-title';
  shortTitleLabel.textContent = 'Título breve: ';

  // Input
  const shortTitle = document.createElement('input');
  shortTitle.classList.add('form-control');
  shortTitle.type = 'text';
  shortTitle.id = shortTitleLabel.htmlFor;
  shortTitle.name = shortTitle.id;
  shortTitle.maxLength = 50;
  shortTitle.value = value;

  // Event listeners
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

  // Add to div
  shortTitleDiv.appendChild(shortTitleLabel);
  shortTitleDiv.appendChild(shortTitle);
  shortTitleDiv.appendChild(utils.createInvalidFeedbackElement());

  return shortTitleDiv;
}


/**
 * Create duration field div element with the given value, if any.
 *
 * @param {?any} [value=null] - Initial value for the field.
 * @returns {HTMLDivElement} Div containing the field and its label.
 */
function createDurationDiv(value = null) {
  // Div container
  const durationDiv = document.createElement('div');
  durationDiv.classList.add('mb-3', 'col', 'col-12', 'col-sm-6', 'col-lg-4');

  // Label
  const durationLabel = document.createElement('label');
  durationLabel.classList.add('form-label');
  durationLabel.htmlFor = 'duration';
  durationLabel.textContent = 'Duración de la sesión (minutos): ';

  // Input
  const duration = document.createElement('input');
  duration.classList.add('form-control');
  duration.type = 'number';
  duration.id = durationLabel.htmlFor;
  duration.name = duration.id;
  duration.min = 0;
  duration.step = 1;
  duration.value = value;

  // Event listeners
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

  // Add to div
  durationDiv.appendChild(durationLabel);
  durationDiv.appendChild(duration);
  durationDiv.appendChild(utils.createInvalidFeedbackElement());

  return durationDiv;
}


/**
 * Create bodyweight field div element with the given value, if any.
 *
 * @param {?any} [value=null] - Initial value for the field.
 * @returns {HTMLDivElement} Div containing the field and its label.
 */
function createBodyweightDiv(value = null) {
  // Div container
  const bodyweightDiv = document.createElement('div');
  bodyweightDiv.classList.add('mb-3', 'col', 'col-12', 'col-sm-6', 'col-lg-4');

  // Label
  const bodyweightLabel = document.createElement('label');
  bodyweightLabel.classList.add('form-label');
  bodyweightLabel.htmlFor = 'bodyweight';
  bodyweightLabel.textContent = 'Peso corporal (kilogramos): ';

  // Input
  const bodyweight = document.createElement('input');
  bodyweight.classList.add('form-control');
  bodyweight.type = 'number';
  bodyweight.id = bodyweightLabel.htmlFor;
  bodyweight.name = bodyweight.id;
  bodyweight.min = 0;
  bodyweight.step = 1;
  bodyweight.value = value;

  // Event listeners
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

  // Add to div
  bodyweightDiv.appendChild(bodyweightLabel);
  bodyweightDiv.appendChild(bodyweight);
  bodyweightDiv.appendChild(utils.createInvalidFeedbackElement());

  return bodyweightDiv;
}


/**
 * Create general comments field div element with the given value, if any.
 *
 * @param {?any} [value=null] - Initial value for the field.
 * @returns {HTMLDivElement} Div containing the field and its label.
 */
function createGeneralCommentsDiv(value = null) {
  // Div container
  const commentsDiv = document.createElement('div');
  commentsDiv.classList.add('mb-3', 'col', 'col-12');

  // Label
  const commentsLabel = document.createElement('label');
  commentsLabel.classList.add('form-label');
  commentsLabel.htmlFor = 'comments';
  commentsLabel.textContent = 'Comentarios: ';

  // Input
  const comments = document.createElement('textarea');
  comments.classList.add('form-control');
  comments.id = commentsLabel.htmlFor;
  comments.name = comments.id;
  comments.cols = 50;
  comments.rows = 10;
  comments.maxLength = 280;
  comments.value = value;

  // Event listeners
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

  // Add to div
  commentsDiv.appendChild(commentsLabel);
  commentsDiv.appendChild(comments);
  commentsDiv.appendChild(utils.createInvalidFeedbackElement());

  return commentsDiv;
}


/* GENERAL HELPERS */

/**
 * Get the currently selected row number.
 *
 * @returns {?number} Currently selected row number, or null if none selected.
 */
function getSelectedRowNumber() {
  const selected = document.querySelector(
      '#exercises input[type="radio"][name="selection"]:checked');

  const rowNumber = selected ? Number(selected.dataset.rowNumber) : null;

  return (Number.isInteger(rowNumber) && rowNumber > 0) ? rowNumber : null;
}


/**
 * Get all exercise item rows.
 *
 * @returns {NodeListOf<HTMLTableRowElement>}
 * List of exercise item rows in the table.
 */
export function getRows() {
  return document.querySelectorAll('#exercises table tbody > tr.exercise-item');
}


/**
 * Get the exercise item row with the given row number.
 *
 * @param {number} rowNumber - Row number.
 * @returns {?HTMLTableRowElement}
 * Exercise item row with the given row number, or null if not found.
 */
export function getRow(rowNumber) {
  return document.querySelector(
      '#exercises table tbody > tr.exercise-item[data-row-number="'
      + rowNumber + '"]'
  );
}


/* ACTION BUTTON FUNCTIONS */

/**
 * Enable/disable action buttons based on the currently selected row
 * number, if any.
 */
export function toggleActionButtons() {
  const selected = getSelectedRowNumber();
  const rowCount = getRows().length;

  // Add button not here because it is always enabled
  const removeButton = document.querySelector('button#remove-btn');
  const duplicateButton = document.querySelector('button#duplicate-btn');
  const moveUpButton = document.querySelector('button#move-up-btn');
  const moveDownButton = document.querySelector('button#move-down-btn');

  if (Number.isInteger(selected)) {
    // If an item is selected, enable duplicate button
    duplicateButton.disabled = false;

    // Disable remove button if there is only one item
    removeButton.disabled = rowCount === 1;

    // Disable move up button if the selected item is the first
    moveUpButton.disabled = selected === 1;

    // Disable move down button if the selected item is the last
    moveDownButton.disabled = selected === rowCount;
  } else {
    // If no item is selected, disable all buttons
    removeButton.disabled = true;
    duplicateButton.disabled = true;
    moveUpButton.disabled = true;
    moveDownButton.disabled = true;
  }
}


/**
 * Add an empty exercise item row after the currently selected one.
 */
export function addExerciseItemRow() {
  const tbody = document.querySelector('#exercises table tbody');
  const rows = getRows();

  const selected = getSelectedRowNumber();

  const newRowNumber = selected ? selected + 1 : rows.length + 1;
  const newRow = createEditableExerciseItemRow(newRowNumber);

  if (!rows.length || !selected || selected === rows.length) {
    // If the there are no rows, or no row is selected, or the last row
    // is selected, append the new item to the end of the table
    tbody.appendChild(newRow);
  } else {
    // Otherwise, all rows after the selected one must have
    // their row number increased by one
    for (const row of rows) {
      const rowNumber = Number(row.dataset.rowNumber);
      if (rowNumber > selected) {
        replaceExerciseItemRowNumber(row, rowNumber + 1);
      }
    }

    // Finally, insert new row before the one following the selected one
    // Reminder: selected is 1-index, rows is 0-index
    tbody.insertBefore(newRow, rows[selected]);
  }

  // Row count changed, toggle action buttons
  toggleActionButtons();
}


/**
 * Remove selected exercise item row, unless it's the only row in the table.
 */
export function removeExerciseItemRow() {
  const selected = getSelectedRowNumber();

  if (selected) {
    // If there is an exercise item selected, look for it, remove it,
    // and reduce by one the row number of all subsequent rows (if any)
    const rows = getRows();

    if (rows.length) {
      for (const row of rows) {
        const rowNumber = Number(row.dataset.rowNumber);
        if (rowNumber === selected) {
          row.remove();
        } else if (rowNumber > selected) {
          replaceExerciseItemRowNumber(row, rowNumber - 1);
        }
      }
    }

    // Selection unset, toggle action buttons
    toggleActionButtons();
  }
}


/**
 * Duplicate selected exercise item row.
 */
export function duplicateExerciseItemRow() {
  const selected = getSelectedRowNumber();
  const selectedRow = selected ? getRow(selected) : null;

  if (selected && selectedRow) {
    // If there is an exercise item row selected, extract its data, create
    // a new exercise item row with the same data, and place it below the
    // selected row
    const data = extractExerciseItemRowData(selectedRow);
    const newRowNumber = selected + 1;
    const newRow = createEditableExerciseItemRow(newRowNumber, data);

    const tbody = document.querySelector('#exercises table tbody');
    const rows = getRows();

    if (!rows.length || selected === rows.length) {
      // If the there are no rows (impossible) or the last row is
      // selected, append the new item to the end of the table
      tbody.appendChild(newRow);
    } else {
      // Otherwise, all rows after the selected one must have
      // their row number increased by one
      for (const row of rows) {
        const rowNumber = Number(row.dataset.rowNumber);
        if (rowNumber > selected) {
          replaceExerciseItemRowNumber(row, rowNumber + 1);
        }
      }

      // Finally, insert new row before the one following the selected one
      // Reminder: selected is 1-index, rows is 0-index
      tbody.insertBefore(newRow, rows[selected]);
    }

    // Row count changed, toggle action buttons
    toggleActionButtons();
  }
}


/**
 * Move selected exercise item row one position up, unless it's the first one.
 */
export function moveUpExerciseItemRow() {
  const selected = getSelectedRowNumber();
  const selectedRow = selected ? getRow(selected) : null;

  if (selected && selected > 1 && selectedRow) {
    // If there is an exercise item row selected and it's not the first
    // one, swap it with the one above it
    const tbody = document.querySelector('#exercises table tbody');
    const rows = getRows();

    if (rows.length && rows.length >= selected) {
      // Reminder: selected is 1-index, rows is 0-index
      const itemAbove = rows[selected - 2];

      // Swap row numbers
      replaceExerciseItemRowNumber(selectedRow, selected - 1);
      replaceExerciseItemRowNumber(itemAbove, selected);

      // Re-insert selected item before the one above it
      tbody.insertBefore(selectedRow, itemAbove);

      // Selection changed, toggle action buttons
      toggleActionButtons();
    }
  }
}


/**
 * Move selected exercise item row one position down, unless it's the last one.
 */
export function moveDownExerciseItemRow() {
  const selected = getSelectedRowNumber();
  const selectedRow = selected ? getRow(selected) : null;

  if (selected && selectedRow) {
    // If there is an exercise item row selected and it's not the first
    // one, swap it with the one below it (if any)
    const tbody = document.querySelector('#exercises table tbody');
    const rows = getRows();

    if (rows.length && selected < rows.length) {
      // Reminder: selected is 1-index, rows is 0-index
      const itemBelow = rows[selected];

      // Swap row numbers
      replaceExerciseItemRowNumber(itemBelow, selected);
      replaceExerciseItemRowNumber(selectedRow, selected + 1);

      // Re-insert bottom item before the selected one
      tbody.insertBefore(itemBelow, selectedRow);

      // Selection changed, toggle action buttons
      toggleActionButtons();
    }
  }
}


/* FORM FIELD ERRORS */

/**
 * Show feedback if the date field's input is invalid.
 *
 * @param {HTMLInputElement} date - Date input element.
 */
export function showDateError(date) {
  const feedback = utils.getInvalidFeedbackElement(date);

  if (date.validity.valueMissing) {
    feedback.textContent =
      'Debe ingresar la fecha de la sesión de entrenamiento.';
  } else if (date.validity.patternMismatch) {
    feedback.textContent =
      'El texto ingresado no es una fecha válida (YYYY-MM-DD).';
  }
}


/**
 * Show feedback if the time field's input is invalid.
 *
 * @param {HTMLInputElement} time - Time input element.
 */
export function showTimeError(time) {
  const feedback = utils.getInvalidFeedbackElement(time);

  if (time.validity.valueMissing) {
    feedback.textContent =
      'Debe ingresar la hora de la sesión de entrenamiento.';
  } else if (time.validity.patternMismatch) {
    feedback.textContent = 'El texto ingresado no es una hora válida (HH:mm).';
  }
}


/**
 * Show feedback if the short title field's input is invalid.
 *
 * @param {HTMLInputElement} shortTitle - Short title input element.
 */
export function showShortTitleError(shortTitle) {
  const feedback = utils.getInvalidFeedbackElement(shortTitle);

  if (shortTitle.validity.tooLong) {
    feedback.textContent =
      'Demasiados caracteres (máximo ' + shortTitle.maxLength + ').';
  }
}


/**
 * Show feedback if the duration field's input is invalid.
 *
 * @param {HTMLInputElement} duration - Duration input element.
 */
export function showDurationError(duration) {
  const feedback = utils.getInvalidFeedbackElement(duration);

  if (duration.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (duration.validity.rangeUnderflow) {
    feedback.textContent = 'La duración no puede ser negativa.';
  } else if (duration.validity.stepMismatch) {
    feedback.textContent = 'Solo se permiten números enteros.';
  }
}


/**
 * Show feedback if the bodyweight field's input is invalid.
 *
 * @param {HTMLInputElement} bodyweight - Bodyweight input element.
 */
export function showBodyweightError(bodyweight) {
  const feedback = utils.getInvalidFeedbackElement(bodyweight);

  if (bodyweight.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (bodyweight.validity.rangeUnderflow) {
    feedback.textContent = 'El peso corporal no puede ser negativo.';
  } else if (bodyweight.validity.stepMismatch) {
    feedback.textContent = 'Solo se permiten números enteros.';
  }
}


/**
 * Show feedback if the comments field's input is invalid.
 *
 * @param {HTMLTextAreaElement} comments - Comments text area element.
 */
export function showCommentsError(comments) {
  const feedback = utils.getInvalidFeedbackElement(comments);

  if (comments.validity.tooLong) {
    feedback.textContent =
      'Demasiados caracteres (máximo ' + comments.maxLength + ').';
  }
}


/**
 * Show feedback if the exercise field's input is invalid.
 *
 * @param {HTMLInputElement} exercise - Exercise input element.
 */
function showExerciseError(exercise) {
  const feedback = utils.getInvalidFeedbackElement(exercise);

  if (exercise.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar el ejercicio realizado.';
  } else if (exercise.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + exercise.maxLength + ').';
  }
}


/**
 * Show feedback if the set type field's input is invalid.
 *
 * @param {HTMLSelectElement} setType - Set type select element.
 */
function showSetTypeError(setType) {
  const feedback = utils.getInvalidFeedbackElement(setType);

  if (setType.validity.valueMissing) {
    feedback.textContent =
        'Debe seleccionar si las series son de calentamiento o de trabajo.';
  }
}


/**
 * Show feedback if the weight field's input is invalid.
 *
 * @param {HTMLInputElement} weight - Weight input element.
 */
function showWeightError(weight) {
  const feedback = utils.getInvalidFeedbackElement(weight);

  if (weight.validity.badInput) {
    feedback.textContent = 'Solo se permiten números.';
  } else if (weight.validity.rangeUnderflow) {
    feedback.textContent = 'El peso no puede ser negativo.';
  } else if (weight.validity.stepMismatch) {
    feedback.textContent = 'Solo se permiten hasta dos decimales.';
  }
}


/**
 * Show feedback if the sets field's input is invalid.
 *
 * @param {HTMLInputElement} sets - Sets input element.
 */
function showSetsError(sets) {
  const feedback = utils.getInvalidFeedbackElement(sets);

  if (sets.validity.valueMissing) {
    feedback.textContent =
        'Debe ingresar el número de series (puede ser cero).';
  } else if (sets.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (sets.validity.rangeUnderflow) {
    feedback.textContent = 'El número de series no puede ser negativo.';
  } else if (sets.validity.stepMismatch) {
    feedback.textContent = 'Solo se permiten números enteros.';
  }
}


/**
 * Show feedback if the reps field's input is invalid.
 *
 * @param {HTMLInputElement} reps - Reps input element.
 */
function showRepsError(reps) {
  const feedback = utils.getInvalidFeedbackElement(reps);

  if (reps.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar el número de repeticiones.';
  } else if (reps.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (reps.validity.rangeUnderflow) {
    feedback.textContent = 'El número de repeticiones debe ser mayor a cero.';
  } else if (reps.validity.stepMismatch) {
    feedback.textContent = 'Solo se permiten números enteros.';
  }
}


/**
 * Show feedback if the exercise comments field's input is invalid.
 *
 * @param {HTMLTextAreaElement} comments - Exercise comments text area element.
 */
function showExerciseCommentsError(comments) {
  const feedback = utils.getInvalidFeedbackElement(comments);

  if (comments.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + comments.maxLength + ').';
  } else if (feedback.validity.patternMismatch) {
    feedback.textContent =
        'Solo se permiten caracteres alfanuméricos y los símbolos siguientes: '
        + '.+-\'';
  }
}


/* FORM DATA PROCESSING */

/**
 * Extract training session data from the form's fields and use it to
 * create a TrainingSession object.
 *
 * @returns {TrainingSession}
 * TrainingSession object created with the extracted data.
 */
export function extractTrainingSessionData() {
  // Basic data fields
  const date = document.querySelector('input[type="date"]#date');
  const time = document.querySelector('input[type="time"]#time');
  const shortTitle = document.querySelector('input[type="text"]#short-title');
  const duration = document.querySelector('input[type="number"]#duration');
  const bodyweight = document.querySelector('input[type="number"]#bodyweight');
  const comments = document.querySelector('textarea#comments');

  // Exercise items created from the table's data
  const exercises = extractExerciseItemsData();

  return new TrainingSession(
      date ? date.value : null,
      time ? time.value : null,
      exercises,
      shortTitle ? shortTitle.value : '',
      duration ? Number(duration.value) : null,
      bodyweight ? Number(bodyweight.value) : null,
      comments ? comments.value : ''
  );
}


/**
 * Extract data from the table's rows' form fields and use it to create
 * a list of ExerciseItem objects.
 *
 * @returns {ExerciseItem[]}
 * List of ExerciseItem objects created with the extracted data.
 */
function extractExerciseItemsData() {
  const exercises = [];
  const rows = getRows();

  if (rows) {
    for (const row of rows) {
      const data = extractExerciseItemRowData(row);
      const exercise = new ExerciseItem(
          data.exercise,
          data.setType,
          data.sets,
          data.reps,
          data.weight,
          data.comments
      );

      exercises.push(exercise);
    }
  }

  return exercises;
}


/* CREATE EDITABLE EXERCISE ITEM ROW ELEMENTS */

/**
 * Create a new editable exercise item table row and set the fields'
 * initial values based on the given data object, if given.
 *
 * @param {number} rowNumber - Row number of the new exercise item row.
 * @param {Object} [data]
 * Data object from which to get the values for the exercise item row's
 * fields.
 * @returns {HTMLTableRowElement} Editable exercise item table row.
 */
function createEditableExerciseItemRow(rowNumber, data = {}) {
  // Table row
  const tr = document.createElement('tr');
  tr.classList.add('exercise-item');
  tr.dataset.rowNumber = rowNumber;

  // Selection
  const selectionTd = createSelectionTd(rowNumber);

  // Exercise*
  const exerciseTd = createExerciseTd(rowNumber, data.exercise);

  // Set type*
  const setTypeTd = createSetTypeTd(rowNumber, data.setType);

  // Weight
  const weightTd = createWeightTd(rowNumber, data.weight);

  // Sets
  const setsTd = createSetsTd(rowNumber, data.sets);

  // Reps
  const repsTd = document.createElement('td');
  repsTd.dataset.column = 'reps';

  if (data.sets && Number.isInteger(Number(data.sets))) {
    for (let i = 0; i < data.sets; i++) {
      const setNumber = i + 1;
      const reps = data.reps[i];
      const repsDiv = createRepsDiv(rowNumber, setNumber, reps);
      repsTd.appendChild(repsDiv);
    }
  }

  // Comments
  const commentsTd = createCommentsTd(rowNumber, data.comments);

  // Add table cells to row
  tr.appendChild(selectionTd);
  tr.appendChild(exerciseTd);
  tr.appendChild(setTypeTd);
  tr.appendChild(weightTd);
  tr.appendChild(setsTd);
  tr.appendChild(repsTd);
  tr.appendChild(commentsTd);

  return tr;
}


/**
 * Create radio selection table cell with the given row number.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this table cell will belong.
 * @returns {HTMLTableCellElement}
 * Table cell containing the radio selection input.
 */
function createSelectionTd(rowNumber) {
  // Table cell
  const selectionTd = document.createElement('td');
  selectionTd.dataset.column = 'selection';

  // Selection radio input
  const selection = document.createElement('input');
  selection.classList.add('form-check-input');
  selection.type = 'radio';
  selection.name = 'selection';
  selection.id = selection.name + '-' + rowNumber;
  selection.dataset.rowNumber = rowNumber;
  selection.ariaLabel = 'Seleccionar ítem ' + rowNumber;

  // Add event listener
  selection.addEventListener('click', function (event) {
    toggleActionButtons();
  });

  // Add to table cell
  selectionTd.appendChild(selection);

  return selectionTd;
}


/**
 * Create exercise field table cell with the given row number and
 * optional value.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this table cell will belong.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLTableCellElement}
 * Table cell containing the exercise field and its label.
 */
function createExerciseTd(rowNumber, value) {
  // Table cell
  const exerciseTd = document.createElement('td');
  exerciseTd.classList.add('form-floating');
  exerciseTd.dataset.column = 'exercise';

  // Exercise input
  const exercise = document.createElement('input');
  exercise.classList.add('form-control', 'form-control-sm');
  exercise.type = 'text';
  exercise.name = 'exercise-' + rowNumber;
  exercise.id = exercise.name;
  exercise.dataset.rowNumber = rowNumber;
  exercise.maxLength = 50;
  exercise.placeholder = ' ';
  exercise.required = true;

  if (value) {
    // If given, set initial value
    exercise.value = value;
  }

  // Add event listeners
  exercise.addEventListener('invalid', function (event) {
    showExerciseError(exercise);
  });

  exercise.addEventListener('input', function (event) {
    if (exercise.validity.valid) {
      utils.getInvalidFeedbackElement(exercise).textContent = '';
    } else {
      showExerciseError(exercise);
    }
  });

  // Label
  const exerciseLabel = document.createElement('label');
  exerciseLabel.classList.add('form-label', 'small');
  exerciseLabel.htmlFor = exercise.id;
  exerciseLabel.textContent = 'Ejercicio';

  // Add to table cell
  exerciseTd.appendChild(exercise);
  exerciseTd.appendChild(exerciseLabel);
  exerciseTd.appendChild(utils.createInvalidFeedbackElement());

  return exerciseTd;
}


/**
 * Create set type field table cell with the given row number and
 * optional value.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this table cell will belong.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLTableCellElement}
 * Table cell containing the set type select field and its label.
 */
function createSetTypeTd(rowNumber, value) {
  // Table cell
  const setTypeTd = document.createElement('td');
  setTypeTd.classList.add('form-floating');
  setTypeTd.dataset.column = 'setType';

  // Set type select
  const setType = document.createElement('select');
  setType.classList.add('form-select');
  setType.name = 'set-type-' + rowNumber;
  setType.id = setType.name;
  setType.dataset.rowNumber = rowNumber;
  setType.required = true;

  // Options
  const warmupOption = document.createElement('option');
  warmupOption.value = 'warmup';
  warmupOption.textContent = 'Calentamiento';

  const workOption = document.createElement('option');
  workOption.value = 'work';
  workOption.textContent = 'Trabajo';

  if (value) {
    // Set initial value if given and valid
    if (value === SetType.WarmUp) {
      warmupOption.selected = true;
    } else if (value === SetType.Work) {
      workOption.selected = true;
    }
  }

  setType.appendChild(workOption);
  setType.appendChild(warmupOption);

  // Add event listeners
  setType.addEventListener('invalid', function (event) {
    showSetTypeError(setType);
  });

  setType.addEventListener('input', function (event) {
    if (setType.validity.valid) {
      utils.getInvalidFeedbackElement(setType).textContent = '';
    } else {
      showSetTypeError(setType);
    }
  });

  // Label
  const setTypeLabel = document.createElement('label');
  setTypeLabel.classList.add('form-label', 'small');
  setTypeLabel.htmlFor = setType.id;
  setTypeLabel.textContent = 'Modalidad';

  // Add to table cell
  setTypeTd.appendChild(setType);
  setTypeTd.appendChild(setTypeLabel);
  setTypeTd.appendChild(utils.createInvalidFeedbackElement());

  return setTypeTd;
}


/**
 * Create weight field table cell with the given row number and
 * optional value.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this table cell will belong.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLTableCellElement}
 * Table cell containing the weight field and its label.
 */
function createWeightTd(rowNumber, value) {
  // Table cell
  const weightTd = document.createElement('td');
  weightTd.classList.add('form-floating');
  weightTd.dataset.column = 'weight';

  // Weight input
  const weight = document.createElement('input');
  weight.classList.add('form-control', 'form-control-sm');
  weight.type = 'number';
  weight.name = 'weight-' + rowNumber;
  weight.id = weight.name;
  weight.dataset.rowNumber = rowNumber;
  weight.min = 0;
  weight.step = 0.01;
  weight.placeholder = 0;

  if (value !== null || value !== undefined) {
    // Set value if it's not null or undefined (explicit check to allow zero)
    weight.value = value;
  }

  // Add event listeners
  weight.addEventListener('invalid', function (event) {
    showWeightError(weight);
  });

  weight.addEventListener('input', function (event) {
    if (weight.validity.valid) {
      utils.getInvalidFeedbackElement(weight).textContent = '';
    } else {
      showWeightError(weight);
    }
  });

  // Label
  const weightLabel = document.createElement('label');
  weightLabel.classList.add('form-label', 'small');
  weightLabel.htmlFor = weight.id;
  weightLabel.textContent = 'Peso (kg)';

  // Add to table cell
  weightTd.appendChild(weight);
  weightTd.appendChild(weightLabel);
  weightTd.appendChild(utils.createInvalidFeedbackElement());

  return weightTd;
}


/**
 * Create sets field table cell with the given row number and
 * optional value.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this table cell will belong.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLTableCellElement}
 * Table cell containing the sets field and its label.
 */
function createSetsTd(rowNumber, value) {
  // Table cell
  const setsTd = document.createElement('td');
  setsTd.classList.add('form-floating');
  setsTd.dataset.column = 'sets';

  // Sets input
  const sets = document.createElement('input');
  sets.classList.add('form-control', 'form-control-sm');
  sets.type = 'number';
  sets.name = 'sets-' + rowNumber;
  sets.id = sets.name;
  sets.dataset.rowNumber = rowNumber;
  sets.min = 0;
  sets.step = 1;
  sets.required = true;
  sets.placeholder = 0;

  if (value !== null || value !== undefined) {
    // Set value if it's not null or undefined (explicit check to allow zero)
    sets.value = value;
  }

  // Add event listeners
  sets.addEventListener('invalid', function (event) {
    showSetsError(sets);
  });

  sets.addEventListener('input', function (event) {
    if (sets.validity.valid) {
      // Temporarily disable field to avoid race condition
      sets.disabled = true;

      utils.getInvalidFeedbackElement(sets).textContent = '';

      const currentRowNumber = Number(sets.dataset.rowNumber);
      const setsCount = Number(sets.value);

      // Update reps td accordingly and then enable field again
      updateRepsTd(currentRowNumber, setsCount).then(() => {
        sets.disabled = false;
      });
    } else {
      showSetsError(sets);
    }
  });

  // Label
  const setsLabel = document.createElement('label');
  setsLabel.classList.add('form-label', 'small');
  setsLabel.htmlFor = sets.id;
  setsLabel.textContent = 'Series';

  // Add to table cell
  setsTd.appendChild(sets);
  setsTd.appendChild(setsLabel);
  setsTd.appendChild(utils.createInvalidFeedbackElement());

  return setsTd;
}


/**
 * Create reps div with the given row number, set number, and
 * optional value.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this div will belong.
 * @param {number} setNumber
 * The field will hold the number of reps done for the set number
 * indicated by this parameter.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement}
 * Div containing the reps field and its label.
 */
function createRepsDiv(rowNumber, setNumber, value) {
  // Div container
  const repsDiv = document.createElement('div');
  repsDiv.classList.add('reps-item', 'form-floating', 'mb-2');

  // Reps input
  const reps = document.createElement('input');
  reps.classList.add('form-control', 'form-control-sm');
  reps.type = 'number';
  reps.name = 'reps-' + rowNumber + '-' + setNumber;
  reps.id = reps.name;
  reps.dataset.rowNumber = rowNumber;
  reps.dataset.setNumber = setNumber;
  reps.min = 1;
  reps.step = 1;
  reps.placeholder = 1;
  reps.required = true;

  if (value !== null || value !== undefined) {
    // Set value if it's not null or undefined (explicit check to allow zero)
    reps.value = value;
  }

  // Add event listeners
  reps.addEventListener('invalid', function (event) {
    showRepsError(reps);
  });

  reps.addEventListener('input', function (event) {
    if (reps.validity.valid) {
      utils.getInvalidFeedbackElement(reps).textContent = '';
    } else {
      showRepsError(reps);
    }
  });

  // Reps label
  const repsLabel = document.createElement('label');
  repsLabel.classList.add('form-label', 'small');
  repsLabel.htmlFor = reps.id;
  repsLabel.textContent = 'Serie ' + setNumber;

  // Add to div
  repsDiv.appendChild(reps);
  repsDiv.appendChild(repsLabel);
  repsDiv.appendChild(utils.createInvalidFeedbackElement());

  return repsDiv;
}


/**
 * Create comments field table cell with the given row number and
 * optional value.
 *
 * @param {number} rowNumber
 * Row number of the exercise item row to which this table cell will belong.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLTableCellElement}
 * Table cell containing the comments field and its label.
 */
function createCommentsTd(rowNumber, value) {
  // Table cell
  const commentsTd = document.createElement('td');
  commentsTd.classList.add('form-floating');
  commentsTd.dataset.column = 'comments';

  // Comments text area
  const comments = document.createElement('textarea');
  comments.classList.add('form-control', 'form-control-sm');
  comments.name = 'comments-' + rowNumber;
  comments.id = comments.name;
  comments.dataset.rowNumber = rowNumber;
  comments.pattern = '[0-9A-Za-z &\'\\-\\+\\.]*';
  comments.maxLength = 140;
  comments.cols = 20;
  comments.rows = 5;
  comments.placeholder = '...';

  if (value) {
    // If given, set value
    comments.value = value;
  }

  // Add event listeners
  comments.addEventListener('invalid', function (event) {
    showExerciseCommentsError(comments);
  });

  comments.addEventListener('input', function (event) {
    if (comments.validity.valid) {
      utils.getInvalidFeedbackElement(comments).textContent = '';
    } else {
      showExerciseCommentsError(comments);
    }
  });

  // Label
  const commentsLabel = document.createElement('label');
  commentsLabel.classList.add('form-label', 'small');
  commentsLabel.htmlFor = comments.id;
  commentsLabel.textContent = 'Comentarios';

  // Add to table cell
  commentsTd.appendChild(comments);
  commentsTd.appendChild(commentsLabel);
  commentsTd.appendChild(utils.createInvalidFeedbackElement());

  return commentsTd;
}


/* MANIPULATE EXERCISE ITEM ROW ELEMENTS */

/**
 * Replace the row number in all components of the given exercise item row.
 *
 * @param {HTMLTableRowElement} row
 * Exercise item row which will have its row number replaced.
 * @param {number} newRowNumber - New row number.
 */
function replaceExerciseItemRowNumber(row, newRowNumber) {
  // Set row number for the row itself
  row.dataset.rowNumber = newRowNumber;

  // Selection
  const selection = row.querySelector('input[type="radio"][name="selection"]');
  selection.id = selection.name + '-' + newRowNumber;
  selection.dataset.rowNumber = newRowNumber;
  selection.ariaLabel = 'Seleccionar ítem ' + newRowNumber;

  // Exercise
  const exercise = row.querySelector('input[type="text"][id^="exercise-"]');
  exercise.name = 'exercise-' + newRowNumber;
  exercise.id = exercise.name;
  exercise.dataset.rowNumber = newRowNumber;

  // Set type
  const setType = row.querySelector('select[id^="set-type-"]');
  setType.name = 'set-type-' + newRowNumber;
  setType.id = setType.name;
  setType.dataset.rowNumber = newRowNumber;

  // Weight
  const weight = row.querySelector('input[type="number"][id^="weight-"]');
  weight.name = 'weight-' + newRowNumber;
  weight.id = weight.name;
  weight.dataset.rowNumber = newRowNumber;

  // Sets
  const sets = row.querySelector('input[type="number"][id^="sets-"]');
  sets.name = 'sets-' + newRowNumber;
  sets.id = sets.name;
  sets.dataset.rowNumber = newRowNumber;

  // Reps
  const repsRegexp = /reps-\d+-(\d+)/;
  const repsRegexpReplacement = 'reps-' + newRowNumber + '-$1'

  const repsLabels = row.querySelectorAll('label[for^="reps-"]');
  if (repsLabels) {
    for (const repsLabel of repsLabels) {
      repsLabel.htmlFor =
          repsLabel.htmlFor.replace(repsRegexp, repsRegexpReplacement);
    }
  }

  const reps = row.querySelectorAll('input[type="number"][id^="reps-"]');
  if (reps) {
    for (const repsItem of reps) {
      repsItem.name = repsItem.name.replace(repsRegexp, repsRegexpReplacement);
      repsItem.id = repsItem.name;
      repsItem.dataset.rowNumber = newRowNumber;
    }
  }

  // Comments
  const comments = row.querySelector('textarea[id^="comments-"]');
  comments.name = 'comments-' + newRowNumber;
  comments.id = comments.name;
  comments.dataset.rowNumber = newRowNumber;
}


/**
 * Create data object with the given exercise item row's data, valid or not.
 *
 * @param {HTMLTableRowElement} row
 * Exercise item row from which the data will be extracted.
 * @returns {{
 *   exercise: string,
 *   setType: SetType,
 *   weight: ?number,
 *   sets: number,
 *   reps: number[],
 *   comments: string,
 * }}
 * Data object with values extracted from the exercise item row's form fields.
 */
function extractExerciseItemRowData(row) {
  const data = {};

  const exercise = row.querySelector('input[type="text"][id^="exercise-"]');
  data.exercise = exercise ? exercise.value : '';

  const setType = row.querySelector('select[id^="set-type-"]');
  data.setType = setType ? SetType.enumValueOf(setType.value) : SetType.Work;

  const weight = row.querySelector('input[type="number"][id^="weight-"]');
  data.weight = (weight && weight.value) ? Number(weight.value) : null;

  const sets = row.querySelector('input[type="number"][id^="sets-"]');
  data.sets = sets ? Number(sets.value) : 0;

  const reps = row.querySelectorAll('input[type="number"][id^="reps-"]');
  data.reps = [];
  if (reps) {
    for (let i = 0; i < data.sets; i++) {
      data.reps.push(reps[i] ? Number(reps[i].value) : 0);
    }
  }

  const comments = row.querySelector('textarea[id^="comments-"]');
  data.comments = comments.value;

  return data;
}


/**
 * Create or remove reps divs to match the requested number of sets.
 *
 * @param {number} rowNumber - Row number of the reps table cell to update.
 * @param {number} setsCount - Number of sets requested.
 */
async function updateRepsTd(rowNumber, setsCount) {
  const row = getRow(rowNumber);
  const repsTd = row ? row.querySelector('td[data-column="reps"]') : null;

  if (repsTd && Number.isInteger(setsCount) && setsCount >= 0) {
    // The reps table cell exists and setsCount is a positive integer,
    // get all reps items currently in the table cell and count them
    const repsDivs = repsTd ? repsTd.querySelectorAll('div.reps-item') : [];
    const repsDivsCount = Number(repsDivs.length);

    if (setsCount > repsDivsCount) {
      // If the number of sets is greater than the current number of
      // reps divs, create as many new ones as needed to reach the
      // required number, and append them to the td element
      for (let set = repsDivsCount + 1; set <= setsCount; set++) {
        const newRepsDiv = createRepsDiv(rowNumber, set);
        repsTd.appendChild(newRepsDiv);
      }
    } else if (setsCount < repsDivsCount) {
      // If the number of sets is lower than the current number of reps
      // divs, delete existing ones from the end of the td until their
      // number is reduced to the required number
      for (let set = repsDivsCount; set > setsCount; set--) {
        // Reminder: set number is 1-index, repsDivs is 0-index
        repsDivs[set - 1].remove();
      }
    }
  }
}
