import type { Request, Response, NextFunction } from 'express';
import type { SurveyResultsDTO } from '@/types/resultsDTO';
import { Container } from '@/container';
import { ResultsQuerySchema } from '@/validation/validation';

/**
 * Controller to handle GET /api/results
 * - Validates query parameters (none currently)
 * - Fetches aggregated survey results following SRP and DIP
 */
export async function handleGetSurveyResults(
  req: Request,
  res: Response<SurveyResultsDTO>,
  next: NextFunction,
) {
  try {
    // Ensures no unexpected query parameters are passed
    ResultsQuerySchema.parse(req.query);

    const container = Container.getInstance();
    const resultsService = container.resultsService;

    // Pass request ID for performance tracking
    const requestId = req.headers['x-request-id'] as string;
    const results = await resultsService.getResults(requestId);

    return res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}
