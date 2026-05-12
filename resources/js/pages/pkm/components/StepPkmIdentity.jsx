import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function StepPkmIdentity({ proposalId, token, onNext, initialData }) {
    const [form, setForm] = useState({
        title:             '',
        scheme_group:      '',
        duration_years:    1,
        first_year:        new Date().getFullYear(),
    });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    // Dynamic master data
    const [schemeGroups, setSchemeGroups] = useState([]);

    // Fetch all master data types in parallel
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [sg] = await Promise.all([
                    axios.get('/api/pkm-master-data?type=scheme_group', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setSchemeGroups(sg.data);
            } catch {
                // fallback: keep empty, form still works
            }
        };
        fetchMaster();
    }, [token]);

    useEffect(() => {
        if (initialData) {
            setForm({
                title:             initialData.title             || '',
                scheme_group:      initialData.scheme_group      || '',
                duration_years:    initialData.duration_years    || 1,
                first_year:        initialData.first_year        || new Date().getFullYear(),
            });
        }
    }, [initialData]);

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 0, ...form },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onNext();
        } catch (err) {
            const msgs = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : err.response?.data?.message || 'Gagal menyimpan.';
            setError(msgs);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Judul */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Judul Pengabdian <span className="text-red-500">*</span>
                </label>
                <textarea required rows={3}
                    className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-green-500 transition-all font-medium"
                    placeholder="Masukkan judul lengkap proposal PKM..."
                    value={form.title}
                    onChange={e => set('title', e.target.value)} />
            </div>

            {/* Metadata Skema */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
                <div className="bg-green-50 px-5 py-3 border-b border-green-200">
                    <h4 className="font-bold text-green-800 text-sm">📋 Informasi Skema</h4>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Kelompok Skema <span className="text-red-500">*</span>
                        </label>
                        <select required value={form.scheme_group}
                            onChange={e => set('scheme_group', e.target.value)}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">-- Pilih Kelompok Skema --</option>
                            {schemeGroups.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Lama Kegiatan (Tahun) <span className="text-red-500">*</span>
                        </label>
                        <select required value={form.duration_years}
                            onChange={e => set('duration_years', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                            <option value={1}>1 Tahun</option>
                            <option value={2}>2 Tahun</option>
                            <option value={3}>3 Tahun</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Tahun Pertama Usulan <span className="text-red-500">*</span>
                        </label>
                        <input type="number" required min={2020} max={2040}
                            value={form.first_year}
                            onChange={e => set('first_year', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-green-700 text-white rounded-sm font-bold shadow hover:bg-green-800 transition-all disabled:opacity-50 text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
