import { Router } from 'express';
import { SurveySchema } from '@/validation/validation';
import { handleCreateSurvey } from '@/controllers/survey.controller';
import { validateBody } from '@/middleware/zodValidator';

const router = Router();

router.post('/', validateBody(SurveySchema), handleCreateSurvey);

export default router;
