// backend/src/server.ts
import dotenv from 'dotenv';

// Load environment variables before app startup
dotenv.config();

import cors from 'cors';
import express from 'express';

import resultsRouter from '@/routes/results';
import surveyRouter from '@/routes/survey';
import { errorHandler } from '@/middleware/errorHandler';

const app = express();
const port = Number(process.env.PORT ?? 5000);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
app.use('/api/survey', surveyRouter);
app.use('/api/results', resultsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

// Start the server only when run directly and not during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
