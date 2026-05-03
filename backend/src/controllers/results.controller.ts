import type { Request, Response, NextFunction } from 'express';
import { container } from '@/container';
import { responseFormatter } from '@/utils/response';

export async function handleGetSurveyResults(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const results = await container.resultsRepository.getResults();
    return res.status(200).json(responseFormatter.success(results));
  } catch (err) {
    next(err);
  }
}
