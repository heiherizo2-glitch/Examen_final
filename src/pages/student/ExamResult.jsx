import React, { useEffect, useState } from 'react';

export default function ExamResult({ examId }) {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
    
        fetch(`/api/my/results`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                const currentAttempt = Array.isArray(data) ? data.find(a => a.exam_id === Number(examId)) : null;
                if (currentAttempt) {
                    setResult(currentAttempt);
                } else {
                    setError("Aucun résultat trouvé pour cet examen.");
                }
            })
            .catch(err => setError("Erreur de chargement du résultat."));
    }, [examId]);

    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!result) return <div className="p-6">Chargement des résultats...</div>;

    const percentage = Math.round((result.score / result.max_score) * 100);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Résultat de l'examen</h1>
                <div className="text-5xl font-extrabold text-blue-600 my-4">
                    {result.score} / {result.max_score}
                </div>
                <p className="text-lg text-gray-600">Soit un score de <strong>{percentage}%</strong></p>
                <p className="text-xs text-gray-400 mt-2">Soumis le : {new Date(result.submitted_at).toLocaleString()}</p>
            </div>

            <div className="text-center mt-6">
                <a href="/student/exams" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Retour aux examens
                </a>
            </div>
        </div>
    );
}