import { createClient } from '@supabase/supabase-js';

import { config } from '@/constants/appConfig';

export type SurveyResponseRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  foods: string;
  ratingMovies: number;
  ratingRadio: number;
  ratingEatOut: number;
  ratingTV: number;
  submittedAt: string;
};

export type SurveyResponseInsert = Omit<
  SurveyResponseRow,
  'id' | 'submittedAt'
>;

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
);
