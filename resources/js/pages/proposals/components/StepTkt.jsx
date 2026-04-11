import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Info } from 'lucide-react';

export default function StepTkt({ proposalId, token, onNext, onBack }) {
    const [questions, setQuestions] = useState({});
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get('/api/proposals/tkt-questions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuestions(res.data);
                setIsLoading(false);
            } catch (err) {
                setError("Gagal mengambil daftar pertanyaan TKT.");
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [token]);

    const handleAnswerChange = (indicatorId, value) => {
        setAnswers(prev => ({ ...prev, [indicatorId]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 0,
                answers: answers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult({
                level: res.data.tkt_level,
                score: res.data.tkt_score
            });
            setIsSaving(false);
            // After save, we can proceed
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan TKT.");
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat pertanyaan TKT...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                    <Info className="text-blue-400 mr-3" />
                    <div>
                        <p className="text-sm text-blue-700 font-bold">Kuesioner Tingkat Kesiapan Terapan (TKT)</p>
                        <p className="text-xs text-blue-600">Pilihlah indikator yang telah dicapai oleh teknologi/riset Anda. Sistem akan menghitung level TKT (1-9) secara otomatis.</p>
                    </div>
                </div>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-sm text-sm">{error}</div>}

            <div className="space-y-8">
                {Object.entries(questions).map(([level, data]) => (
                    <div key={level} className="border border-gray-100 rounded-sm overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 font-bold text-gray-700 text-sm">
                            {data.name}
                        </div>
                        <div className="p-4 space-y-3">
                            {data.indicators.map(indicator => (
                                <label key={indicator.id} className="flex items-start group cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all"
                                        checked={answers[indicator.id] || false}
                                        onChange={(e) => handleAnswerChange(indicator.id, e.target.checked)}
                                    />
                                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {indicator.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-6 space-x-3">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Kembali
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-2 bg-green-700 text-white rounded-sm text-sm font-bold shadow-md hover:bg-green-800 transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan & Lanjut'}
                </button>
            </div>
        </div>
    );
}
