import type { Request, Response, NextFunction } from 'express';
import { Container } from '@/container';
import { responseFormatter } from '@/utils/response';
import { ResultsQuerySchema } from '@/validation/validation';

/**
 * Handle GET /api/results request with validation and dependency injection
 * Decouples HTTP layer from business logic (service layer patterns)
 */
export async function handleGetSurveyResults(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Fail fast on invalid inputs to prevent downstream processing
    ResultsQuerySchema.parse(req.query);

    const container = Container.getInstance();
    const resultsService = container.resultsService;

    // Propagate request ID through service layer for distributed tracing and debugging
    const requestId = req.headers['x-request-id'] as string;
    const results = await resultsService.getResults(requestId);

    return res.status(200).json(responseFormatter.success(results));
  } catch (err) {
    next(err);
  }
}
