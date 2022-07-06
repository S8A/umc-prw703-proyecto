import * as utils from './utils.js';
import { TrainingSession, ExerciseItem, SetType } from './data-classes.js';
'use strict';


/* CONSTANTS */
export const MAX_EXERCISE_ITEMS = 50;


/* CONSTRUCT FORM PAGE */

/**
 * Construct form page for creating a new training session or editing
 * an existing one.
 *
 * @param {?TrainingSession} [trainingSession=null]
 * TrainingSession object with the data of the training session to edit,
 * or null to create a new training session.
 */
export function constructTrainingSessionForm(trainingSession = null) {
  // Setup basic data fields
  const date = setupDateField();
  const time = setupTimeField();
  const shortTitle = setupShortTitleField();
  const duration = setupDurationField();
  const bodyweight = setupBodyweightField();
  const comments = setupCommentsField();

  // Add button event listener
  const addButton = document.getElementById('add-btn');
  addButton.addEventListener('click', function () {
    addExerciseItem();
  });

  // Exercises container
  const exercisesContainer = document.getElementById('exercises-container');

  // If a TrainingSession was given
  if (trainingSession && trainingSession instanceof TrainingSession) {
    // Set basic data fields' values
    date.value = trainingSession.date;
    time.value = trainingSession.time;
    shortTitle.value = trainingSession.shortTitle;
    duration.value = trainingSession.duration;
    bodyweight.value = trainingSession.bodyweight;
    comments.value = trainingSession.comments;

    // If the TrainingSession has at least one ExerciseItem
    if (trainingSession.exerciseItemsCount) {
      // Create exercise items and append them to the container
      utils.clearOutChildNodes(exercisesContainer);
      for (const i in trainingSession.exercises) {
        const indexNumber = Number(i);
        const exerciseItem = trainingSession.exercises[indexNumber];
        const item = createEditableExerciseItem(indexNumber, exerciseItem);
        exercisesContainer.appendChild(item);
      }
    }
  }

  toggleActionButtons();
}


/**
 * Add event listeners to date field.
 *
 * @returns {HTMLInputElement} Date input field.
 */
function setupDateField() {
  const date = document.getElementById('date');

  date.addEventListener('invalid', function () {
    showDateError(this);
  });

  date.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showDateError(this);
    }
  });

  return date;
}


/**
 * Add event listeners to time field.
 *
 * @returns {HTMLInputElement} Time input field.
 */
function setupTimeField() {
  const time = document.getElementById('time');

  time.addEventListener('invalid', function () {
    showTimeError(this);
  });

  time.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showTimeError(this);
    }
  });

  return time;
}


/**
 * Add event listeners to short title field.
 *
 * @returns {HTMLInputElement} Short title input field.
 */
function setupShortTitleField() {
  const shortTitle = document.getElementById('short-title');

  shortTitle.addEventListener('invalid', function () {
    showShortTitleError(this);
  });

  shortTitle.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showShortTitleError(this);
    }
  });

  return shortTitle;
}


/**
 * Add event listeners to duration field.
 *
 * @returns {HTMLInputElement} Duration input field.
 */
function setupDurationField() {
  const duration = document.getElementById('duration');

  duration.addEventListener('invalid', function () {
    showDurationError(this);
  });

  duration.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showDurationError(this);
    }
  });

  return duration;
}


/**
 * Add event listeners to bodyweight field.
 *
 * @returns {HTMLInputElement} Bodyweight input field.
 */
function setupBodyweightField() {
  const bodyweight = document.getElementById('bodyweight');

  bodyweight.addEventListener('invalid', function () {
    showBodyweightError(this);
  });

  bodyweight.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showBodyweightError(this);
    }
  });

  return bodyweight;
}


/**
 * Add event listeners to general comments field.
 *
 * @returns {HTMLTextAreaElement} General comments input field.
 */
function setupCommentsField() {
  const comments = document.getElementById('comments');

  comments.addEventListener('invalid', function () {
    showCommentsError(this);
  });

  comments.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showCommentsError(this);
    }
  });

  return comments;
}


