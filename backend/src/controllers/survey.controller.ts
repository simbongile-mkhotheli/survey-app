import type { Request, Response, NextFunction } from 'express';
import { Container } from '@/container';
import type { SurveyInput } from '@/validation/validation';

/**
 * Controller to handle POST /api/survey
 * - Expects validated SurveyInput in req.body
 * - Delegates to the service layer following SRP and DIP
 */
export async function handleCreateSurvey(
  req: Request<{}, { id: number }, SurveyInput>,
  res: Response<{ id: number }>,
  next: NextFunction,
) {
  try {
    const container = Container.getInstance();
    const surveyService = container.surveyService;

    const data = req.body;
    const created = await surveyService.createSurvey(data);
    return res.status(201).json({ id: created.id });
  } catch (err) {
    next(err);
  }
}
