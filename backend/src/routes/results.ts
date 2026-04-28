import { Router } from 'express';
import { ResultsQuerySchema } from '@/validation/validation';
import { handleGetSurveyResults } from '@/controllers/results.controller';
import { validateQuery } from '@/middleware/zodValidator';

const router = Router();

router.get('/', validateQuery(ResultsQuerySchema), handleGetSurveyResults);

export default router;
