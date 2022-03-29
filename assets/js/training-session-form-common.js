import * as utils from '/assets/js/utils.js';


/* GENERAL HELPERS */

function getSelectedRowNumber() {
  /* Get the currently selected row number if any, or return null. */

  let radios = document.querySelectorAll(
    '.exercises input[type="radio"][name="selection"]');

  if (radios && radios.length) {
    for (let radio of radios) {
      if (radio.checked) {
        return Number(radio.dataset.rowNumber);
      }
    }
  }

  return null;
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


function removeExercise() {
  /* Remove selected exercise item. */

  console.log('TODO: remove');
}


function duplicateExercise() {
  /* Duplicate selected exercise item. */

  console.log('TODO: duplicate');
}


function moveUpExercise() {
  /* Move selected exercise item one position up. */

  console.log('TODO: moveUp');
}


function moveDownExercise() {
  /* Move selected exercise item one position down. */

  console.log('TODO: moveDown');
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

  if (duration.validity.rangeUnderflow) {
    feedback.textContent = 'La duración no puede ser negativa.';
  }
}


export function showBodyweightError(bodyweight) {
  /* Show feedback if the bodyweight field's input is invalid. */

  let feedback = utils.getInvalidFeedbackElement(bodyweight);

  if (bodyweight.validity.rangeUnderflow) {
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


/* EXERCISE DATA PROCESSING */

export function gatherExercisesFormData() {
  /* Return a list of training sessions with the form fields' data. */

  console.log('TODO: gatherExerciseData');
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

  if (sets > 0) {
    for (let i = 0; i < sets; i++) {
      let setNumber = i + 1;

      let reps = null;
      if (data && data.reps && Number.isInteger(data.reps[i])) {
        reps = data.reps[i];
      }

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

  let exercise = document.createElement('input');
  exercise.type = "text";
  exercise.name = "exercise-" + rowNumber;
  exercise.id = exercise.name;
  exercise.dataset.rowNumber = rowNumber;
  exercise.maxLength = 20;
  exercise.pattern = '[0-9A-Za-z &\'\\-\\+\\.]+';
  exercise.required = true;

  if (value) {
    exercise.value = value;
  }

  exercise.addEventListener('invalid', function (event) {
    console.log('TODO: ' + this.id + ' invalid');
  });

  exercise.addEventListener('input', function (event) {
    console.log('TODO: ' + this.id + ' input');
  });

  exerciseTd.appendChild(exercise);
  exerciseTd.appendChild(utils.createInvalidFeedbackElement());

  return exerciseTd;
}


function createSetTypeTd(rowNumber, value) {
  /* Create set type field table cell with the given row number and
  optional value. */

  let setTypeTd = document.createElement('td');

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
    console.log('TODO: ' + this.id + ' invalid');
  });

  setType.addEventListener('input', function (event) {
    console.log('TODO: ' + this.id + ' input');
  });

  setTypeTd.appendChild(setType);
  setTypeTd.appendChild(utils.createInvalidFeedbackElement());

  return setTypeTd;
}


function createWeightTd(rowNumber, value) {
  /* Create weight field table cell with the given row number and
  optional value. */

  let weightTd = document.createElement('td');

  let weight = document.createElement('input');
  weight.type = "number";
  weight.name = "weight-" + rowNumber;
  weight.id = weight.name;
  weight.dataset.rowNumber = rowNumber;

  if (!Number.isNaN(value)) {
    weight.value = value;
  }

  weight.addEventListener('invalid', function (event) {
    console.log('TODO: ' + this.id + ' invalid');
  });

  weight.addEventListener('input', function (event) {
    console.log('TODO: ' + this.id + ' input');
  });

  weightTd.appendChild(weight);
  weightTd.appendChild(utils.createInvalidFeedbackElement());

  return weightTd;
}


function createSetsTd(rowNumber, value) {
  /* Create sets field table cell with the given row number and
  optional value. */

  let setsTd = document.createElement('td');

  let sets = document.createElement('input');
  sets.type = "number";
  sets.name = "sets-" + rowNumber;
  sets.id = sets.name;
  sets.dataset.rowNumber = rowNumber;
  sets.required = true;

  if (value) {
    sets.value = value;
  }

  sets.addEventListener('invalid', function (event) {
    console.log('TODO: ' + this.id + ' invalid');
  });

  sets.addEventListener('input', function (event) {
    console.log('TODO: ' + this.id + ' input');
  });

  setsTd.appendChild(sets);
  setsTd.appendChild(utils.createInvalidFeedbackElement());

  return setsTd;
}


function createRepsDiv(rowNumber, setNumber, value) {
  /* Create reps div with the given row number, set number, and
  optional value. */

  let repsDiv = document.createElement('div');

  let repsLabel = document.createElement('label');
  repsLabel.for = "reps-" + rowNumber + '-' + setNumber;

  let repsLabelText = document.createTextNode('Serie ' + setNumber + ':');

  let requiredAsterisk = document.createElement('abbr');
  requiredAsterisk.title = 'requerido';
  requiredAsterisk.ariaLabel = 'requerido';
  requiredAsterisk.textContent = '*';

  repsLabel.appendChild(repsLabelText);
  repsLabel.appendChild(requiredAsterisk);

  let reps = document.createElement('input');
  reps.type = "number";
  reps.id = repsLabel.for;
  reps.id = reps.name;
  reps.dataset.rowNumber = rowNumber;
  reps.dataset.setNumber = setNumber;
  reps.min = 1;
  reps.required = true;

  if (value) {
    reps.value = value;
  }

  reps.addEventListener('invalid', function (event) {
    console.log('TODO: ' + this.id + ' invalid');
  });

  reps.addEventListener('input', function (event) {
    console.log('TODO: ' + this.id + ' input');
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

  let comments = document.createElement('textarea');
  comments.name = "comments-" + rowNumber;
  comments.id = comments.name;
  comments.dataset.rowNumber = rowNumber;
  comments.pattern = '[0-9A-Za-z &\'\\-\\+\\.]*';
  comments.maxLength = 50;
  comments.cols = 20;
  comments.rows = 5;

  if (value) {
    comments.value = value;
  }

  comments.addEventListener('invalid', function (event) {
    console.log('TODO: ' + this.id + ' invalid');
  });

  comments.addEventListener('input', function (event) {
    console.log('TODO: ' + this.id + ' input');
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
      repsLabel.for = repsLabel.for.replace(repsRegexp, repsRegexpReplacement);
    }
  }

  let reps = row.querySelector('input[type="number"][id^="reps-"]');
  if (reps) {
    for (let repsItem of reps) {
      repsItem.name = repsItem.name.replace(repsRegexp, repsRegexpReplacement);
      repsItem.id = reps.name;
      repsItem.dataset.rowNumber = newRowNumber;
    }
  }

  let comments = row.querySelector('textarea[id^="comments-"]');
  comments.name = "comments-" + newRowNumber;
  comments.id = comments.name;
  comments.dataset.rowNumber = newRowNumber;
}


function extractExerciseItemData(row) {
  /* Create object with the given exercise item's data, or return null
  if data is invalid or required data is missing. */

  let data = {};

  let exercise = row.querySelector('input[type="text"][id^="exercise-"]');
  data.exercise = exercise.value;
  if (!data.exercise) {
    return null;
  }

  let setType = row.querySelector('select[id^="set-type-"]');
  data.setType = setType.value;
  if (data.setType !== 'warmup' && data.setType !== 'work') {
    return null;
  }

  let weight = row.querySelector('input[type="number"][id^="weight-"]');
  data.weight = null;
  if (weight.value) {
    let weightNumber = Number(weight.value);
    if (Number.isInteger(weightNumber) && weightNumber >= 0) {
      data.weight = weightNumber;
    } else {
      return null;
    }
  }

  let sets = row.querySelector('input[type="number"][id^="sets-"]');
  data.sets = Number(sets.value);
  if (!Number.isInteger(data.sets) || data.sets < 0) {
    return null;
  }

  let reps = row.querySelector('input[type="number"][id^="reps-"]');
  data.reps = [];
  if (reps) {
    for (let repsItem of reps) {
      let repsNumber = Number(repsItem.value);
      if (Number.isInteger(repsNumber) && repsNumber > 0) {
        data.reps.push(repsNumber);
      } else {
        return null;
      }
    }
  }

  if (data.sets !== data.reps.length) {
    return null;
  }

  let comments = row.querySelector('textarea[id^="comments-"]');
  data.comments = comments.value;

  return data;
}
