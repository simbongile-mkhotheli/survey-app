import type { Request, Response, NextFunction } from 'express';
import { Container } from '@/container';
import { responseFormatter } from '@/utils/response';
import { ResultsQuerySchema } from '@/validation/validation';

/**
 * Controller to handle GET /api/results
 * - Validates query parameters (none currently)
 * - Fetches aggregated survey results following SRP and DIP
 * - Returns standardized success response via responseFormatter
 */
export async function handleGetSurveyResults(
  req: Request,
  res: Response,
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

    return res.status(200).json(responseFormatter.success(results));
  } catch (err) {
    next(err);
  }
}
