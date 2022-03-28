import * as utils from '/assets/js/utils.js';



/* ACTION BUTTON FUNCTIONS */


function getSelectedRowNumber() {
  /* Get the currently selected row number if any, or return null. */

  let radios = document.querySelector(
      '.exercises input[type="radio"][id^="selection-"]');

  for (let radio of radios) {
    if (radio.checked) {
      return radio.dataset.rowNumber;
    }
  }

  return null;
}


function addExercise() {
  /* Add an empty exercise item at the end of the table. */

  console.log('TODO: add');
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

function gatherExercisesFData() {
  /* Return a list of training sessions with the form fields' data. */

  let exercise = document.querySelectorAll(
      '.exercises input[type="text"][id^="exercise-"]');
  let setType = document.querySelectorAll('.exercises select[id^="set-type-"]');
  let weight = document.querySelectorAll(
      '.exercises input[type="number"][id^="weight-"]');
  let sets = document.querySelectorAll(
      '.exercises input[type="number"][id^="sets-"]');
  let reps = document.querySelectorAll(
      '.exercises input[type="number"][id^="reps-"]');
  let comments = document.querySelectorAll(
      '.exercises textarea[id^="comments-"]');

  console.log('TODO: gatherExerciseData');
}


/* CREATE EDITABLE EXERCISE ITEM ROW ELEMENTS */

export function createEditableExerciseItemRow(rowNumber, data) {
  /* Create a new editable exercise item table row and set the fields'
  initial values based on the given data object, if given. */

  let tr = document.createElement('tr');

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

  if (sets.value > 0) {
    for (let i = 0; i < sets.value; i++) {
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

  selection.addEventListener('click', function (event) {
    console.log('TODO: ' + this.id + ' click');
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
  exercise.id = "exercise-" + rowNumber;
  exercise.name = exercise.id;
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
  setType.id = "set-type-";
  setType.name = setType.id;
  setType.dataset.rowNumber = rowNumber;
  setType.required = true;
  
  let warmupOption = document.createElement('option');
  warmupOptionworkOption.value = warmup;
  warmupOptionworkOption.textContent = 'Calentamiento';
  
  let workOption = document.createElement('option');
  workOption.value = work;
  workOption.textContent = 'Trabajo';
  
  if (value === 'warmup') {
    warmupOption.selected = true;
  } else if (value === 'work') {
    workOption.selected = true;
  }
  
  setType.appendChild(work);
  setType.appendChild(warmup);
  
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
  weight.id = "weight-" + rowNumber;
  weight.name = weight.id;
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
  sets.id = "sets-" + rowNumber;
  sets.name = sets.id;
  sets.dataset.rowNumber = rowNumber;
  sets.required = True;
  
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
  reps.name = reps.id;
  reps.dataset.rowNumber = rowNumber;
  reps.dataset.setNumber = setNumber;
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
  comments.id = "comments-" + rowNumber;
  comments.name = comments.id;
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
  