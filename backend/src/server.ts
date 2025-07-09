// backend/src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import surveyRouter from './routes/survey';
import resultsRouter from './routes/results';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Build an array of allowed origins
const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow non-browser tools (Postman, curl)
      if (!incomingOrigin) return callback(null, true);
      if (origins.includes(incomingOrigin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS denied: ${incomingOrigin}`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  })
);


app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
  })
);

app.use('/api/survey', surveyRouter);
app.use('/api/results', resultsRouter);
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
