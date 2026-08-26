import { answerRepo } from '../Repositorie/answerRepository';

export const scoringService = {
    async calculateScoreAndCorrection(examId: number, userAnswers: { questionId: number, choiceId: number | null }[]) {

        const correctMap = await answerRepo.getCorrectAnswersMap(examId);
        let score = 0;
        const maxScore = correctMap.size;
        const detailedCorrection: any[] = [];

        for (const ans of userAnswers) {
            const correctChoiceId = correctMap.get(ans.questionId);
            let isCorrect = false;

            if (correctChoiceId !== undefined) {
                if (ans.choiceId !== null && ans.choiceId === correctChoiceId) {
                    score += 1;
                    isCorrect = true;
                }

                detailedCorrection.push({
                    questionId: ans.questionId,
                    studentChoiceId: ans.choiceId,
                    correctChoiceId: correctChoiceId,
                    isCorrect
                });
            }
        }

        return { score, maxScore, detailedCorrection };
    }
};