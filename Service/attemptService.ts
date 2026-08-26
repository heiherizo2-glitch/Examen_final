import { pool } from '../db/pool';
import { attemptRepo } from '../Repositorie/attemptRepository';
import { answerRepo } from '../Repositorie/answerRepository';

export const attemptService = {
    async listAvailableExams(studentId: number) {
        const query = `
            SELECT e.* FROM exams e
            WHERE NOW() BETWEEN e.starts_at AND e.ends_at
            AND NOT EXISTS (
                SELECT 1 FROM attempts a WHERE a.exam_id = e.id AND a.student_id = $1
            )
        `;
        const res = await pool.query(query, [studentId]);
        return res.rows;
    },

    async getExamForTaking(examId: number, studentId: number) {
        const exam = await attemptRepo.findActiveExam(examId);
        if (!exam) {
            throw { status: 404, message: "Examen introuvable ou fermé." };
        }
        const already = await attemptRepo.hasAlreadyAttempted(examId, studentId);
        if (already) {
            throw { status: 409, message: "Tentative déjà existante pour cet examen." };
        }
        const questions = await answerRepo.getQuestionsForExam(examId, false);
        return { ...exam, questions };
    },

    async submitAndScore(examId: number, studentId: number, userAnswers: { questionId: number, choiceId: number | null }[]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const examCheck = await client.query(
                `SELECT * FROM exams WHERE id = $1 AND NOW() BETWEEN starts_at AND ends_at`,
                [examId]
            );
            if (examCheck.rows.length === 0) {
                throw { status: 403, message: "Examen fermé ou invalide." };
            }

            const existingAttempt = await client.query(
                `SELECT 1 FROM attempts WHERE exam_id = $1 AND student_id = $2`,
                [examId, studentId]
            );
            if (existingAttempt.rows.length > 0) {
                throw { status: 409, message: "Tentative déjà enregistrée (Conflit)." };
            }

            const correctMap = await answerRepo.getCorrectAnswersMap(examId);
            let score = 0;
            const maxScore = correctMap.size; 
            const detailedCorrection: any[] = [];

            for (const ans of userAnswers) {
                const correctChoiceId = correctMap.get(ans.questionId);
                let isCorrect = false;

                if (ans.choiceId !== null && ans.choiceId === correctChoiceId) {
                    score += 1;
                    isCorrect = true;
                }

                detailedCorrection.push({
                    questionId: ans.questionId,
                    studentChoiceId: ans.choiceId,
                    correctChoiceId: correctChoiceId || null,
                    isCorrect
                });
            }

            const attemptRes = await client.query(
                `INSERT INTO attempts (exam_id, student_id, score, max_score, submitted_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
                [examId, studentId, score, maxScore]
            );
            const attempt = attemptRes.rows[0];

            await client.query('COMMIT');
            return { attempt, correction: detailedCorrection };

        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23505') {
                throw { status: 409, message: "Tentative simultanée rejetée par la base de données." };
            }
            throw error;
        } finally {
            client.release();
        }
    }
};