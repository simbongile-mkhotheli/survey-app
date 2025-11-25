/**
 * SurveyForm Utilities
 *
 * Helper functions and utilities for form configuration, validation helpers,
 * and reusable form logic. This enables:
 * - Decoupled form logic from component rendering
 * - Testable utility functions
 * - Reusable utilities across multiple form components
 * - Clear separation of concerns
 *
 * @author Survey App Team
 * @version 1.0.0
 */

import {
  FOOD_OPTIONS,
  RATING_FIELDS,
  RATING_SCALE_LABELS,
} from './SurveyForm.constants';

/**
 * Gets all available food options for selection
 *
 * @returns {readonly string[]} Array of food option strings
 *
 * @example
 * const foods = getFoodOptions();
 * // Returns: ['Pizza', 'Pasta', 'Pap and Wors', 'Other']
 */
export const getFoodOptions = () => FOOD_OPTIONS;

/**
 * Gets all rating fields for the rating table
 *
 * @returns {readonly Array} Array of rating field objects with key, label, and description
 *
 * @example
 * const fields = getRatingFields();
 * // Returns: [
 * //   { key: 'ratingMovies', label: 'I enjoy watching movies', ... },
 * //   { key: 'ratingTv', label: 'I enjoy watching TV', ... },
 * //   ...
 * // ]
 */
export const getRatingFields = () => RATING_FIELDS;

/**
 * Gets the rating scale labels (Strongly Agree → Strongly Disagree)
 *
 * @returns {readonly string[]} Array of rating scale labels
 *
 * @example
 * const labels = getRatingScaleLabels();
 * // Returns: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
 */
export const getRatingScaleLabels = () => RATING_SCALE_LABELS;

/**
 * Gets the label for a specific rating value (1-5)
 *
 * @param {number} rating - The rating value (1-5, where 1 = Strongly Agree, 5 = Strongly Disagree)
 * @returns {string} The corresponding label string
 * @throws {Error} If rating is not in range 1-5
 *
 * @example
 * getRatingLabel(1); // Returns: 'Strongly Agree'
 * getRatingLabel(3); // Returns: 'Neutral'
 * getRatingLabel(5); // Returns: 'Strongly Disagree'
 */
export const getRatingLabel = (rating: number): string => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error(
      `Invalid rating value: ${rating}. Must be an integer between 1 and 5.`,
    );
  }
  return RATING_SCALE_LABELS[rating - 1];
};

/**
 * Checks if a food is valid (exists in FOOD_OPTIONS)
 *
 * @param {string} food - The food name to validate
 * @returns {boolean} True if food is a valid option, false otherwise
 *
 * @example
 * isValidFood('Pizza'); // Returns: true
 * isValidFood('InvalidFood'); // Returns: false
 */
export const isValidFood = (food: string): boolean => {
  // Type guard: ensure food is a string in FOOD_OPTIONS array
  return typeof food === 'string' && FOOD_OPTIONS.includes(food);
};

/**
 * Validates a food selection array
 *
 * @param {string[]} foods - Array of food selections
 * @returns {Object} Validation result with isValid flag and error message if invalid
 * @returns {boolean} result.isValid - True if foods array is valid
 * @returns {string|null} result.error - Error message if invalid, null if valid
 *
 * @example
 * validateFoodSelection(['Pizza', 'Pasta']);
 * // Returns: { isValid: true, error: null }
 *
 * validateFoodSelection([]);
 * // Returns: { isValid: false, error: 'At least one food must be selected' }
 *
 * validateFoodSelection(['Pizza', 'InvalidFood']);
 * // Returns: { isValid: false, error: 'Invalid food selection' }
 */
export const validateFoodSelection = (
  foods: string[],
): { isValid: boolean; error: string | null } => {
  if (!Array.isArray(foods)) {
    return { isValid: false, error: 'Foods must be an array' };
  }

  if (foods.length === 0) {
    return { isValid: false, error: 'At least one food must be selected' };
  }

  if (foods.length > 10) {
    return { isValid: false, error: 'Maximum 10 foods can be selected' };
  }

  const invalidFoods = foods.filter((food) => !isValidFood(food));
  if (invalidFoods.length > 0) {
    return {
      isValid: false,
      error: `Invalid food selection: ${invalidFoods.join(', ')}`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a rating value
 *
 * @param {number} rating - The rating value to validate
 * @returns {boolean} True if rating is valid (1-5), false otherwise
 *
 * @example
 * isValidRating(1); // Returns: true
 * isValidRating(3); // Returns: true
 * isValidRating(5); // Returns: true
 * isValidRating(6); // Returns: false
 * isValidRating(0); // Returns: false
 */
export const isValidRating = (
  rating: number | string | null | undefined,
): boolean => {
  if (rating == null) return false;
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

/**
 * Validates all rating fields to ensure each has a valid rating
 *
 * @param {Object} ratings - Object with rating field keys as properties
 * @returns {Object} Validation result with isValid flag and invalid fields
 * @returns {boolean} result.isValid - True if all ratings are valid
 * @returns {string[]} result.invalidFields - Array of field keys with invalid ratings
 *
 * @example
 * validateAllRatings({ ratingMovies: '1', ratingTv: '3', ratingMusic: '5', ratingReading: '2' });
 * // Returns: { isValid: true, invalidFields: [] }
 *
 * validateAllRatings({ ratingMovies: '1', ratingTv: null, ratingMusic: '5', ratingReading: '2' });
 * // Returns: { isValid: false, invalidFields: ['ratingTv'] }
 */
export const validateAllRatings = (
  ratings: Record<string, unknown>,
): {
  isValid: boolean;
  invalidFields: string[];
} => {
  const invalidFields = Object.entries(ratings)
    .filter(([, value]) => !isValidRating(value))
    .map(([key]) => key);

  return {
    isValid: invalidFields.length === 0,
    invalidFields,
  };
};

/**
 * Converts food selection to display string (comma-separated)
 *
 * @param {string[]} foods - Array of selected foods
 * @returns {string} Comma-separated food string
 *
 * @example
 * foodsToString(['Pizza', 'Pasta']); // Returns: 'Pizza, Pasta'
 */
export const foodsToString = (foods: string[]): string => {
  return foods.join(', ');
};

/**
 * Formats an error message for display, categorizing by error type
 *
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 *
 * @example
 * formatErrorMessage('Network error');
 * // Returns: 'Network error. Please check your connection and try again.'
 *
 * formatErrorMessage(new Error('Validation failed'));
 * // Returns: 'Validation failed. Please correct the errors below and try again.'
 */
export const formatErrorMessage = (error: Error | string): string => {
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.toLowerCase().includes('validation')) {
      return 'Please correct the errors below and try again.';
    }
    return error;
  }

  const message = error.message || '';
  if (message.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (message.toLowerCase().includes('validation')) {
    return 'Please correct the errors below and try again.';
  }

  return message || 'Failed to submit survey. Please try again.';
};
