// backend/src/interfaces/service.interface.ts
// backend/src/interfaces/service.interface.ts

export interface SurveyResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: Date;
  foods: string;
  ratingMovies: number;
  ratingRadio: number;
  ratingEatOut: number;
  ratingTV: number;
  submittedAt: Date;
}
