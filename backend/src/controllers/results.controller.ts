import type { Request, Response, NextFunction } from 'express';
import { container } from '@/container';
import { responseFormatter } from '@/utils/response';
import { ResultsQuerySchema } from '@/validation/validation';

export async function handleGetSurveyResults(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    ResultsQuerySchema.parse(req.query);

    const resultsService = container.resultsService;

    // Propagate request ID through service layer for distributed tracing and debugging
    const requestId = req.headers['x-request-id'] as string;
    const results = await resultsService.getResults(requestId);

    return res.status(200).json(responseFormatter.success(results));
  } catch (err) {
    next(err);
  }
}
