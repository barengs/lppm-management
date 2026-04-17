import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Info, CheckCircle } from 'lucide-react';

export default function StepSchedule({ proposalId, token, onNext, onBack, initialData }) {
    const [schedules, setSchedules] = useState([]);
    const [duration, setDuration] = useState(1);
    const [currentYearView, setCurrentYearView] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData?.identity?.duration_years) {
            setDuration(parseInt(initialData.identity.duration_years));
        }
        
        if (initialData?.schedules && initialData.schedules.length > 0) {
            setSchedules(initialData.schedules);
        } else {
            setSchedules([{ execution_year: 1, activity: '', months: [] }]);
        }
    }, [initialData]);

    const addActivity = (year) => {
        setSchedules([...schedules, { execution_year: year, activity: '', months: [] }]);
    };

    const removeActivity = (index) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const updateActivity = (index, activity) => {
        const newSchedules = [...schedules];
        newSchedules[index].activity = activity;
        setSchedules(newSchedules);
    };

    const toggleMonth = (index, month) => {
        const newSchedules = [...schedules];
        const months = newSchedules[index].months || [];
        if (months.includes(month)) {
            newSchedules[index].months = months.filter(m => m !== month);
        } else {
            newSchedules[index].months = [...months, month].sort((a, b) => a - b);
        }
        setSchedules(newSchedules);
    };

    const handleSave = async () => {
        if (schedules.some(s => !s.activity || !s.months || s.months.length === 0)) {
            setError("Semua aktivitas harus memiliki nama dan setidaknya satu bulan pelaksanaan.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 4,
                schedules: schedules
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaving(false);
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan jadwal.");
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start">
                <Info className="text-blue-600 mr-3 mt-0.5" size={20} />
                <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-bold uppercase tracking-wider mb-1">Panduan Jadwal Penelitian:</p>
                    <p>Uraikan tahapan aktivitas penelitian per tahun pelaksanaan. Klik pada angka bulan (1-12) untuk menandai waktu pelaksanaan aktivitas tersebut. Angka menunjukkan urutan bulan dalam tahun pelaksanaan.</p>
                </div>
            </div>

            {duration > 1 && (
                <div className="flex space-x-2 border-b border-gray-100">
                    {[...Array(duration)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentYearView(i + 1)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-tight transition-all border-b-2 ${
                                currentYearView === i + 1 
                                    ? 'text-green-700 border-green-700 bg-green-50/50' 
                                    : 'text-gray-400 border-transparent hover:text-gray-600'
                            }`}
                        >
                            Tahun Ke-{i + 1}
                        </button>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-sm border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 table-fixed">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 w-64 md:w-80">Rencana Aktivitas</th>
                                {[...Array(12)].map((_, i) => (
                                    <th key={i} className="px-0 py-4 text-center text-[10px] font-bold text-gray-400 uppercase w-8 md:w-10">
                                        {i + 1}
                                    </th>
                                ))}
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {schedules.filter(s => s.execution_year === currentYearView).map((item, idx) => {
                                const originalIdx = schedules.indexOf(item);
                                return (
                                    <tr key={originalIdx} className="hover:bg-gray-50 transition-all group">
                                        <td className="px-4 py-3">
                                            <textarea 
                                                rows={1}
                                                className="w-full text-xs border border-gray-100 p-2 rounded-sm focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none bg-gray-50/50 hover:bg-white focus:bg-white"
                                                placeholder="Nama aktivitas..."
                                                value={item.activity}
                                                onChange={e => updateActivity(originalIdx, e.target.value)}
                                            />
                                        </td>
                                        {[...Array(12)].map((_, m) => {
                                            const monthNum = m + 1;
                                            const isChecked = item.months?.includes(monthNum);
                                            return (
                                                <td key={m} className="px-0 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleMonth(originalIdx, monthNum)}
                                                            className={`w-7 h-7 rounded-sm flex items-center justify-center text-[9px] font-black transition-all transform active:scale-90 ${
                                                                isChecked 
                                                                    ? 'bg-green-700 text-white shadow-md shadow-green-200 border border-green-800' 
                                                                    : 'bg-white text-gray-200 border border-gray-100 hover:border-green-200 hover:text-green-400'
                                                            }`}
                                                            title={`Bulan ${monthNum}`}
                                                        >
                                                            {monthNum}
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => removeActivity(originalIdx)}
                                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                title="Hapus baris"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <button 
                        onClick={() => addActivity(currentYearView)}
                        className="flex items-center text-[11px] font-bold text-green-700 hover:text-green-800 uppercase tracking-wider"
                    >
                        <Plus size={16} className="mr-2" /> Tambah Baris Aktivitas
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 text-xs rounded-sm border border-red-100 flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-10">
                <div className="max-w-6xl mx-auto flex justify-end space-x-3 px-8">
                    <button
                        onClick={onBack}
                        className="px-8 py-2.5 border border-gray-300 rounded-sm text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-10 py-2.5 bg-green-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-green-800 transition-all disabled:opacity-50 flex items-center"
                    >
                        {isSaving ? 'Menyimpan...' : (
                            <>Simpan & Lanjut <CheckCircle size={14} className="ml-2" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