/* GENERAL HELPERS */

/**
 * Get ordered list of all exercise items.
 *
 * @returns {NodeListOf<HTMLElement>} List of exercise items in the page.
 */
export function getExerciseItems() {
  return document.querySelectorAll('#exercises-container > .exercise-item');
}


/**
 * Get exercise item by its index number.
 *
 * @param {number} index - Index number of the requested exercise item.
 * @returns {?HTMLElement} Exercise item if found, or null otherwise.
 */
export function getExerciseItem(index) {
  return document.querySelector(
      '#exercises-container > .exercise-item[data-index="' + index + '"]'
  );
}


/* ACTION BUTTON FUNCTIONS */

/**
 * Enable/disable action buttons based on the number and index of the
 * exercise items.
 */
export function toggleActionButtons() {
  const exerciseItems = getExerciseItems();
  const itemCount = exerciseItems.length;
  
  const addButton = document.getElementById('add-btn');
  addButton.disabled = itemCount >= MAX_EXERCISE_ITEMS;

  if (itemCount) {
    for (const item of exerciseItems) {
      const i = item.dataset.index;

      const duplicateButton = item.querySelector(
        'button[data-action="duplicate"]');
      const moveUpButton = item.querySelector('button[data-action="move-up"]');
      const moveDownButton = item.querySelector(
          'button[data-action="move-down"]');
      const removeButton = item.querySelector('button[data-action="remove"]');

      duplicateButton.disabled = itemCount >= MAX_EXERCISE_ITEMS;
      moveUpButton.disabled = i === 0;
      moveDownButton.disabled = i === itemCount - 1;
      removeButton.disabled = itemCount === 1;
    }
  }
}


/**
 * Add an empty exercise item at the end of the list.
 */
export function addExerciseItem() {
  const exercisesContainer = document.getElementById('exercises-container');
  const exerciseItems = getExerciseItems();

  // Create new exercise item and append it to the container
  const newItemIndex = exerciseItems.length;
  const newItem = createEditableExerciseItem(newItemIndex);
  exercisesContainer.appendChild(newItem);

  toggleActionButtons();
}


/**
 * Remove exercise item with the given index number, unless it's the only
 * item left.
 *
 * @param {number} index - Index number of the exercise item to remove.
 */
export function removeExerciseItem(index) {
  const exerciseItems = getExerciseItems();

  if (exerciseItems.length) {
    for (const item of exerciseItems) {
      const i = item.dataset.index;
      if (i === index) {
        // Remove item with the targeted index and reduce item count by one
        item.remove();
      } else if (i > index) {
        // Reduce subsequent items' indexes by one and toggle their buttons
        replaceExerciseItemIndex(item, i - 1);
      }
    }
  }

  toggleActionButtons();
}


/**
 * Duplicate exercise item with the given index number.
 *
 * @param {number} index - Index number of the exercise item to duplicate.
 */
export function duplicateExerciseItem(index) {
  const exercisesContainer = document.getElementById('exercises-container');
  const exerciseItems = getExerciseItems();
  const targetItem = exerciseItems[index];

  if (exerciseItems.length && targetItem) {
    // Extract the targeted item's data, create a new exercise item
    // with the same data, and place it below the targeted one
    const data = extractExerciseItemData(targetItem);
    const newItemIndex = index + 1;
    const newItem = createEditableExerciseItem(newItemIndex, data);

    if (index === exerciseItems.length - 1) {
      // If the targeted item is the last one, append the new item to
      // the container
      exercisesContainer.appendChild(newItem);
    } else {
      // Otherwise, insert new item before the one following the targeted one
      exercisesContainer.insertBefore(newItem, exerciseItems[index + 1]);

      // Then increase by one the indexes of all items starting from that item
      for (const item of exerciseItems) {
        const i = item.dataset.index;
        if (i >= index + 1) {
          replaceExerciseItemIndex(item, i + 1);
        }
      }
    }

    toggleActionButtons();
  }
}


/**
 * Move exercise item with the given index number one position up,
 * unless it's the first one.
 *
 * @param {number} index - Index number of the exercise item to move up.
 */
