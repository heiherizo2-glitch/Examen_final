import { Router } from 'express';
import { authGuard } from '../Security/authGuard';
import { roleGuard } from '../Security/roleGuard';
import * as myExamController from '../Controller/myExamController';


export const myRouter = Router();
myRouter.use(authGuard, roleGuard('STUDENT'));

myRouter.get('/exams', myExamController.listAvailableExams);
myRouter.get('/exams/:id', myExamController.getExamDetail);
myRouter.post('/exams/:id/submit', myExamController.submitExam);
myRouter.get('/results', myExamController.listMyResults);