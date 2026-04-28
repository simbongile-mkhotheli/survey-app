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

    const resultsRepository = container.resultsRepository;
    const results = await resultsRepository.getResults();

    return res.status(200).json(responseFormatter.success(results));
  } catch (err) {
    next(err);
  }
}