export function moveUpExerciseItem(index) {
  const exercisesContainer = document.getElementById('exercises-container');
  const exerciseItems = getExerciseItems();
  const targetItem = exerciseItems[index];

  if (exerciseItems.length && targetItem && index > 0) {
    // If the exercise item exists and it's not the first one, swap it
    // with the one above it
    const itemAbove = exerciseItems[index - 1];

    // Swap index numbers
    replaceExerciseItemIndex(targetItem, index - 1);
    replaceExerciseItemIndex(itemAbove, index);

    // Re-insert target item before the one above it
    exercisesContainer.insertBefore(targetItem, itemAbove);

    toggleActionButtons();
  }
}


/**
 * Move exercise item with the given index number one position down,
 * unless it's the last one.
 *
 * @param {number} index - Index number of the exercise item to move down.
 */
export function moveDownExerciseItem(index) {
  const exercisesContainer = document.getElementById('exercises-container');
  const exerciseItems = getExerciseItems();
  const targetItem = exerciseItems[index];

  if (exerciseItems.length && targetItem && index < exerciseItems.length - 1) {
    // If the exercise item exists and it's not the last one, swap it
    // with the one below it
    const itemBelow = exerciseItems[index + 1];

    // Swap index numbers
    replaceExerciseItemIndex(itemBelow, index);
    replaceExerciseItemIndex(targetItem, index + 1);

    // Re-insert bottom item before the targeted one
    exercisesContainer.insertBefore(itemBelow, targetItem);

    toggleActionButtons();
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
  const date = document.getElementById('date');
  const time = document.getElementById('time');
  const shortTitle = document.getElementById('short-title');
  const duration = document.getElementById('duration');
  const bodyweight = document.getElementById('bodyweight');
  const comments = document.getElementById('comments');

  // Exercise items
  const exercises = [];
  const exerciseItems = getExerciseItems();

  if (exerciseItems.length) {
    for (const item of exerciseItems) {
      const data = extractExerciseItemData(item);
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


/* CREATE EDITABLE EXERCISE ITEM ELEMENTS */

/**
 * Create a new editable exercise item and set the fields' initial
 * values based on the given data object, if any.
 *
 * @param {number} index - Index number of the new exercise item.
 * @param {Object} [data]
 * Data object from which to get the values for the exercise item's fields.
 * @returns {HTMLElement} Editable exercise item.
 */
function createEditableExerciseItem(index, data = {}) {
  const card = document.createElement('section');
  card.classList.add('exercise-item', 'card', 'mb-2');
  card.dataset.index = index;

  const header = createActionButtonsHeader(index);

  const container = document.createElement('div');
  container.classList.add('container-fluid', 'g-2');

  // Row 1: Exercise, set type
  const row1 = document.createElement('div');
  row1.classList.add('row', 'g-2', 'mb-2');

  const exerciseDiv = createExerciseDiv(index, data.exercise);
  const setTypeDiv = createSetTypeDiv(index, data.setType);

  row1.appendChild(exerciseDiv);
  row1.appendChild(setTypeDiv);

  // Row 2: Weight, sets
  const row2 = document.createElement('div');
  row2.classList.add('row', 'g-2', 'mb-2');

  const weightDiv = createWeightDiv(index, data.weight);
  const setsDiv = createSetsDiv(index, data.sets);

  row2.appendChild(weightDiv);
  row2.appendChild(setsDiv);

  // Row 3: Reps
  const row3 = document.createElement('div');
  row3.classList.add('row', 'g-2', 'mb-2', 'reps-wrapper');

  if (data.sets && Number.isInteger(Number(data.sets))) {
    for (let i = 0; i < data.sets; i++) {
      const setNumber = i + 1;
      const reps = data.reps[i];
      const repsDiv = createRepsDiv(index, setNumber, reps);
      row3.appendChild(repsDiv);
    }
  }

  // Row 4: Comments
  const row4 = document.createElement('div');
  row4.classList.add('row', 'g-2', 'mb-2');

  const commentsDiv = createCommentsDiv(index, data.comments);

  row4.appendChild(commentsDiv);

  container.appendChild(row1);
  container.appendChild(row2);
  container.appendChild(row3);
  container.appendChild(row4);

  card.appendChild(header);
  card.appendChild(container);

  return card;
}


/**
 * Create div with the action buttons for the exercise item of the given index.
 *
 * @param {number} index - Index number of the exercise item.
 * @returns {HTMLDivElement} Div containing the exercise item's action buttons.
 */
function createActionButtonsHeader(index) {
  const div = document.createElement('div');
  div.classList.add('card-header');

  const duplicateButton = document.createElement('button');
  duplicateButton.classList.add('btn', 'btn-sm', 'btn-primary', 'me-1');
  duplicateButton.dataset.action = 'duplicate';
  duplicateButton.dataset.index = index;
  duplicateButton.textContent = 'Duplicar';

  duplicateButton.addEventListener('click', function () {
    duplicateExerciseItem(this.dataset.index);
  });

  const moveUpButton = document.createElement('button');
  moveUpButton.classList.add('btn', 'btn-sm', 'btn-secondary', 'me-1');
  moveUpButton.dataset.action = 'move-up';
  moveUpButton.dataset.index = index;
  moveUpButton.textContent = 'Subir';

  moveUpButton.addEventListener('click', function () {
    moveUpExerciseItem(this.dataset.index);
  });

  const moveDownButton = document.createElement('button');
  moveDownButton.classList.add('btn', 'btn-sm', 'btn-secondary', 'me-1');
  moveDownButton.dataset.action = 'move-down';
  moveDownButton.dataset.index = index;
  moveDownButton.textContent = 'Bajar';

  moveDownButton.addEventListener('click', function () {
    moveDownExerciseItem(this.dataset.index);
  });

  const removeButton = document.createElement('button');
  removeButton.classList.add('btn', 'btn-sm', 'btn-danger', 'me-1');
  removeButton.dataset.action = 'remove';
  removeButton.dataset.index = index;
  removeButton.textContent = 'Eliminar';

  removeButton.addEventListener('click', function () {
    removeExerciseItem(this.dataset.index);
  });

  div.appendChild(duplicateButton);
  div.appendChild(moveUpButton);
  div.appendChild(moveDownButton);
  div.appendChild(removeButton);

  return div;
}


/**
 * Create exercise field div with the given index number and optional value.
 *
 * @param {number} index - Index number of the exercise item.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement} Div containing the exercise field and its label.
 */
function createExerciseDiv(index, value) {
  const div = document.createElement('div');
  div.classList.add('col-sm-8');

  const field = document.createElement('input');
  field.classList.add('form-control', 'form-control-sm');
  field.type = 'text';
  field.name = 'exercise-' + index;
  field.id = field.name;
  field.dataset.index = index;
  field.maxLength = 50;
  field.required = true;

  if (value) {
    field.value = value;
  }

  field.addEventListener('invalid', function () {
    showExerciseError(this);
  });

  field.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showExerciseError(this);
    }
  });

  const label = document.createElement('label');
  label.classList.add('form-label', 'small');
  label.htmlFor = field.id;
  label.textContent = 'Ejercicio:';

  div.appendChild(label);
  div.appendChild(field);
  div.appendChild(utils.createInvalidFeedbackElement());

  return div;
}


/**
 * Create set type field div with the given index number and optional value.
 *
 * @param {number} index - Index number of the exercise item.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement}
 * Div containing the set type select field and its label.
 */
function createSetTypeDiv(index, value) {
  const div = document.createElement('div');
  div.classList.add('col-sm-4');

  const select = document.createElement('select');
  select.classList.add('form-select');
  select.name = 'set-type-' + index;
  select.id = select.name;
  select.dataset.index = index;
  select.required = true;

  const warmupOption = document.createElement('option');
  warmupOption.value = 'warmup';
  warmupOption.textContent = 'Calentamiento';

  const workOption = document.createElement('option');
  workOption.value = 'work';
  workOption.textContent = 'Trabajo';

  if (value) {
    if (value === SetType.WarmUp) {
      warmupOption.selected = true;
    } else if (value === SetType.Work) {
      workOption.selected = true;
    }
  }

  select.appendChild(workOption);
  select.appendChild(warmupOption);

  select.addEventListener('invalid', function () {
    showSetTypeError(this);
  });

  select.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showSetTypeError(this);
    }
  });

  const label = document.createElement('label');
  label.classList.add('form-label', 'small');
  label.htmlFor = select.id;
  label.textContent = 'Modalidad:';

  div.appendChild(label);
  div.appendChild(select);
  div.appendChild(utils.createInvalidFeedbackElement());

  return div;
}


