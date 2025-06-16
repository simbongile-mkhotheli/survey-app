import { Router } from 'express';
import { ResultsQuerySchema } from '../validation/validation';
import { handleGetSurveyResults } from '../controllers/resultsController';

const router = Router();

router.get(
  '/',
  (req, _, next) => {
    try {
      ResultsQuerySchema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  },
  handleGetSurveyResults,
);

export default router;
