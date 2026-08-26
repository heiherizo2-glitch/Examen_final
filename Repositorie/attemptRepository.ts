import { pool } from '../db/pool';

export const attemptRepo = {
    async findAvailableExamsForStudent(studentId: number) {
        
        const query = `
            SELECT e.* FROM exams e
            WHERE NOW() BETWEEN e.starts_at AND e.ends_at
            AND NOT EXISTS (
                SELECT 1 FROM attempts a 
                WHERE a.exam_id = e.id AND a.student_id = $1
            )
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    },

    async findActiveExam(examId: number) {
        const query = `
            SELECT * FROM exams 
            WHERE id = $1 
            AND NOW() BETWEEN starts_at AND ends_at
        `;
        const result = await pool.query(query, [examId]);
        return result.rows[0];
    },

    async hasAlreadyAttempted(examId: number, studentId: number) {
        const query = `SELECT 1 FROM attempts WHERE exam_id = $1 AND student_id = $2`;
        const result = await pool.query(query, [examId, studentId]);
        return (result.rowCount ?? 0) > 0;
    },

    async createAttemptWithTx(client: any, examId: number, studentId: number, score: number, maxScore: number) {
        const query = `
            INSERT INTO attempts (exam_id, student_id, score, max_score, submitted_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;
        const result = await client.query(query, [examId, studentId, score, maxScore]);
        return result.rows[0];
    },

    async getHistoryByStudent(studentId: number) {
        const query = `
            SELECT a.*, e.title as exam_title, e.course_id 
            FROM attempts a
            JOIN exams e ON a.exam_id = e.id
            WHERE a.student_id = $1
            ORDER BY a.submitted_at DESC
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows[0] ? result.rows : [];
    }
};