import type { Request, Response, NextFunction } from 'express';
import type { SurveyResultsDTO } from '../types/resultsDTO';
import { getSurveyResults } from '../services/resultsService';
import { ResultsQuerySchema } from '../validation/validation';

/**
 * Controller to handle GET /api/results
 * - Validates query parameters (none currently)
 * - Fetches aggregated survey results
 */
export async function handleGetSurveyResults(
  req: Request,
  res: Response<SurveyResultsDTO>,
  next: NextFunction
) {
  try {
    // Ensures no unexpected query parameters are passed
    ResultsQuerySchema.parse(req.query);

    const results = await getSurveyResults();
    return res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}
