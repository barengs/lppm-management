import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const emptyOutput = { year: 1, output_group: '', output_type: '', target_status: '', notes: '' };

export default function StepPkmOutputs({ proposalId, token, onNext, onBack, initialData }) {
    const [outputs,       setOutputs]      = useState([{ ...emptyOutput }]);
    const [outputGroups,  setOutputGroups] = useState([]);
    const [loading,       setLoading]      = useState(false);
    const [error,         setError]        = useState(null);

    // Fetch dynamic master data
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const res = await axios.get('/api/pkm-master-data?type=output_group', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOutputGroups(res.data);
            } catch {
                // fallback if API fails
            }
        };
        fetchMaster();
    }, [token]);

    useEffect(() => {
        if (initialData?.outputs?.length > 0) {
            setOutputs(initialData.outputs.map(o => ({
                year:          o.year          || 1,
                output_group:  o.output_group  || '',
                output_type:   o.output_type   || '',
                target_status: o.target_status || '',
                notes:         o.notes         || '',
            })));
        }
    }, [initialData]);

    const addOutput    = () => setOutputs(o => [...o, { ...emptyOutput }]);
    const removeOutput = (idx) => { if (outputs.length > 1) setOutputs(o => o.filter((_, i) => i !== idx)); };
    const update = (idx, field, val) =>
        setOutputs(o => o.map((out, i) => i === idx ? { ...out, [field]: val } : out));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 5, outputs },
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
        <form onSubmit={handleSave} className="space-y-5">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
            )}

            <div className="text-sm text-gray-500 bg-teal-50 border border-teal-200 rounded-sm p-4">
                <strong className="text-teal-700">Luaran Dijanjikan:</strong> Daftarkan semua luaran yang akan dihasilkan dari kegiatan PKM ini beserta target capaiannya.
            </div>

            <div className="space-y-4">
                {outputs.map((out, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="bg-teal-50 px-5 py-3 border-b border-teal-200 flex items-center justify-between">
                            <span className="font-bold text-teal-800 text-sm">Luaran #{idx + 1}</span>
                            {outputs.length > 1 && (
                                <button type="button" onClick={() => removeOutput(idx)}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold">
                                    <Trash2 size={13} /> Hapus
                                </button>
                            )}
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Tahun Pelaksanaan
                                </label>
                                <select value={out.year} onChange={e => update(idx, 'year', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm">
                                    <option value={1}>Tahun 1</option>
                                    <option value={2}>Tahun 2</option>
                                    <option value={3}>Tahun 3</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Kelompok Luaran <span className="text-red-500">*</span>
                                </label>
                                <select required value={out.output_group}
                                    onChange={e => update(idx, 'output_group', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-teal-500">
                                    <option value="">-- Pilih Kelompok --</option>
                                    {outputGroups.map((g) => (
                                        <option key={g.id} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Jenis Luaran <span className="text-red-500">*</span>
                                </label>
                                <input type="text" required value={out.output_type}
                                    onChange={e => update(idx, 'output_type', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                                    placeholder="Contoh: Video kegiatan, Peningkatan Kualitas Produk" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Status Target Capaian <span className="text-red-500">*</span>
                                </label>
                                <input type="text" required value={out.target_status}
                                    onChange={e => update(idx, 'target_status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                                    placeholder="Contoh: Unggah di Laman Youtube Lembaga / Tercapai" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Keterangan / URL
                                </label>
                                <textarea rows={3} value={out.notes}
                                    onChange={e => update(idx, 'notes', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="URL referensi atau keterangan detail capaian (contoh: https://www.youtube.com/@UIMmedia)" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={addOutput}
                className="w-full border-2 border-dashed border-teal-300 rounded-sm py-3 text-teal-700 font-semibold text-sm hover:bg-teal-50 flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Tambah Luaran
            </button>

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
