export interface Attempt {
    id?: number;
    exam_id: number;
    student_id: number;
    score: number;
    max_score: number;
    submitted_at: Date;
}

export interface StudentAnswer {
    question_id: number;
    choice_id: number | null;
}