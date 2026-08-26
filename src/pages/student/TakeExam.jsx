import React, { useEffect, useState } from 'react';

export default function TakeExam({ examId }) {
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({}); 
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/my/exams/${examId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => setExam(data))
            .catch(err => setError("Impossible de charger l'examen."));
    }, [examId]);

    const handleSelect = (questionId, choiceId) => {
        setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam?.questions?.length || 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const confirmSubmit = window.confirm("Attention : la soumission est définitive. Voulez-vous vraiment valider vos réponses ?");
        if (!confirmSubmit) return;

        setSubmitting(true);

        const formattedAnswers = Object.entries(answers).map(([qId, cId]) => ({
            questionId: Number(qId),
            choiceId: cId
        }));

        fetch(`/api/my/exams/${examId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ answers: formattedAnswers })
        })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || "Erreur lors de la soumission");
                }
                return res.json();
            })
            .then(data => {
               
                window.location.href = `/student/results/${examId}`;
            })
            .catch(err => {
                alert(err.message);
                setSubmitting(false);
            });
    };

    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!exam) return <div className="p-6">Chargement de l'examen...</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-lg my-6">
            <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
            <div className="bg-gray-100 p-3 rounded mb-6 flex justify-between items-center text-sm text-gray-700">
                <span>Questions répondues : <strong>{answeredCount} / {totalQuestions}</strong></span>
                <span className="text-red-600 font-semibold">Fermeture : {new Date(exam.ends_at).toLocaleTimeString()}</span>
            </div>

            <form onSubmit={handleSubmit}>
                {exam.questions.map((q, index) => (
                    <div key={q.id} className="mb-6 border-b pb-4">
                        <p className="font-medium text-lg mb-3">{index + 1}. {q.label}</p>
                        <div className="space-y-2">
                            {q.choices.map(choice => (
                                <label key={choice.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                    <input 
                                        type="radio" 
                                        name={`question-${q.id}`} 
                                        checked={answers[q.id] === choice.id}
                                        onChange={() => handleSelect(q.id, choice.id)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="text-gray-800">{choice.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <button 
                    type="submit" 
                    disabled={submitting}
                    className={`w-full py-3 px-4 rounded text-white font-bold transition ${
                        submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {submitting ? 'Soumission en cours...' : 'Soumettre définitivement'}
                </button>
            </form>
        </div>
    );
}