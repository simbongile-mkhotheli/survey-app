export const FOOD_OPTIONS = [
  'Pizza',
  'Pasta',
  'Pap and Wors',
  'Other',
] as const;

export const FOOD_BADGES: Record<(typeof FOOD_OPTIONS)[number], string> = {
  Pizza: '🍕',
  Pasta: '🍝',
  'Pap and Wors': '🌭',
  Other: '❓',
};

export const RATING_OPTIONS = [
  { value: '1', label: 'Strongly Disagree' },
  { value: '2', label: 'Disagree' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Agree' },
  { value: '5', label: 'Strongly Agree' },
] as const;

export const RATING_FIELDS = [
  {
    label: 'I like to watch movies',
    fieldName: 'ratingMovies',
  },
  {
    label: 'I like to listen to radio',
    fieldName: 'ratingRadio',
  },
  {
    label: 'I like to eat out',
    fieldName: 'ratingEatOut',
  },
  {
    label: 'I like to watch TV',
    fieldName: 'ratingTV',
  },
] as const;
