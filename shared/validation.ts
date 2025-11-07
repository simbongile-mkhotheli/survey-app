import { z } from 'zod';

// Security: Prevent XSS and injection attacks
const sanitizeString = (val: string) => val.trim().replace(/[<>]/g, '');

// Security: Maximum lengths to prevent DOS attacks
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_FOOD_NAME_LENGTH = 50;

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
  firstName: z.string()
    .min(1, 'First name is required')
    .max(MAX_NAME_LENGTH, `First name must be ${MAX_NAME_LENGTH} characters or less`)
    .transform(sanitizeString),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(MAX_NAME_LENGTH, `Last name must be ${MAX_NAME_LENGTH} characters or less`)
    .transform(sanitizeString),
  email: z.string()
    .email('Invalid email address')
    .max(MAX_EMAIL_LENGTH, `Email must be ${MAX_EMAIL_LENGTH} characters or less`)
    .toLowerCase()
    .trim(),
  contactNumber: z.string()
    .regex(/^\+?\d{10,15}$/, 'Invalid contact number')
    .max(MAX_PHONE_LENGTH, 'Contact number too long'),
  dateOfBirth: z.string().refine(validateAgeString, {
    message: 'Date of birth must correspond to an age between 5 and 120 years',
  }),
  foods: z.array(
    z.string()
      .min(1, 'Food name cannot be empty')
      .max(MAX_FOOD_NAME_LENGTH, `Food name must be ${MAX_FOOD_NAME_LENGTH} characters or less`)
      .transform(sanitizeString)
  ).min(1, 'Select at least one food')
   .max(10, 'Maximum 10 foods allowed'),
  ratingMovies: ratingStringField(),
  ratingRadio: ratingStringField(),
  ratingEatOut: ratingStringField(),
  ratingTV: ratingStringField(),
});

export type SurveyFormValues = z.infer<typeof SurveyFormSchema>;

// Backend payload schema (what the API expects — ratings are numbers)
export const SurveyPayloadSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(MAX_NAME_LENGTH, `First name must be ${MAX_NAME_LENGTH} characters or less`)
    .transform(sanitizeString),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(MAX_NAME_LENGTH, `Last name must be ${MAX_NAME_LENGTH} characters or less`)
    .transform(sanitizeString),
  email: z.string()
    .email('Invalid email address')
    .max(MAX_EMAIL_LENGTH, `Email must be ${MAX_EMAIL_LENGTH} characters or less`)
    .toLowerCase()
    .trim(),
  contactNumber: z.string()
    .regex(/^\+?\d{10,15}$/, 'Invalid contact number')
    .max(MAX_PHONE_LENGTH, 'Contact number too long'),
  dateOfBirth: z.string().refine(validateAgeString, {
    message: 'Date of birth must correspond to an age between 5 and 120 years',
  }),
  foods: z.array(
    z.string()
      .min(1, 'Food name cannot be empty')
      .max(MAX_FOOD_NAME_LENGTH, `Food name must be ${MAX_FOOD_NAME_LENGTH} characters or less`)
      .transform(sanitizeString)
  ).min(1, 'Select at least one food')
   .max(10, 'Maximum 10 foods allowed'),
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
