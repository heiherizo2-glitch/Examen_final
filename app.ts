import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env';
import { asyncHandler } from './middlewares/asyncHandler';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { pool } from './db/pool';
import { authRouter } from './routes/auth';
import { studentsRouter } from './routes/students';
import { coursesRouter } from './routes/courses';
import { examsRouter } from './routes/exams';
import { examQuestionsRouter } from './routes/examQuestions';
import { questionsRouter } from './routes/questions';
import { myRouter } from './routes/my';


export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: false }));
  app.use(express.json({ limit: '1mb' }));


  app.get(
    '/api/health',
    asyncHandler(async (_req, res) => {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'ok' });
    })
  );


  app.use('/api/auth', authRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/exams', examQuestionsRouter);
  app.use('/api/exams', examsRouter);
  app.use('/api/questions', questionsRouter);
  app.use('/api/my', myRouter);


  app.use(notFoundHandler);


  app.use(errorHandler);

  return app;
}
