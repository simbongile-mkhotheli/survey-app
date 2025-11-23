/**
 * Results Display Constants
 * =========================
 * Centralized labels and UI text for Results component
 * Enables easy internationalization and consistent messaging
 */

export const RESULTS_LABELS = {
  // Main heading
  HEADING: 'Survey Results',

  // Survey count section
  TOTAL_SURVEYS: 'Total number of surveys',

  // Age statistics section
  AVERAGE_AGE: 'Average Age',
  OLDEST_PARTICIPANT: 'Oldest person who participated',
  YOUNGEST_PARTICIPANT: 'Youngest person who participated',

  // Food preferences section
  PIZZA_PREFERENCE: '🍕 Percentage who like Pizza',
  PASTA_PREFERENCE: '🍝 Percentage who like Pasta',
  PAP_WORS_PREFERENCE: '🍖 Percentage who like Pap and Wors',

  // Rating preferences section
  MOVIES_RATING: '🎬 I like to watch movies',
  RADIO_RATING: '📻 I like to listen to radio',
  EATOUT_RATING: '🍽️ I like to eat out',
  TV_RATING: '📺 I like to watch TV',
} as const;

export const RESULTS_LOADING = {
  MESSAGE: 'Loading survey results...',
} as const;

export const RESULTS_ERROR = {
  TITLE: 'Failed to Load Results',
  GENERIC_MESSAGE: 'Unable to load survey results. Please try again.',
  RETRY_BUTTON: 'Retry',
} as const;

export const RESULTS_EMPTY = {
  TITLE: 'No Data',
  MESSAGE:
    'No survey responses available yet. Be the first to submit a survey!',
  SEVERITY: 'info',
} as const;

export const RESULTS_FORMATTING = {
  // Unit suffixes
  YEARS_UNIT: 'years',
  PERCENT_SUFFIX: '%',

  // Default values
  NA_TEXT: 'N/A',
  SPACER_HEIGHT: '2rem',
} as const;
