import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'express-async-errors'; // catch async errors automatically

import surveyRouter from './routes/survey';
import resultsRouter from './routes/results';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Apply CORS with preflight cache
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600, // 10 minutes
  })
);

// JSON body parsing
app.use(express.json());

// Rate limiting: max 100 requests per IP per 15 minutes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
  })
);

// API routes
app.use('/api/survey', surveyRouter);
app.use('/api/results', resultsRouter);

// 404 for unmatched routes
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Global error handler (last middleware)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