/**
 * Create weight field div with the given index number and optional value.
 *
 * @param {number} index - Index number of the exercise item.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement} Div containing the weight field and its label.
 */
function createWeightDiv(index, value) {
  const div = document.createElement('div');
  div.classList.add('col-sm-4');

  const field = document.createElement('input');
  field.classList.add('form-control', 'form-control-sm');
  field.type = 'number';
  field.name = 'weight-' + index;
  field.id = field.name;
  field.dataset.index = index;
  field.min = 0;
  field.step = 0.01;

  if (value !== null || value !== undefined) {
    // Explicit check to allow setting zero as value
    field.value = value;
  }

  field.addEventListener('invalid', function () {
    showWeightError(this);
  });

  field.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showWeightError(this);
    }
  });

  const label = document.createElement('label');
  label.classList.add('form-label', 'small');
  label.htmlFor = field.id;
  label.textContent = 'Peso (kg):';

  div.appendChild(label);
  div.appendChild(field);
  div.appendChild(utils.createInvalidFeedbackElement());

  return div;
}


/**
 * Create sets field div with the given index number and optional value.
 *
 * @param {number} index - Index number of the exercise item.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement} Div containing the sets field and its label.
 */
function createSetsDiv(index, value) {
  const div = document.createElement('div');
  div.classList.add('col-sm-4');

  const field = document.createElement('input');
  field.classList.add('form-control', 'form-control-sm');
  field.type = 'number';
  field.name = 'sets-' + index;
  field.id = field.name;
  field.dataset.index = index;
  field.min = 0;
  field.step = 1;
  field.required = true;

  if (value !== null || value !== undefined) {
    // Explicit check to allow setting zero as value
    field.value = value;
  }

  field.addEventListener('invalid', function () {
    showSetsError(this);
  });

  field.addEventListener('change', async function () {
    if (this.validity.valid) {
      // Temporarily disable field to avoid race condition
      this.disabled = true;

      utils.getInvalidFeedbackElement(this).textContent = '';

      const currentIndex = Number(this.dataset.index);
      const setsCount = Number(this.value);

      // Update reps accordingly and then enable field again
      await updateRepsItemsCount(currentIndex, setsCount);
      this.disabled = false;
    } else {
      showSetsError(this);
    }
  });

  const label = document.createElement('label');
  label.classList.add('form-label', 'small');
  label.htmlFor = field.id;
  label.textContent = 'Series:';

  div.appendChild(label);
  div.appendChild(field);
  div.appendChild(utils.createInvalidFeedbackElement());

  return div;
}


