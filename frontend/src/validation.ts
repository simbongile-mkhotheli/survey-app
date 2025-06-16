import { z } from 'zod';

const isRating = (val: string) => {
  const n = Number(val);
  return Number.isInteger(n) && n >= 1 && n <= 5;
};
const ratingError = { message: 'Please select a rating from 1–5' };

export const SurveySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().regex(
    /^\+?\d{7,15}$/, 
    'Invalid contact number'
  ),

  dateOfBirth: z
    .string()
    .refine(val => {
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
    }, {
      message: 'Date of birth must correspond to an age between 5 and 120 years',
    }),

  foods: z.array(z.string()).min(1, 'Select at least one food'),

  ratingMovies: z.string().refine(isRating, ratingError),
  ratingRadio: z.string().refine(isRating, ratingError),
  ratingEatOut: z.string().refine(isRating, ratingError),
  ratingTV: z.string().refine(isRating, ratingError),
});

export type SurveyFormValues = z.infer<typeof SurveySchema>;
