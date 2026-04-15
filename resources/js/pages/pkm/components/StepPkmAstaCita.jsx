import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

// From image: SDGs terkait = dropdown tujuan, Indikator Keberhasilan = angka/kode, Uraian Kegiatan = text
const SDG_GOALS = [
    '1. Tanpa Kemiskinan',
    '2. Tanpa Kelaparan',
    '3. Kehidupan Sehat dan Sejahtera',
    '4. Pendidikan Berkualitas',
    '5. Kesetaraan Gender',
    '6. Air Bersih dan Sanitasi Layak',
    '7. Energi Bersih dan Terjangkau',
    '8. Pekerjaan Layak dan Pertumbuhan Ekonomi',
    '9. Industri, Inovasi, dan Infrastruktur',
    '10. Berkurangnya Kesenjangan',
    '11. Kota dan Permukiman yang Berkelanjutan',
    '12. Konsumsi dan Produksi yang Bertanggung Jawab',
    '13. Penanganan Perubahan Iklim',
    '14. Ekosistem Lautan',
    '15. Ekosistem Daratan',
    '16. Perdamaian, Keadilan, dan Kelembagaan yang Tangguh',
    '17. Kemitraan untuk Mencapai Tujuan',
];

const emptySdg = { goal: '', indicator: '', description: '' };

export default function StepPkmSdgs({ proposalId, token, onNext, onBack, initialData }) {
    const [sdgGoals, setSdgGoals] = useState([{ ...emptySdg }]);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);

    useEffect(() => {
        const sub = initialData?.substance;
        if (sub?.sdg_goals?.length > 0) setSdgGoals(sub.sdg_goals);
    }, [initialData]);

    const addSdg    = () => setSdgGoals(s => [...s, { ...emptySdg }]);
    const removeSdg = (idx) => { if (sdgGoals.length > 1) setSdgGoals(s => s.filter((_, i) => i !== idx)); };
    const updateSdg = (idx, field, val) =>
        setSdgGoals(s => s.map((g, i) => i === idx ? { ...g, [field]: val } : g));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 3, sdg_goals: sdgGoals },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onNext();
        } catch (err) {
            const msgs = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : err.response?.data?.message || 'Terjadi kesalahan.';
            setError(msgs);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
            )}

            {/* SDGs */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
                <div className="bg-blue-50 px-5 py-3 border-b border-blue-200 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-blue-800 text-sm">🌐 Tujuan Pembangunan Berkelanjutan (SDGs)</h4>
                        <p className="text-xs text-blue-500 mt-0.5">Daftarkan semua SDGs yang relevan dengan kegiatan PKM.</p>
                    </div>
                    <button type="button" onClick={addSdg}
                        className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline shrink-0">
                        <Plus size={13} /> Tambah SDG
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    {sdgGoals.map((g, idx) => (
                        <div key={idx} className="p-4 border border-blue-100 rounded-lg bg-blue-50/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-700">SDG #{idx + 1}</span>
                                {sdgGoals.length > 1 && (
                                    <button type="button" onClick={() => removeSdg(idx)}
                                        className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                        SDGs Terkait <span className="text-red-500">*</span>
                                    </label>
                                    <select required value={g.goal} onChange={e => updateSdg(idx, 'goal', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-2 focus:ring-blue-400">
                                        <option value="">-- Pilih Tujuan SDG --</option>
                                        {SDG_GOALS.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                        Indikator Keberhasilan <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" required value={g.indicator}
                                        onChange={e => updateSdg(idx, 'indicator', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-2 focus:ring-blue-400"
                                        placeholder="Contoh: 29" />
                                    <p className="text-xs text-gray-400 mt-1">Nomor/kode indikator keberhasilan.</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                    Uraian Kegiatan terkait SDG <span className="text-red-500">*</span>
                                </label>
                                <textarea required rows={5} value={g.description}
                                    onChange={e => updateSdg(idx, 'description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-2 focus:ring-blue-400"
                                    placeholder="Jelaskan secara rinci bagaimana kegiatan PKM ini berkontribusi pada SDG yang dipilih..." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-2">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 text-sm font-semibold">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-green-700 text-white rounded-sm font-bold shadow hover:bg-green-800 transition-all disabled:opacity-50 text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
