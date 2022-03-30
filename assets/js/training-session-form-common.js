import * as utils from '/assets/js/utils.js';


/* CONSTRUCT FORM PAGE */


export function constructTrainingSessionForm(
  mainTitleText, formId, formLabel, submitButtonText, session = {}
) {
  /* Construct create/edit form page with the given main title text,
  form ID, form label, submit button text, and optional training session
  data to populate the fields. */

  let mainContainer = document.querySelector('main > .container');

  // Main title
  let mainTitle = mainContainer.querySelector('h1#main-title');
  mainTitle.textContent = mainTitleText;

  // Remove #empty-text element
  let emptyText = mainContainer.querySelector('p#empty-text');
  mainContainer.removeChild(emptyText);

  // Form
  let form = document.createElement('form');
  form.id = formId;
  form.ariaLabel = formLabel;
  form.noValidate = true;

  // Basic data
  let basicDataSection = document.createElement('section');
  basicDataSection.id = 'basic-data';

  let basicDataTitle = document.createElement('h2');
  basicDataTitle.textContent = 'Datos generales';

  let basicDataRequired = document.createElement('p');
  basicDataRequired.appendChild(
      document.createTextNode('Los campos requeridos son indicados por '));

  let requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.textContent = '*';
  requiredAsterisk.title = 'requerido';

  basicDataRequired.appendChild(requiredAsterisk);
  basicDataRequired.appendChild(document.createTextNode('.'));

  let basicDataFormFields = createBasicDataFormFields(
    session.date,
    session.time,
    session.shortTitle,
    session.duration,
    session.bodyweight,
    session.comments
  );

  basicDataSection.appendChild(basicDataTitle);
  basicDataSection.appendChild(basicDataRequired);
  basicDataSection.appendChild(basicDataFormFields);

  // Exercises
  let exercisesSection = document.createElement('section');
  exercisesSection.id = 'exercises';

  let exercisesTitle = document.createElement('h2');
  exercisesTitle.textContent = 'Ejercicios';

  let exercisesRequired = basicDataRequired.cloneNode(true);

  let actionButtons = createActionButtons();

  let exercisesDiv = document.createElement('div');
  exercisesDiv.classList.add('exercises');

  let exercisesTable = createExercisesTable(session.exercises);
  exercisesDiv.appendChild(exercisesTable);

  exercisesSection.appendChild(exercisesTitle);
  exercisesSection.appendChild(exercisesRequired);
  exercisesSection.appendChild(actionButtons);
  exercisesSection.appendChild(exercisesDiv);

  // Form buttons
  let formButtonsSection = document.createElement('section');
  formButtonsSection.id = 'form-buttons';

  let submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = submitButtonText;

  formButtonsSection.appendChild(submitButton);

  // Put everything together
  form.appendChild(basicDataSection);
  form.appendChild(exercisesSection);
  form.appendChild(formButtonsSection);

  mainContainer.appendChild(form);

  // Toggle action buttons
  toggleActionButtons();
}


function createBasicDataFormFields(
  date, time, shortTitle, duration, bodyweight, comments
) {
  /* Create basic data form fields with the data of the given session. */

  let container = document.createElement('div');
  container.id = "basic-data-fields";

  container.appendChild(createDateDiv(date));
  container.appendChild(createTimeDiv(time));
  container.appendChild(createShortTitleDiv(shortTitle));
  container.appendChild(createDurationDiv(duration));
  container.appendChild(createBodyweightDiv(bodyweight));
  container.appendChild(createGeneralCommentsDiv(comments));

  return container;
}


