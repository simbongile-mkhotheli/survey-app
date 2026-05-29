import { formToPayload, type SurveyFormValues } from '@/validation';

import { supabase, type SurveyResponseInsert } from './supabaseClient';

export async function submitSurvey(
  data: SurveyFormValues,
): Promise<{ id: number }> {
  const payload = formToPayload(data);
  const row: SurveyResponseInsert = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    contactNumber: payload.contactNumber,
    dateOfBirth: payload.dateOfBirth,
    foods: payload.foods.join(','),
    ratingMovies: payload.ratingMovies,
    ratingRadio: payload.ratingRadio,
    ratingEatOut: payload.ratingEatOut,
    ratingTV: payload.ratingTV,
  };

  const { error } = await supabase.from('SurveyResponse').insert(row);

  if (error) {
    throw new Error(error.message);
  }

  return { id: 0 };
}
