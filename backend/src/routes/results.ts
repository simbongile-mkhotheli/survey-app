import { Router } from 'express';
import { ResultsQuerySchema } from '@/validation/validation';
import { handleGetSurveyResults } from '@/controllers/resultsController';

/**
 * @swagger
 * /api/results:
 *   get:
 *     tags:
 *       - Results
 *     summary: Get aggregated survey results
 *     description: |
 *       Retrieve comprehensive analytics and aggregated data from all survey responses.
 *       
 *       ## Data Included
 *       - **Total Count**: Number of survey responses collected
 *       - **Age Statistics**: Average, minimum, and maximum age of respondents
 *       - **Food Preferences**: Percentage distribution of food choices
 *       - **Average Ratings**: Mean ratings across all categories (movies, radio, eating out, TV)
 *       
 *       ## Data Processing
 *       - Age is calculated from date of birth at time of submission
 *       - Food percentages are based on individual selections (respondents can choose multiple)
 *       - Ratings are averaged and rounded to 1 decimal place
 *       - Null values indicate no data available (e.g., no responses yet)
 *       
 *       ## Caching
 *       Results are computed in real-time. Consider implementing caching for production use.
 *     responses:
 *       200:
 *         description: Successfully retrieved survey results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultsData'
 *             examples:
 *               with_data:
 *                 summary: Results with survey data
 *                 description: Example response when surveys have been submitted
 *                 value:
 *                   totalCount: 150
 *                   age:
 *                     avg: 28.5
 *                     min: 18
 *                     max: 65
 *                   foodPercentages:
 *                     pizza: 45.5
 *                     pasta: 30.2
 *                     papAndWors: 24.3
 *                   avgRatings:
 *                     movies: 4.2
 *                     radio: 3.1
 *                     eatOut: 4.8
 *                     tv: 3.5
 *               no_data:
 *                 summary: Results with no survey data
 *                 description: Example response when no surveys have been submitted yet
 *                 value:
 *                   totalCount: 0
 *                   age:
 *                     avg: null
 *                     min: null
 *                     max: null
 *                   foodPercentages:
 *                     pizza: null
 *                     pasta: null
 *                     papAndWors: null
 *                   avgRatings:
 *                     movies: null
 *                     radio: null
 *                     eatOut: null
 *                     tv: null
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

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