function createActionButtons() {
  /* Create action buttons for manipulating exercise items. */

  let container = document.createElement('div');
  container.id = 'action-buttons';
  container.ariaLabel = 'Acciones';
  container.setAttribute('role', 'toolbar');

  // Add
  let addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.id = 'add-btn';
  addButton.textContent = 'Agregar ejercicio';

  addButton.addEventListener('click', function (event) {
    addExercise();
  });

  // Remove
  let removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.id = 'remove-btn';
  removeButton.textContent = 'Eliminar seleccionado';

  removeButton.addEventListener('click', function (event) {
    removeExercise();
  });

  // Duplicate
  let duplicateButton = document.createElement('button');
  duplicateButton.type = 'button';
  duplicateButton.id = 'duplicate-btn';
  duplicateButton.textContent = 'Duplicar seleccionado';

  duplicateButton.addEventListener('click', function (event) {
    duplicateExercise();
  });

  // Move up
  let moveUpButton = document.createElement('button');
  moveUpButton.type = 'button';
  moveUpButton.id = 'move-up-btn';
  moveUpButton.textContent = 'Subir seleccionado';

  moveUpButton.addEventListener('click', function (event) {
    moveUpExercise();
  });

  // Move down
  let moveDownButton = document.createElement('button');
  moveDownButton.type = 'button';
  moveDownButton.id = 'move-down-btn';
  moveDownButton.textContent = 'Bajar seleccionado';

  moveDownButton.addEventListener('click', function (event) {
    moveDownExercise();
  });

  // Add to div
  container.appendChild(addButton);
  container.appendChild(removeButton);
  container.appendChild(duplicateButton);
  container.appendChild(moveUpButton);
  container.appendChild(moveDownButton);

  return container;
}


