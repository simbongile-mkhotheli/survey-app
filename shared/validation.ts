import { z } from 'zod';

const isRatingString = (val: string) => {
  const n = Number(val);
  return Number.isInteger(n) && n >= 1 && n <= 5;
};
const isRatingNumber = (val: number) => Number.isInteger(val) && val >= 1 && val <= 5;
const ratingError = { message: 'Please select a rating from 1–5' };

// Helper to create string-based rating field
const ratingStringField = () => z.string().refine(isRatingString, ratingError);

// Helper to create number-based rating field
const ratingNumberField = () => z.number().int().refine(isRatingNumber, ratingError);

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
  ratingMovies: ratingStringField(),
  ratingRadio: ratingStringField(),
  ratingEatOut: ratingStringField(),
  ratingTV: ratingStringField(),
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
  ratingMovies: ratingNumberField(),
  ratingRadio: ratingNumberField(),
  ratingEatOut: ratingNumberField(),
  ratingTV: ratingNumberField(),
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
