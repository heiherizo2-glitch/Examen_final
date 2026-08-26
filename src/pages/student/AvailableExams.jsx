import React, { useEffect, useState } from 'react';

export default function AvailableExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/my/exams', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setExams(data);
                } else {
                    setExams([]); 
                }
                setLoading(false);
            })
            .catch(err => {
                setError("Erreur lors du chargement des examens.");
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6">Chargement des examens...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mes Examens Disponibles</h1>
            {exams.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                    Aucun examen n'est ouvert pour le moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exams.map(exam => (
                        <div key={exam.id} className="border rounded-lg p-5 shadow-sm bg-white flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{exam.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">Cours ID : {exam.course_id}</p>
                                <p className="text-xs text-red-500 mt-2">Ferme le : {new Date(exam.ends_at).toLocaleString()}</p>
                            </div>
                            <a 
                                href={`/student/exams/${exam.id}`} 
                                className="mt-4 inline-block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                            >
                                Passer l'examen
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}