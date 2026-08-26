import { Request, Response } from 'express';
import { attemptService } from '../Service/attemptService';
import { attemptRepo } from '../Repositorie/attemptRepository';

export const listAvailableExams = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.sub; 
        const exams = await attemptService.listAvailableExams(studentId);
        if (exams.length === 0) {
            return res.status(200).json({ message: "Aucun examen n'est ouvert pour le moment." });
        }
        return res.status(200).json(exams);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getExamDetail = async (req: Request, res: Response) => {
    try {
       const examId = parseInt(String(req.params.id));
        const studentId = (req as any).user.sub;
        const examData = await attemptService.getExamForTaking(examId, studentId);
        return res.status(200).json(examData);
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message });
    }
};

export const submitExam = async (req: Request, res: Response) => {
    try {
        const examId = parseInt(String(req.params.id)); 
        const studentId = (req as any).user.sub;
        const answers = req.body.answers || []; 

        const result = await attemptService.submitAndScore(examId, studentId, answers);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message });
    }
};

export const listMyResults = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.sub;
        const history = await attemptRepo.getHistoryByStudent(studentId);
        return res.status(200).json(history);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};