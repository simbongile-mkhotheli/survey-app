export const RESULTS_LABELS = {
  HEADING: 'Survey Results',
  PIZZA_PREFERENCE: '🍕 Percentage who like Pizza',
  PASTA_PREFERENCE: '🍝 Percentage who like Pasta',
  PAP_WORS_PREFERENCE: '🍖 Percentage who like Pap and Wors',
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
} as const;

export const RESULTS_EMPTY = {
  TITLE: 'No Data',
  MESSAGE:
    'No survey responses available yet. Be the first to submit a survey.',
} as const;
