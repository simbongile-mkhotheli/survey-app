// backend/src/routes/survey.ts

import { Router } from 'express';
import { SurveySchema } from '../validation/validation';
import { handleCreateSurvey } from '../controllers/surveyController';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// Validate incoming body with Zod, then pass to controller
router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      SurveySchema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  },
  handleCreateSurvey,
);

export default router;
