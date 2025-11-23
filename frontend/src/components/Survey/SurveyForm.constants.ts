/**
 * SurveyForm Constants
 *
 * Centralized constants for the SurveyForm component including form labels,
 * food options, rating configurations, and message strings. This enables:
 * - Internationalization (i18n) support
 * - Consistent messaging across the application
 * - Single source of truth for form configuration
 * - Easy maintenance and updates
 *
 * @author Survey App Team
 * @version 1.0.0
 */

/**
 * Food options available in the survey form
 */
export const FOOD_OPTIONS = [
  'Pizza',
  'Pasta',
  'Pap and Wors',
  'Other',
] as const;

/**
 * Rating scale labels corresponding to values 1-5
 * Maps from 1 (Strongly Agree) to 5 (Strongly Disagree)
 */
export const RATING_SCALE_LABELS = [
  'Strongly Agree',
  'Agree',
  'Neutral',
  'Disagree',
  'Strongly Disagree',
] as const;

/**
 * Form field labels for personal details
 */
export const FORM_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address',
  contactNumber: 'Contact Number',
  dateOfBirth: 'Date of Birth',
  foods: 'Preferred Foods',
  ratings: 'Rate Your Agreement',
  submit: 'Submit Survey',
  loading: 'Submitting...',
} as const;

/**
 * Form field placeholder text
 */
export const FORM_PLACEHOLDERS = {
  firstName: 'Enter your first name',
  lastName: 'Enter your last name',
  email: 'your.email@example.com',
  contactNumber: '+1 (555) 123-4567',
  dateOfBirth: 'Select your date of birth',
} as const;

/**
 * Form instruction and helper text
 */
export const FORM_INSTRUCTIONS = {
  foods: 'Select all foods that you prefer:',
  ratings:
    'Rate your level of agreement with each statement (1 = Strongly Agree, 5 = Strongly Disagree):',
  required: '* Required field',
} as const;

/**
 * Error messages and validation feedback
 */
export const ERROR_MESSAGES = {
  submit: {
    generic: 'Failed to submit survey. Please try again.',
    validation: 'Please correct the errors below and try again.',
    network: 'Network error. Please check your connection and try again.',
    server: 'Server error. Please try again later.',
  },
  fields: {
    firstName: {
      required: 'First name is required',
      minLength: 'First name must be at least 2 characters',
      maxLength: 'First name cannot exceed 100 characters',
      invalidFormat: 'First name contains invalid characters',
    },
    lastName: {
      required: 'Last name is required',
      minLength: 'Last name must be at least 2 characters',
      maxLength: 'Last name cannot exceed 100 characters',
      invalidFormat: 'Last name contains invalid characters',
    },
    email: {
      required: 'Email is required',
      invalid: 'Please enter a valid email address',
      maxLength: 'Email cannot exceed 255 characters',
    },
    contactNumber: {
      required: 'Contact number is required',
      invalid:
        'Phone number must include country code (+1) and have 10-15 digits',
      pattern: 'Invalid phone format',
    },
    dateOfBirth: {
      required: 'Date of birth is required',
      invalid: 'Please enter a valid date',
      tooYoung: 'You must be at least 5 years old',
      tooOld: 'Please enter a valid date of birth',
    },
    foods: {
      required: 'Please select at least one food preference',
      maxSelections: 'You can select at most 10 foods',
    },
    ratings: {
      required: 'Please rate all statements',
      invalid: 'Rating must be between 1 and 5',
    },
  },
} as const;

/**
 * Success messages for form submission
 */
export const SUCCESS_MESSAGES = {
  submitted: 'Survey submitted successfully!',
  redirect: 'Redirecting to results...',
} as const;

/**
 * Rating field definitions for the rating table
 * Each field represents a statement that users rate
 */
export const RATING_FIELDS = [
  {
    key: 'ratingMovies' as const,
    label: 'I enjoy watching movies',
    description: 'How much do you enjoy watching movies?',
  },
  {
    key: 'ratingTv' as const,
    label: 'I enjoy watching TV',
    description: 'How much do you enjoy watching TV?',
  },
  {
    key: 'ratingMusic' as const,
    label: 'I enjoy listening to music',
    description: 'How much do you enjoy listening to music?',
  },
  {
    key: 'ratingReading' as const,
    label: 'I enjoy reading books',
    description: 'How much do you enjoy reading books?',
  },
] as const;

/**
 * CSS class names for styling
 */
export const STYLE_CLASSES = {
  errorText: 'text-red-500',
  successText: 'text-green-500',
  disabledButton: 'opacity-50 cursor-not-allowed',
  focusRing: 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
} as const;
