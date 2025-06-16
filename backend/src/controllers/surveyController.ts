import type { Request, Response, NextFunction } from 'express';
import { createSurvey } from '../services/surveyService';
import type { SurveyInput } from '../validation/validation';

/**
 * Controller to handle POST /api/survey
 * - Expects validated SurveyInput in req.body
 * - Delegates to the service layer to insert a new survey, then returns the created record’s ID
 */
export async function handleCreateSurvey(
  req: Request<{}, { id: number }, SurveyInput>,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  try {
    const data = req.body;
    const created = await createSurvey(data);
    return res.status(201).json({ id: created.id });
  } catch (err) {
    next(err);
  }
}