function createExercisesTable(exercises) {
  /* Create table with the given editable exercise items. */

  let table = document.createElement('table');

  // Table head
  let thead = document.createElement('thead');
  let headers = [
    {id: 'selection-th', text: '', required: false},
    {id: 'exercise-th', text: 'Ejercicio', required: true},
    {id: 'set-type-th', text: 'Modalidad', required: true},
    {id: 'weight-th', text: 'Peso (kg)', required: false},
    {id: 'sets-th', text: 'Series', required: true},
    {id: 'reps-th', text: 'Repeticiones', required: false},
    {id: 'comments-th', text: 'Comentarios', required: false},
  ];

  for (let header of headers) {
    let th = document.createElement('th');
    th.id = header.id;
    th.appendChild(document.createTextNode(header.text));

    if (header.required) {
      let requiredAsterisk = document.createElement('abbr');
      requiredAsterisk.textContent = '*';
      requiredAsterisk.title = 'requerido';
      requiredAsterisk.ariaLabel = 'requerido';

      th.appendChild(requiredAsterisk);
    }

    thead.appendChild(th);
  }

  // Table body
  let tbody = document.createElement('tbody');

  if (exercises && exercises.length) {
    for (let i in exercises) {
      // For each exercise data object, create a new exercise item row
      // and append it to the table body
      let indexNumber = Number(i);
      let rowNumber = indexNumber + 1;
      let data = exercises[indexNumber];
      let row = createEditableExerciseItemRow(rowNumber, data);
      tbody.appendChild(row);
    }
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}


function createDateDiv(value = null) {
  /* Create date field div element with the given value, if any. */

  let dateDiv = document.createElement('div');

  // Label
  let dateLabel = document.createElement('label');
  dateLabel.htmlFor = 'date';

  dateLabel.appendChild(document.createTextNode('Fecha:'));

  let requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.textContent = '*';
  requiredAsterisk.title = 'requerido';
  requiredAsterisk.ariaLabel = 'requerido';

  dateLabel.appendChild(requiredAsterisk);
  dateLabel.appendChild(document.createTextNode(' '));

  // Input
  let date = document.createElement('input');
  date.type = "date";
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


function createTimeDiv(value = null) {
  /* Create time field div element with the given value, if any. */

  let timeDiv = document.createElement('div');

  // Label
  let timeLabel = document.createElement('label');
  timeLabel.htmlFor = 'time';

  timeLabel.appendChild(document.createTextNode('Hora:'));

  let requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.textContent = '*';
  requiredAsterisk.title = 'requerido';
  requiredAsterisk.ariaLabel = 'requerido';

  timeLabel.appendChild(requiredAsterisk);
  timeLabel.appendChild(document.createTextNode(' '));

  // Input
  let time = document.createElement('input');
  time.type = "time";
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


function createShortTitleDiv(value = null) {
  /* Create short title field div element with the given value, if any. */

  let shortTitleDiv = document.createElement('div');

  // Label
  let shortTitleLabel = document.createElement('label');
  shortTitleLabel.htmlFor = 'short-title';
  shortTitleLabel.textContent = 'Título breve: ';

  // Input
  let shortTitle = document.createElement('input');
  shortTitle.type = "text";
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


function createDurationDiv(value = null) {
  /* Create duration field div element with the given value, if any. */

  let durationDiv = document.createElement('div');

  // Label
  let durationLabel = document.createElement('label');
  durationLabel.htmlFor = 'duration';
  durationLabel.textContent = 'Duración de la sesión (minutos): ';

  // Input
  let duration = document.createElement('input');
  duration.type = "number";
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


function createBodyweightDiv(value = null) {
  /* Create bodyweight field div element with the given value, if any. */

  let bodyweightDiv = document.createElement('div');

  // Label
  let bodyweightLabel = document.createElement('label');
  bodyweightLabel.htmlFor = 'bodyweight';
  bodyweightLabel.textContent = 'Peso corporal (kilogramos): ';

  // Input
  let bodyweight = document.createElement('input');
  bodyweight.type = "number";
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


function createGeneralCommentsDiv(value = null) {
  /* Create general comments field div element with the given value, if any. */

  let commentsDiv = document.createElement('div');

  // Label
  let commentsLabel = document.createElement('label');
  commentsLabel.htmlFor = 'comments';
  commentsLabel.textContent = 'Comentarios: ';

  // Input
  let comments = document.createElement('textarea');
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

function getSelectedRowNumber() {
  /* Get the currently selected row number if any, or return null. */

  let selected = document.querySelector(
      '.exercises input[type="radio"][name="selection"]:checked');

  let rowNumber = selected ? Number(selected.dataset.rowNumber) : null;

  return Number.isInteger(rowNumber) ? rowNumber : null;
}


export function getRows() {
  /* Get all exercise item rows. */

  return document.querySelectorAll('.exercises table tbody > tr.exercise-item');
}


export function getRow(rowNumber) {
  /* Get the exercise item row with the given row number. */

  return document.querySelector(
      '.exercises table tbody > tr.exercise-item[data-row-number="'
      + rowNumber + '"]'
  );
}


/* ACTION BUTTON FUNCTIONS */

export function toggleActionButtons() {
  /* Enable/disable action buttons based on the currently selected row
  number, if any. */

  let selected = getSelectedRowNumber();
  let rowCount = getRows().length;

  // Add button not here because it is always enabled
  let removeButton = document.querySelector('button#remove-btn');
  let duplicateButton = document.querySelector('button#duplicate-btn');
  let moveUpButton = document.querySelector('button#move-up-btn');
  let moveDownButton = document.querySelector('button#move-down-btn');

  if (Number.isInteger(selected)) {
    // If an item is selected, enable duplicate button
    duplicateButton.disabled = false;

    // Disable remove button if there is only one item (or less, which
    // is impossible)
    removeButton.disabled = rowCount <= 1;

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


export function addExercise() {
  /* Add an empty exercise item after the currently selected item. */

  let tbody = document.querySelector('.exercises table tbody');
  let rows = getRows();

  let selected = getSelectedRowNumber();

  let newRowNumber = selected ? selected + 1 : rows.length + 1;
  let newExerciseItem = createEditableExerciseItemRow(newRowNumber);

  if (!rows.length || !selected || selected === rows.length) {
    // If the there are no rows, or no row is selected, or the last row
    // is selected, append the new item to the end of the table
    tbody.appendChild(newExerciseItem);
  } else {
    // Otherwise, all rows after the selected one must have
    // their row number increased by one
    for (let row of rows) {
      let rowNumber = Number(row.dataset.rowNumber);
      if (rowNumber > selected) {
        replaceExerciseItemRowNumber(row, rowNumber + 1);
      }
    }

    // Finally, insert new row before the one following the selected one
    // Reminder: selected is 1-index, rows is 0-index
    tbody.insertBefore(newExerciseItem, rows[selected]);
  }

  // Row count changed, toggle action buttons
  toggleActionButtons();
}


export function removeExercise() {
  /* Remove selected exercise item, if any and unless it's the only
  exercise item in the table. */

  let selected = getSelectedRowNumber();

  if (selected) {
    // If there is an exercise item selected, look for it, remove it,
    // and reduce by one the row number of all subsequent rows (if any)
    let rows = getRows();

    if (rows.length && rows.length > 1) {
      for (let row of rows) {
        let rowNumber = Number(row.dataset.rowNumber);
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


export function duplicateExercise() {
  /* Duplicate selected exercise item, if any. */

  let selected = getSelectedRowNumber();
  let selectedItem = selected ? getRow(selected) : null;

  if (selected && selectedItem) {
    // If there is an exercise item selected, extract its data, create
    // a new exercise item with the same data, and place it below the
    // selected item
    let data = extractExerciseItemData(selectedItem);
    let newRowNumber = selected + 1;
    let newExerciseItem = createEditableExerciseItemRow(newRowNumber, data);

    let tbody = document.querySelector('.exercises table tbody');
    let rows = getRows();

    if (!rows.length || selected === rows.length) {
      // If the there are no rows (impossible) or the last row is
      // selected, append the new item to the end of the table
      tbody.appendChild(newExerciseItem);
    } else {
      // Otherwise, all rows after the selected one must have
      // their row number increased by one
      for (let row of rows) {
        let rowNumber = Number(row.dataset.rowNumber);
        if (rowNumber > selected) {
          replaceExerciseItemRowNumber(row, rowNumber + 1);
        }
      }

      // Finally, insert new row before the one following the selected one
      // Reminder: selected is 1-index, rows is 0-index
      tbody.insertBefore(newExerciseItem, rows[selected]);
    }

    // Row count changed, toggle action buttons
    toggleActionButtons();
  }
}


export function moveUpExercise() {
  /* Move selected exercise item (if any) one position up, unless it's
  the first item. */

  let selected = getSelectedRowNumber();
  let selectedItem = selected ? getRow(selected) : null;

  if (selected && selected > 1 && selectedItem) {
    // If there is an exercise item selected and it's not the first one,
    // swap it with the one above it
    let tbody = document.querySelector('.exercises table tbody');
    let rows = getRows();

    if (rows.length && rows.length >= selected) {
      // Reminder: selected is 1-index, rows is 0-index
      let itemAbove = rows[selected - 2];

      // Swap row numbers
      replaceExerciseItemRowNumber(selectedItem, selected - 1);
      replaceExerciseItemRowNumber(itemAbove, selected);

      // Re-insert selected item before the one above it
      tbody.insertBefore(selectedItem, itemAbove);

      // Selection changed, toggle action buttons
      toggleActionButtons();
    }
  }
}


export function moveDownExercise() {
  /* Move selected exercise item (if any) one position down, unless it's
  the last item. */

  let selected = getSelectedRowNumber();
  let selectedItem = selected ? getRow(selected) : null;

  if (selected && selectedItem) {
    // If there is an exercise item selected and it's not the first one,
    // swap it with the one below it (if any)
    let tbody = document.querySelector('.exercises table tbody');
    let rows = getRows();

    if (rows.length && selected < rows.length) {
      // Reminder: selected is 1-index, rows is 0-index
      let itemBelow = rows[selected];

      // Swap row numbers
      replaceExerciseItemRowNumber(itemBelow, selected);
      replaceExerciseItemRowNumber(selectedItem, selected + 1);

      // Re-insert bottom item before the selected one
      tbody.insertBefore(itemBelow, selectedItem);

      // Selection changed, toggle action buttons
      toggleActionButtons();
    }
  }
}


/* FORM FIELD ERRORS */

export function showDateError(date) {
  /* Show feedback if the date field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(date);

  if (date.validity.valueMissing) {
    feedback.textContent =
      'Debe ingresar la fecha de la sesión de entrenamiento.';
  } else if (date.validity.patternMismatch) {
    feedback.textContent =
      'El texto ingresado no es una fecha válida (YYYY-MM-DD).';
  }
}


export function showTimeError(time) {
  /* Show feedback if the time field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(time);

  if (time.validity.valueMissing) {
    feedback.textContent =
      'Debe ingresar la hora de la sesión de entrenamiento.';
  } else if (time.validity.patternMismatch) {
    feedback.textContent = 'El texto ingresado no es una hora válida (HH:mm).';
  }
}


export function showShortTitleError(shortTitle) {
  /* Show feedback if the short title field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(shortTitle);

  if (shortTitle.validity.tooLong) {
    feedback.textContent =
      'Demasiados caracteres (máximo ' + shortTitle.maxLength + ').';
  }
}


export function showDurationError(duration) {
  /* Show feedback if the duration field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(duration);

  if (duration.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (duration.validity.rangeUnderflow) {
    feedback.textContent = 'La duración no puede ser negativa.';
  }
}


export function showBodyweightError(bodyweight) {
  /* Show feedback if the bodyweight field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(bodyweight);

  if (bodyweight.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (bodyweight.validity.rangeUnderflow) {
    feedback.textContent = 'El peso corporal no puede ser negativo.';
  }
}


export function showCommentsError(comments) {
  /* Show feedback if the comments field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(comments);

  if (comments.validity.tooLong) {
    feedback.textContent =
      'Demasiados caracteres (máximo ' + comments.maxLength + ').';
  }
}


function showExerciseError(exercise) {
  /* Show feedback if the exercise field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(exercise);

  if (exercise.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar el ejercicio realizado.';
  } else if (exercise.validity.tooLong) {
    feedback.textContent =
        'Demasiados caracteres (máximo ' + exercise.maxLength + ').';
  }
}


function showSetTypeError(setType) {
  /* Show feedback if the set type field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(setType);

  if (setType.validity.valueMissing) {
    feedback.textContent =
        'Debe seleccionar si las series son de calentamiento o de trabajo.';
  }
}


function showWeightError(weight) {
  /* Show feedback if the weight field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(weight);

  if (weight.validity.badInput) {
    feedback.textContent = 'Solo se permiten números.';
  } else if (weight.validity.rangeUnderflow) {
    feedback.textContent = 'El peso no puede ser negativo.';
  } else if (weight.validity.stepMismatch) {
    feedback.textContent = 'Solo se permiten hasta dos decimales.';
  }
}


function showSetsError(sets) {
  /* Show feedback if the sets field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(sets);

  if (sets.validity.valueMissing) {
    feedback.textContent =
        'Debe ingresar el número de series (puede ser cero).';
  } else if (sets.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (sets.validity.rangeUnderflow) {
    feedback.textContent = 'El número de series no puede ser negativo.';
  }
}


function showRepsError(reps) {
  /* Show feedback if the reps field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(reps);

  if (reps.validity.valueMissing) {
    feedback.textContent = 'Debe ingresar el número de repeticiones.';
  } else if (reps.validity.badInput) {
    feedback.textContent = 'Solo se permiten números enteros.';
  } else if (reps.validity.rangeUnderflow) {
    feedback.textContent = 'El número de repeticiones debe ser mayor a cero.';
  }
}


function showExerciseCommentsError(comments) {
  /* Show feedback if the exercise comments field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(comments);

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

export function extractFormData(form) {
  /* Extract training session data from the given form element. */

  let data = {}

  // Basic data fields
  let date = form.querySelector('input[type="date"]#date');
  data.date = date ? date.value : null;

  let time = form.querySelector('input[type="time"]#time');
  data.time = time ? time.value : null;

  let shortTitle = form.querySelector('input[type="text"]#short-title');
  data.shortTitle = shortTitle ? shortTitle.value : null;

  let duration = form.querySelector('input[type="number"]#duration');
  data.duration = duration ? duration.value : null;

  let bodyweight = form.querySelector('input[type="number"]#bodyweight');
  data.bodyweight = bodyweight ? bodyweight.value : null;

  let comments = form.querySelector('textarea#comments');
  data.comments = comments ? comments.value : null;

  // Exercises' data
  data.exercises = extractExercisesData();

  return data;
}


function extractExercisesData() {
  /* Return a list of exercise objects created with the corresponding
  form fields' data. */

  let exercises = [];

  let rows = getRows();
  if (rows) {
    for (let row of rows) {
      let data = extractExerciseItemData(row);
      let exercise = utils.createTrainingSessionExerciseItem(data);

      if (exercise) {
        exercises.push(exercise);
      }
    }
  }

  return exercises;
}


/* CREATE EDITABLE EXERCISE ITEM ROW ELEMENTS */

export function createEditableExerciseItemRow(rowNumber, data) {
  /* Create a new editable exercise item table row and set the fields'
  initial values based on the given data object, if given. */

  let tr = document.createElement('tr');
  tr.classList.add('exercise-item');
  tr.dataset.rowNumber = rowNumber;

  // Selection
  let selectionTd = createSelectionTd(rowNumber);

  // Exercise*
  let exercise = (data && data.exercise) ? data.exercise : '';
  let exerciseTd = createExerciseTd(rowNumber, exercise);

  // Set type*
  let setType = (data && data.setType) ? data.setType : null;
  let setTypeTd = createSetTypeTd(rowNumber, setType);

  // Weight
  let weight = (data && !Number.isNaN(data.weight)) ? data.weight : null;
  let weightTd = createWeightTd(rowNumber, weight);

  // Sets
  let sets = (data && Number.isInteger(data.sets)) ? data.sets : null;
  let setsTd = createSetsTd(rowNumber, sets);

  // Reps
  let repsTd = document.createElement('td');
  repsTd.dataset.column = 'reps';

  if (sets > 0) {
    for (let i = 0; i < sets; i++) {
      let setNumber = i + 1;
      let reps = data.reps[i];
      let repsDiv = createRepsDiv(rowNumber, setNumber, reps);
      repsTd.appendChild(repsDiv);
    }
  }

  // Comments
  let comments = (data && data.comments) ? data.comments : '';
  let commentsTd = createCommentsTd(rowNumber, comments);

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


function createSelectionTd(rowNumber) {
  /* Create radio selection table cell with the given row number. */

  let selectionTd = document.createElement('td');
  selectionTd.dataset.column = 'selection';

  let selection = document.createElement('input');
  selection.type = 'radio';
  selection.name = 'selection';
  selection.id = selection.name + '-' + rowNumber;
  selection.dataset.rowNumber = rowNumber;
  selection.ariaLabel = 'Seleccionar ítem ' + rowNumber;

  selection.addEventListener('click', function (event) {
    toggleActionButtons();
  });

  selectionTd.appendChild(selection);

  return selectionTd;
}


function createExerciseTd(rowNumber, value) {
  /* Create exercise field table cell with the given row number and
  optional value. */

  let exerciseTd = document.createElement('td');
  exerciseTd.dataset.column = 'exercise';

  let exercise = document.createElement('input');
  exercise.type = "text";
  exercise.name = "exercise-" + rowNumber;
  exercise.id = exercise.name;
  exercise.dataset.rowNumber = rowNumber;
  exercise.maxLength = 50;
  exercise.required = true;

  if (value) {
    exercise.value = value;
  }

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

  exerciseTd.appendChild(exercise);
  exerciseTd.appendChild(utils.createInvalidFeedbackElement());

  return exerciseTd;
}


function createSetTypeTd(rowNumber, value) {
  /* Create set type field table cell with the given row number and
  optional value. */

  let setTypeTd = document.createElement('td');
  setTypeTd.dataset.column = 'setType';

  let setType = document.createElement('select');
  setType.name = "set-type-" + rowNumber;
  setType.id = setType.name;
  setType.dataset.rowNumber = rowNumber;
  setType.required = true;

  let warmupOption = document.createElement('option');
  warmupOption.value = "warmup";
  warmupOption.textContent = 'Calentamiento';

  let workOption = document.createElement('option');
  workOption.value = "work";
  workOption.textContent = 'Trabajo';

  if (value === 'warmup') {
    warmupOption.selected = true;
  } else if (value === 'work') {
    workOption.selected = true;
  }

  setType.appendChild(workOption);
  setType.appendChild(warmupOption);

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

  setTypeTd.appendChild(setType);
  setTypeTd.appendChild(utils.createInvalidFeedbackElement());

  return setTypeTd;
}


function createWeightTd(rowNumber, value) {
  /* Create weight field table cell with the given row number and
  optional value. */

  let weightTd = document.createElement('td');
  weightTd.dataset.column = 'weight';

  let weight = document.createElement('input');
  weight.type = "number";
  weight.name = "weight-" + rowNumber;
  weight.id = weight.name;
  weight.dataset.rowNumber = rowNumber;
  weight.min = 0;
  weight.step = 0.01;

  if (value) {
    weight.value = value;
  }

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

  weightTd.appendChild(weight);
  weightTd.appendChild(utils.createInvalidFeedbackElement());

  return weightTd;
}


function createSetsTd(rowNumber, value) {
  /* Create sets field table cell with the given row number and
  optional value. */

  let setsTd = document.createElement('td');
  setsTd.dataset.column = 'sets';

  let sets = document.createElement('input');
  sets.type = "number";
  sets.name = "sets-" + rowNumber;
  sets.id = sets.name;
  sets.dataset.rowNumber = rowNumber;
  sets.min = 0;
  sets.step = 1;
  sets.required = true;

  if (value) {
    sets.value = value;
  }

  sets.addEventListener('invalid', function (event) {
    showSetsError(sets);
  });

  sets.addEventListener('input', function (event) {
    if (sets.validity.valid) {
      // Temporarily disable field to avoid race condition
      sets.disabled = true;

      utils.getInvalidFeedbackElement(sets).textContent = '';

      let currentRowNumber = Number(sets.dataset.rowNumber);
      let setsCount = Number(sets.value);

      // Update reps td accordingly and then enable field again
      updateRepsTd(currentRowNumber, setsCount).then(() => {
        sets.disabled = false;
      });
    } else {
      showSetsError(sets);
    }
  });

  setsTd.appendChild(sets);
  setsTd.appendChild(utils.createInvalidFeedbackElement());

  return setsTd;
}


function createRepsDiv(rowNumber, setNumber, value) {
  /* Create reps div with the given row number, set number, and
  optional value. */

  let repsDiv = document.createElement('div');
  repsDiv.classList.add('reps-item');

  let repsLabel = document.createElement('label');
  repsLabel.htmlFor = "reps-" + rowNumber + '-' + setNumber;

  let repsLabelText = document.createTextNode('Serie ' + setNumber + ':');

  let requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.title = 'requerido';
  requiredAsterisk.ariaLabel = 'requerido';
  requiredAsterisk.textContent = '*';

  repsLabel.appendChild(repsLabelText);
  repsLabel.appendChild(requiredAsterisk);

  let reps = document.createElement('input');
  reps.type = "number";
  reps.name = repsLabel.htmlFor;
  reps.id = reps.name;
  reps.dataset.rowNumber = rowNumber;
  reps.dataset.setNumber = setNumber;
  reps.min = 1;
  reps.step = 1;
  reps.required = true;

  if (value) {
    reps.value = value;
  }

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

  repsDiv.appendChild(repsLabel);
  repsDiv.appendChild(reps);
  repsDiv.appendChild(utils.createInvalidFeedbackElement());

  return repsDiv;
}


function createCommentsTd(rowNumber, value) {
  /* Create comments field table cell with the given row number and
  optional value. */

  let commentsTd = document.createElement('td');
  commentsTd.dataset.column = 'comments';

  let comments = document.createElement('textarea');
  comments.name = "comments-" + rowNumber;
  comments.id = comments.name;
  comments.dataset.rowNumber = rowNumber;
  comments.pattern = '[0-9A-Za-z &\'\\-\\+\\.]*';
  comments.maxLength = 140;
  comments.cols = 20;
  comments.rows = 5;

  if (value) {
    comments.value = value;
  }

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

  commentsTd.appendChild(comments);
  commentsTd.appendChild(utils.createInvalidFeedbackElement());

  return commentsTd;
}


/* MANIPULATE EXERCISE ITEM ROW ELEMENTS */

function replaceExerciseItemRowNumber(row, newRowNumber) {
  /* Replace the row number in all components of the given row. */

  row.dataset.rowNumber = newRowNumber;

  let selection = row.querySelector('input[type="radio"][name="selection"]');
  selection.id = selection.name + '-' + newRowNumber;
  selection.dataset.rowNumber = newRowNumber;
  selection.ariaLabel = 'Seleccionar ítem ' + newRowNumber;

  let exercise = row.querySelector('input[type="text"][id^="exercise-"]');
  exercise.name = "exercise-" + newRowNumber;
  exercise.id = exercise.name;
  exercise.dataset.rowNumber = newRowNumber;

  let setType = row.querySelector('select[id^="set-type-"]');
  setType.name = "set-type-" + newRowNumber;
  setType.id = setType.name;
  setType.dataset.rowNumber = newRowNumber;

  let weight = row.querySelector('input[type="number"][id^="weight-"]');
  weight.name = "weight-" + newRowNumber;
  weight.id = weight.name;
  weight.dataset.rowNumber = newRowNumber;

  let sets = row.querySelector('input[type="number"][id^="sets-"]');
  sets.name = "sets-" + newRowNumber;
  sets.id = sets.name;
  sets.dataset.rowNumber = newRowNumber;

  const repsRegexp = /reps-\d+-(\d+)/;
  const repsRegexpReplacement = 'reps-' + newRowNumber + '-$1'

  let repsLabels = row.querySelectorAll('label[for^="reps-"]');
  if (repsLabels) {
    for (let repsLabel of repsLabels) {
      repsLabel.htmlFor =
          repsLabel.htmlFor.replace(repsRegexp, repsRegexpReplacement);
    }
  }

  let reps = row.querySelectorAll('input[type="number"][id^="reps-"]');
  if (reps) {
    for (let repsItem of reps) {
      repsItem.name = repsItem.name.replace(repsRegexp, repsRegexpReplacement);
      repsItem.id = repsItem.name;
      repsItem.dataset.rowNumber = newRowNumber;
    }
  }

  let comments = row.querySelector('textarea[id^="comments-"]');
  comments.name = "comments-" + newRowNumber;
  comments.id = comments.name;
  comments.dataset.rowNumber = newRowNumber;
}


function extractExerciseItemData(row) {
  /* Create object with the given exercise item's data, valid or not. */

  let data = {};

  let exercise = row.querySelector('input[type="text"][id^="exercise-"]');
  data.exercise = exercise.value;

  let setType = row.querySelector('select[id^="set-type-"]');
  data.setType = setType.value;

  let weight = row.querySelector('input[type="number"][id^="weight-"]');
  data.weight = weight.value ? Number(weight.value) : null;

  let sets = row.querySelector('input[type="number"][id^="sets-"]');
  data.sets = Number(sets.value);

  let reps = row.querySelectorAll('input[type="number"][id^="reps-"]');
  data.reps = [];
  if (reps) {
    for (let i = 0; i < data.sets; i++) {
      data.reps.push(reps[i] ? reps[i].value : null);
    }
  }

  let comments = row.querySelector('textarea[id^="comments-"]');
  data.comments = comments.value;

  return data;
}


async function updateRepsTd(rowNumber, setsCount) {
  /* Create or remove reps divs to match the given number of sets. */

  let row = getRow(rowNumber);
  let repsTd = row ? row.querySelector('td[data-column="reps"]') : null;

  if (repsTd && Number.isInteger(setsCount) && setsCount >= 0) {
    let repsDivs = repsTd ? repsTd.querySelectorAll('div.reps-item') : [];
    let repsDivsCount = Number(repsDivs.length);

    if (setsCount > repsDivsCount) {
      // If the number of sets is greater than the current number of
      // reps divs, create as many new ones as needed to reach the
      // required number, and append them to the td element
      for (let set = repsDivsCount + 1; set <= setsCount; set++) {
        let newRepsDiv = createRepsDiv(rowNumber, set);
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
