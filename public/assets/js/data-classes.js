import { NBSP } from '/assets/js/utils.js';
'use strict';


/**
 * A training session done at a specific date and time, containing
 * the list of exercises done.
 */
export class TrainingSession {

  /**
   * @param {string} date - Date of the training session in YYYY-MM-DD format.
   * @param {string} time - Time of the training session in HH:mm format.
   * @param {ExerciseItem[]} exercises
   * List of exercises done in the training session, in the order they were
   * done.
   * @param {string} [shortTitle=''] - Short title for the training session.
   * @param {?number} [duration=null]
   * Duration of the training session in minutes.
   * @param {?number} [bodyweight=null]
   * Weight of the person at the time of the training session, in kilograms.
   * @param {string} [comments='']
   * Comments relevant to the training session in general.
   */
  constructor(
    date,
    time,
    exercises,
    shortTitle = '',
    duration = null,
    bodyweight = null,
    comments = ''
  ) {
    this.date = date;
    this.time = time;
    this.exercises = exercises;
    this.shortTitle = shortTitle;
    this.duration = duration ? Number(duration) : null;
    this.bodyweight = bodyweight ? Number(bodyweight) : null;
    this.comments = comments;
  }

  /**
   * Date object constructed with the training session's date and time.
   */
  get dateTime() {
    return new Date(this.date + 'T' + this.time);
  }

  /**
   * Full title combining the date, time and (optional) short title of
   * the training session.
   */
  get fullTitle() {
    if (this.shortTitle) {
      return `${this.date}${NBSP}${this.time}: ${this.shortTitle}`;
    } else {
      return `${this.date}${NBSP}${this.time}`;
    }
  }

  /**
   * Checks if all the required fields of the training session are set
   * and all fields are of the correct type.
   * @returns {boolean} True if the training session is valid, false otherwise.
   */
  isValid() {
    // Date and time are required and must be valid
    if (!(this.date & this.time)
        || this.dateTime.toString() === 'Invalid Date') {
      return false;
    }

    // Exercises must be a list of at least one element, and all
    // elements must be valid ExerciseItem objects
    if (this.exercises && this.exercises instanceof Array
        && this.exercises.length) {
      let allItemsValid = this.exercises.every(item => {
          return item instanceof ExerciseItem && item.isValid();
      });

      if (!allItemsValid) {
        return false;
      }
    } else {
      return false;
    }

    // Short title, if set, must be a string and its length must not
    // exceed 50 characters
    if (this.shortTitle) {
      if (!(this.shortTitle instanceof String) || this.shortTitle.length > 50) {
        return false;
      }
    }

    // Duration, if set, must be a non-negative integer
    if (this.duration) {
      if (!Number.isInteger(this.duration) || this.duration < 0) {
        return false;
      }
    }

    // Bodyweight, if set, must be a non-negative integer
    if (this.bodyweight) {
      if (!Number.isInteger(this.bodyweight) || this.bodyweight < 0) {
        return false;
      }
    }

    // Comments, if set, must be a string and its length must not
    // exceed 280 characters
    if (this.comments) {
      if (!this.comments instanceof String || this.comments.length > 50) {
        return false;
      }
    }

    return true;
  }
}


/**
 * An exercise item in a training session.
 */
export class ExerciseItem {

  /**
   * @param {string} exercise - Name of the exercise.
   * @param {SetType} setType - Type of exercise sets: work or warmup.
   * @param {number} sets - Number of sets done.
   * @param {number[]} reps - List of reps done on each set, in order.
   * @param {?number} [weight=null] - Weight used (if any) in kilograms.
   * @param {string} [comments] - Comments relevant to the exercise sets.
   */
  constructor(exercise, setType, sets, reps, weight = null, comments = '') {
    this.exercise = exercise;
    this.setType = setType;
    this.sets = Number(sets);
    this.reps = reps;
    this.weight = weight ? Number(weight) : null;
    this.comments = comments;
  }

  /**
   * Checks if all the required fields of the exercise item are set and
   * all fields are of the correct type.
   * @returns {boolean} True if the exercise item is valid, false otherwise.
   */
  isValid() {
    // Exercise name is required, must be a string, and its length must
    // not exceed 50 characters
    if (!this.exercise || !(this.exercise instanceof String)
        || this.exercise.length > 50) {
      return false;
    }

    // Set type is required and must be a SetType instance
    if (!this.setType || !(this.setType instanceof SetType)) {
      return false;
    }

    // Sets number is required and must be a non-negative integer
    if (!Number.isInteger(this.sets) || this.sets < 0) {
      return false;
    }

    // Reps list must be an array with a length equal to the number of
    // sets, and all elements must be integers greater than zero
    if (this.reps && this.reps instanceof Array
        && this.reps.length === this.sets) {
      let allItemsValid = this.reps.every(item => {
          let repNumber = Number(item);
          return Number.isInteger(repNumber) && repNumber > 0;
      });

      if (!allItemsValid) {
        return false;
      }
    } else {
      return false;
    }

    // Weight, if set, must be a non-negative number
    if (this.weight) {
      if (Number.isNaN(this.weight) || this.weight < 0) {
        return false;
      }
    }

    // Comments, if set, must be a string and its length must not
    // exceed 140 characters
    if (this.comments) {
      if (!(this.comments instanceof String) || this.comments.length > 140) {
        return false;
      }
    }

    return true;
  }
}


/**
 * Type of exercise set: work or warmup.
 */
export class SetType {
  // Enum pattern inspired by Dr. Axel Rauschmayer:
  // https://2ality.com/2020/01/enum-pattern.html

  static Work = new SetType('work');
  static WarmUp = new SetType('warmup');

  constructor(name) {
    this.name = name;
  }

  toString() {
    return `SetType.${this.name}`;
  }

  /**
   * Get the set type with the given name, or null if not a valid set type name.
   * @param {string} name
   * @returns {?SetType} A SetType or null.
   * @static
   */
  static enumValueOf(name) {
    if (name === 'work') {
      return SetType.Work;
    } else if (name === 'warmup') {
      return SetType.WarmUp;
    } else {
      return null;
    }
  }
}