/**
 * Create reps div with the given index number, set number, and optional value.
 *
 * @param {number} index - Index number of the exercise item.
 * @param {number} setNumber
 * The field will hold the number of reps done for the set number
 * indicated by this parameter.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement} Div containing the reps field and its label.
 */
function createRepsDiv(index, setNumber, value) {
  const div = document.createElement('div');
  div.classList.add('col-sm-6', 'reps-item');

  const field = document.createElement('input');
  field.classList.add('form-control', 'form-control-sm');
  field.type = 'number';
  field.name = 'reps-' + index + '-' + setNumber;
  field.id = field.name;
  field.dataset.index = index;
  field.dataset.setNumber = setNumber;
  field.min = 1;
  field.step = 1;
  field.required = true;

  if (value !== null || value !== undefined) {
    // Explicit check to allow setting zero as value
    field.value = value;
  }

  field.addEventListener('invalid', function () {
    showRepsError(this);
  });

  field.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showRepsError(this);
    }
  });

  const label = document.createElement('label');
  label.classList.add('col-sm-8', 'col-md-6', 'col-form-label');
  label.htmlFor = field.id;
  label.textContent = 'Repeticiones (serie' + utils.NBSP + setNumber + '):';

  const row = document.createElement('div');
  row.classList.add('row', 'g-2', 'mb-2', 'small');

  const fieldCol = document.createElement('div');
  fieldCol.classList.add('col-sm-4');

  fieldCol.appendChild(field)
  fieldCol.appendChild(utils.createInvalidFeedbackElement());

  row.appendChild(label);
  row.appendChild(fieldCold);

  div.appendChild(row);

  return div;
}


