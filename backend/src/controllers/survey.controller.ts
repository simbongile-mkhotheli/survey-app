import type { Request, Response, NextFunction } from 'express';
import { Container } from '@/container';
import { responseFormatter } from '@/utils/response';
import type { SurveyInput } from '@/validation/validation';
import type { ApiSuccessResponse } from '@/utils/response';

/**
 * Controller to handle POST /api/survey
 * - Expects validated SurveyInput in req.body
 * - Delegates to the service layer following SRP and DIP
 * - Returns standardized success response via responseFormatter
 */
export async function handleCreateSurvey(
  req: Request<{}, ApiSuccessResponse<{ id: number }>, SurveyInput>,
  res: Response<ApiSuccessResponse<{ id: number }>>,
  next: NextFunction,
) {
  try {
    const container = Container.getInstance();
    const surveyService = container.surveyService;

    const data = req.body;
    const created = await surveyService.createSurvey(data);
    return res.status(201).json(responseFormatter.success({ id: created.id }));
  } catch (err) {
    next(err);
  }
}
