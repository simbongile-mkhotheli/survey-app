import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';

import resultsRouter from '@/routes/results';
import surveyRouter from '@/routes/survey';
import { errorHandler } from '@/middleware/errorHandler';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/survey', surveyRouter);
app.use('/api/results', resultsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