/**
 * Create comments field div with the given index number and optional value.
 *
 * @param {number} index - Index number of the exercise item.
 * @param {?any} value - Value to set for the field.
 * @returns {HTMLDivElement} Div containing the comments field and its label.
 */
function createCommentsDiv(index, value) {
  const div = document.createElement('div');
  div.classList.add('col-sm-12');

  const field = document.createElement('textarea');
  field.classList.add('form-control', 'form-control-sm');
  field.name = 'comments-' + index;
  field.id = field.name;
  field.dataset.index = index;
  field.pattern = '[0-9A-Za-z &\'\\-\\+\\.]*';
  field.maxLength = 140;
  field.cols = 70;
  field.rows = 2;

  if (value) {
    field.value = value;
  }

  field.addEventListener('invalid', function () {
    showExerciseCommentsError(this);
  });

  field.addEventListener('change', function () {
    if (this.validity.valid) {
      utils.getInvalidFeedbackElement(this).textContent = '';
    } else {
      showExerciseCommentsError(this);
    }
  });

  const label = document.createElement('label');
  label.classList.add('form-label', 'small');
  label.htmlFor = field.id;
  label.textContent = 'Comentarios';

  div.appendChild(label);
  div.appendChild(field);
  div.appendChild(utils.createInvalidFeedbackElement());

  return div;
}


/* MANIPULATE EXERCISE ITEM ELEMENTS */

/**
 * Replace the index number in all components of the given exercise item.
 *
 * @param {HTMLElement} item
 * Exercise item which will have its index number replaced.
 * @param {number} newIndex - New index number.
 */
function replaceExerciseItemIndex(item, newIndex) {
  // Item itself
  item.dataset.index = newIndex;

  // Action buttons
  const duplicateButton = item.querySelector('button[data-action="duplicate"]');
  duplicateButton.dataset.index = newIndex;

  const moveUpButton = item.querySelector('button[data-action="move-up"]');
  moveUpButton.dataset.index = newIndex;

  const moveDownButton = item.querySelector('button[data-action="move-down"]');
  moveDownButton.dataset.index = newIndex;

  const removeButton = item.querySelector('button[data-action="remove"]');
  removeButton.dataset.index = newIndex;

  // Exercise
  const exercise = item.querySelector('input[type="text"][id^="exercise-"]');
  exercise.name = 'exercise-' + newIndex;
  exercise.id = exercise.name;
  exercise.dataset.index = newIndex;

  const exerciseLabel = item.querySelector('label[for^="exercise-"]');
  exerciseLabel.htmlFor = exercise.id;

  // Set type
  const setType = item.querySelector('select[id^="set-type-"]');
  setType.name = 'set-type-' + newIndex;
  setType.id = setType.name;
  setType.dataset.index = newIndex;

  const setTypeLabel = item.querySelector('label[for^="setType-"]');
  setTypeLabel.htmlFor = setType.id;

  // Weight
  const weight = item.querySelector('input[type="number"][id^="weight-"]');
  weight.name = 'weight-' + newIndex;
  weight.id = weight.name;
  weight.dataset.index = newIndex;

  const weightLabel = item.querySelector('label[for^="weight-"]');
  weightLabel.htmlFor = weight.id;

  // Sets
  const sets = item.querySelector('input[type="number"][id^="sets-"]');
  sets.name = 'sets-' + newIndex;
  sets.id = sets.name;
  sets.dataset.index = newIndex;

  const setsLabel = item.querySelector('label[for^="sets-"]');
  setsLabel.htmlFor = sets.id;

  // Reps
  const repsRegexp = /reps-\d+-(\d+)/;
  const repsRegexpReplacement = 'reps-' + newIndex + '-$1'

  const repsLabels = item.querySelectorAll('label[for^="reps-"]');
  if (repsLabels) {
    for (const repsLabel of repsLabels) {
      repsLabel.htmlFor = repsLabel.htmlFor.replace(
          repsRegexp, repsRegexpReplacement);
    }
  }

  const reps = item.querySelectorAll('input[type="number"][id^="reps-"]');
  if (reps) {
    for (const repsItem of reps) {
      repsItem.name = repsItem.name.replace(repsRegexp, repsRegexpReplacement);
      repsItem.id = repsItem.name;
      repsItem.dataset.index = newIndex;
    }
  }

  // Comments
  const comments = item.querySelector('textarea[id^="comments-"]');
  comments.name = 'comments-' + newIndex;
  comments.id = comments.name;
  comments.dataset.index = newIndex;

  const commentsLabel = item.querySelector('label[for^="comments-"]');
  commentsLabel.htmlFor = comments.id;
}


