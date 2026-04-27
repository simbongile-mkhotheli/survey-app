import type { Request, Response, NextFunction } from 'express';
import { container } from '@/container';
import { responseFormatter } from '@/utils/response';
import type { SurveyInput } from '@/validation/validation';
import type { ApiSuccessResponse } from '@/utils/response';

export async function handleCreateSurvey(
  req: Request<{}, ApiSuccessResponse<{ id: number }>, SurveyInput>,
  res: Response<ApiSuccessResponse<{ id: number }>>,
  next: NextFunction,
) {
  try {
    const surveyService = container.surveyService;

    const data = req.body;
    const created = await surveyService.createSurvey(data);
    return res.status(201).json(responseFormatter.success({ id: created.id }));
  } catch (err) {
    next(err);
  }
}
