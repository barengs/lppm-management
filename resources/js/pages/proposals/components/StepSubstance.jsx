import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Save, Info, AlertCircle, CheckCircle } from 'lucide-react';

export default function StepSubstance({ proposalId, token, onBack, onNext, initialData }) {
    const limits = initialData?.scheme || {
        abstract_limit: 200,
        background_limit: 500,
        methodology_limit: 1000,
        objective_limit: 300,
        reference_limit: 50
    };

    const [formData, setFormData] = useState({
        abstract: '',
        keywords: '',
        background: '',
        methodology: '',
        objectives: '',
        references: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        if (initialData?.content) {
            setFormData({
                abstract: initialData.content.abstract || '',
                keywords: initialData.content.keywords || '',
                background: initialData.content.background || '',
                methodology: initialData.content.methodology || '',
                objectives: initialData.content.objectives || '',
                references: initialData.content.references || ''
            });
        }
    }, [initialData]);

    const countWords = (text) => {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const renderTextArea = (label, field, limit, placeholder) => {
        const words = countWords(formData[field]);
        const isOverLimit = words > limit;

        return (
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOverLimit ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {words} / {limit} Kata
                    </span>
                </div>
                <textarea
                    className={`w-full text-sm p-3 border rounded-sm focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[150px] ${isOverLimit ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                    placeholder={placeholder}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                />
                {isOverLimit && (
                    <p className="text-[10px] text-red-500 flex items-center">
                        <AlertCircle size={12} className="mr-1" /> Melebihi batas kata yang ditentukan.
                    </p>
                )}
            </div>
        );
    };

    const handleSave = async (autoNext = false) => {
        // Simple Validation
        for (const field of ['abstract', 'background', 'methodology', 'objectives']) {
            if (countWords(formData[field]) > limits[`${field}_limit`]) {
                setError(`Bagian ${field} melebihi batas kata.`);
                return;
            }
        }

        setIsSaving(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 5,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setLastSaved(new Date().toLocaleTimeString());
            setIsSaving(false);
            if (autoNext) onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan substansi.");
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start">
                <Info className="text-blue-600 mr-3 mt-0.5" size={20} />
                <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-bold">Instruksi Pengisian Substansi:</p>
                    <p className="mt-1">Masukkan substansi proposal secara langsung pada kolom di bawah ini. Pastikan jumlah kata tidak melebihi batas yang telah ditentukan untuk masing-masing bagian agar dapat disimpan.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {renderTextArea("Abstrak", "abstract", limits.abstract_limit, "Ringkasan usulan penelitian...")}
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Kata Kunci</label>
                    <input 
                        type="text"
                        className="w-full text-sm p-3 border border-gray-200 rounded-sm outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Pisahkan dengan koma (misal: AI, Kesehatan, IoT)"
                        value={formData.keywords}
                        onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    />
                </div>

                {renderTextArea("Latar Belakang", "background", limits.background_limit, "Uraikan latar belakang dan urgensi penelitian...")}
                {renderTextArea("Metode / Pembahasan", "methodology", limits.methodology_limit, "Tahapan penelitian, alat, dan bahan...")}
                {renderTextArea("Tujuan & Kesimpulan", "objectives", limits.objective_limit, "Tujuan yang ingin dicapai dan ringkasan hasil...")}
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Daftar Pustaka</label>
                    <textarea
                        className="w-full text-sm p-3 border border-gray-200 rounded-sm outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                        placeholder="Gunakan format APA atau IEEE (Satu baris per referensi)"
                        value={formData.references}
                        onChange={(e) => setFormData({...formData, references: e.target.value})}
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-sm text-sm border border-red-200 flex items-center">
                    <AlertCircle size={16} className="mr-2" /> {error}
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-10">
                <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
                    <div className="flex items-center text-[10px] text-gray-400 font-medium">
                        {lastSaved ? (
                            <span className="flex items-center text-green-600"><CheckCircle size={12} className="mr-1" /> Tersimpan otomatis: {lastSaved}</span>
                        ) : (
                            <span>Belum disimpan</span>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onBack}
                            className="px-6 py-2 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="px-6 py-2 bg-white border border-green-700 text-green-700 rounded-sm text-sm font-bold hover:bg-green-50 flex items-center"
                        >
                            <Save size={16} className="mr-2" /> {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="px-8 py-2 bg-green-700 text-white rounded-sm text-sm font-bold shadow-md hover:bg-green-800"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
