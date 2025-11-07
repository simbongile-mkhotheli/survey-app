import { z } from 'zod';

const isRatingString = (val: string) => {
  const n = Number(val);
  return Number.isInteger(n) && n >= 1 && n <= 5;
};
const isRatingNumber = (val: number) => Number.isInteger(val) && val >= 1 && val <= 5;
const ratingError = { message: 'Please select a rating from 1–5' };

function validateAgeString(val: string) {
  const dob = new Date(val);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age >= 5 && age <= 120;
}

// Frontend form schema (values produced by form inputs — ratings are strings)
export const SurveyFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().regex(/^\+?\d{10,15}$/, 'Invalid contact number'),
  dateOfBirth: z.string().refine(validateAgeString, {
    message: 'Date of birth must correspond to an age between 5 and 120 years',
  }),
  foods: z.array(z.string()).min(1, 'Select at least one food'),
  ratingMovies: z.string().refine(isRatingString, ratingError),
  ratingRadio: z.string().refine(isRatingString, ratingError),
  ratingEatOut: z.string().refine(isRatingString, ratingError),
  ratingTV: z.string().refine(isRatingString, ratingError),
});

export type SurveyFormValues = z.infer<typeof SurveyFormSchema>;

// Backend payload schema (what the API expects — ratings are numbers)
export const SurveyPayloadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().regex(/^\+?\d{10,15}$/, 'Invalid contact number'),
  dateOfBirth: z.string().refine(validateAgeString, {
    message: 'Date of birth must correspond to an age between 5 and 120 years',
  }),
  foods: z.array(z.string()).min(1, 'Select at least one food'),
  ratingMovies: z.number().int().refine(isRatingNumber, ratingError),
  ratingRadio: z.number().int().refine(isRatingNumber, ratingError),
  ratingEatOut: z.number().int().refine(isRatingNumber, ratingError),
  ratingTV: z.number().int().refine(isRatingNumber, ratingError),
});

export type SurveyInput = z.infer<typeof SurveyPayloadSchema>;

// Helper to convert form values (strings) into payload (numbers)
export function formToPayload(data: SurveyFormValues): SurveyInput {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    contactNumber: data.contactNumber,
    dateOfBirth: data.dateOfBirth,
    foods: data.foods,
    ratingMovies: Number(data.ratingMovies),
    ratingRadio: Number(data.ratingRadio),
    ratingEatOut: Number(data.ratingEatOut),
    ratingTV: Number(data.ratingTV),
  };
}
