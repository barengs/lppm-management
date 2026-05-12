import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Globe, AlertCircle, Info } from 'lucide-react';

const emptySDG = { goal: '', indicator: '', description: '' };

export default function StepPkmAstaCita({ proposalId, token, onNext, onBack, initialData }) {
    const [sdgGoals, setSdgGoals] = useState([emptySDG]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [masterGoals, setMasterGoals] = useState([]);

    useEffect(() => {
        fetchMasterData();
        if (initialData?.substance?.sdg_goals) {
            setSdgGoals(initialData.substance.sdg_goals);
        }
    }, [initialData]);

    const fetchMasterData = async () => {
        try {
            const res = await axios.get('/api/pkm-master-data?type=sdg_goal', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMasterGoals(res.data);
        } catch (err) {
            console.error("Failed to fetch SDGs master data", err);
        }
    };

    const addSDG = () => setSdgGoals([...sdgGoals, { ...emptySDG }]);
    const removeSDG = (idx) => {
        if (sdgGoals.length === 1) return;
        setSdgGoals(sdgGoals.filter((_, i) => i !== idx));
    };

    const updateSDG = (idx, field, val) => {
        const newGoals = [...sdgGoals];
        newGoals[idx][field] = val;
        setSdgGoals(newGoals);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 5, sdg_goals: sdgGoals },
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
            <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start">
                <Info className="text-green-600 mr-3 mt-0.5" size={20} />
                <div className="text-[11px] text-green-800 leading-relaxed uppercase tracking-tight">
                    <p className="font-bold mb-1">Sustainable Development Goals (SDGs):</p>
                    <p>Pilih tujuan SDGs yang relevan dengan kegiatan pengabdian Anda dan uraikan indikator serta deskripsi keterkaitannya.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4">
                {sdgGoals.map((item, idx) => (
                    <div key={idx} className="p-5 border border-gray-200 rounded-sm bg-gray-50/50 space-y-4 shadow-sm relative">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-xs font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={14} /> SDGs Goal #{idx + 1}
                            </span>
                            {sdgGoals.length > 1 && (
                                <button type="button" onClick={() => removeSDG(idx)}
                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Tujuan SDGs <span className="text-red-500">*</span></label>
                                <select required value={item.goal}
                                    onChange={e => updateSDG(idx, 'goal', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-xs bg-white focus:ring-2 focus:ring-green-500 font-medium">
                                    <option value="">-- Pilih Tujuan SDGs --</option>
                                    {masterGoals.map(m => (
                                        <option key={m.id} value={m.name}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Indikator <span className="text-red-500">*</span></label>
                                <input type="text" required value={item.indicator}
                                    onChange={e => updateSDG(idx, 'indicator', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-xs focus:ring-2 focus:ring-green-500"
                                    placeholder="Contoh: Rasio jumlah penduduk miskin" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Deskripsi Keterkaitan <span className="text-red-500">*</span></label>
                            <textarea required rows={3} value={item.description}
                                onChange={e => updateSDG(idx, 'description', e.target.value)}
                                className="w-full border border-gray-300 rounded-sm p-2.5 text-xs focus:ring-2 focus:ring-green-500"
                                placeholder="Jelaskan bagaimana kegiatan ini berkontribusi pada tujuan SDGs tersebut..." />
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={addSDG}
                className="flex items-center gap-2 text-[10px] font-black text-green-700 hover:text-green-800 uppercase tracking-widest bg-white border border-green-200 px-4 py-2 rounded-sm shadow-sm transition-all active:scale-95">
                <Plus size={14} /> Tambah Tujuan SDGs
            </button>

            <div className="flex justify-between pt-6 border-t">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-sm text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-10 py-2.5 bg-green-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-widest shadow-md hover:bg-green-800 transition-all disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