/**
 * Create data object with the given exercise item's data, valid or not.
 *
 * @param {HTMLElement} item
 * Exercise item from which the data will be extracted.
 * @returns {{
 *   exercise: string,
 *   setType: SetType,
 *   weight: ?number,
 *   sets: number,
 *   reps: number[],
 *   comments: string,
 * }}
 * Data object with values extracted from the exercise item's form fields.
 */
function extractExerciseItemData(item) {
  const data = {};

  const exercise = item.querySelector('input[type="text"][id^="exercise-"]');
  data.exercise = exercise ? exercise.value : '';

  const setType = item.querySelector('select[id^="set-type-"]');
  data.setType = setType ? SetType.enumValueOf(setType.value) : SetType.Work;

  const weight = item.querySelector('input[type="number"][id^="weight-"]');
  data.weight = (weight && weight.value) ? Number(weight.value) : null;

  const sets = item.querySelector('input[type="number"][id^="sets-"]');
  data.sets = sets ? Number(sets.value) : 0;

  const reps = item.querySelectorAll('input[type="number"][id^="reps-"]');
  data.reps = [];
  if (reps) {
    for (let i = 0; i < data.sets; i++) {
      data.reps.push(reps[i] ? Number(reps[i].value) : 0);
    }
  }

  const comments = item.querySelector('textarea[id^="comments-"]');
  data.comments = comments.value;

  return data;
}


/**
 * Create or remove reps divs to match the requested number of sets.
 *
 * @param {number} index - Index number of the reps div to update.
 * @param {number} setsCount - Number of sets requested.
 */
async function updateRepsItemsCount(index, setsCount) {
  const exerciseItem = getExerciseItem(index);

  if (exerciseItem) {
    const repsWrapper = exerciseItem.querySelector('.reps-wrapper');

    if (repsWrapper && Number.isInteger(setsCount) && setsCount >= 0) {
      const repsItems = repsWrapper.querySelectorAll('.reps-item');
      const repsItemsCount = Number(repsItems.length);

      if (setsCount > repsItemsCount) {
        // Create as many reps items as needed to reach the required
        // number and append them to the reps wrapper
        for (let set = repsItemsCount + 1; set <= setsCount; set++) {
          const newRepsDiv = createRepsDiv(index, set);
          repsWrapper.appendChild(newRepsDiv);
        }
      } else if (setsCount < repsItemsCount) {
        // Delete existing reps items from the end of the wrapper until
        // there's only the required number of them
        for (let set = repsItemsCount; set > setsCount; set--) {
          // Reminder: set number is 1-index, repsItems is 0-index
          repsItems[set - 1].remove();
        }
      }
    }
  }
}
