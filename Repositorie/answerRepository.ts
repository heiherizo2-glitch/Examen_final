import { pool } from '../db/pool';

export const answerRepo = {
    async getQuestionsForExam(examId: number, includeCorrect: boolean = false) {
        
        const selectCorrect = includeCorrect ? ", c.is_correct" : "";
        
        const queryQ = `SELECT id, label FROM questions WHERE exam_id = $1`;
        const questionsRes = await pool.query(queryQ, [examId]);
        
        const questions = [];
        for (const q of questionsRes.rows) {
            const queryC = `SELECT id, label ${selectCorrect} FROM choices WHERE question_id = $1`;
            const choicesRes = await pool.query(queryC, [q.id]);
            questions.push({
                ...q,
                choices: choicesRes.rows
            });
        }
        return questions;
    },

    async getCorrectAnswersMap(examId: number) {
 
        const res = await pool.query(`
            SELECT q.id as question_id, c.id as choice_id 
            FROM questions q 
            JOIN choices c ON c.question_id = q.id 
            WHERE q.exam_id = $1 AND c.is_correct = true
        `, [examId]);
        
        const map = new Map<number, number>();
        res.rows.forEach((row: any) => map.set(row.question_id, row.choice_id));
        return map;
    }
};