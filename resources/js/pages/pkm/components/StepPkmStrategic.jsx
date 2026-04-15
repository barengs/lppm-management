import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const STRATEGIC_FIELDS = [
    '1. Ketahanan Pangan',
    '2. Kesehatan',
    '3. Energi Baru dan Terbarukan',
    '4. Transportasi dan Kemaritiman',
    '5. Teknologi Informasi dan Komunikasi',
    '6. Material Maju',
    '7. Pertahanan dan Keamanan',
    '8. Sosial Humaniora, Seni Budaya, dan Pendidikan',
];

const emptyField = { field: '', problem_statement: '', description: '' };

export default function StepPkmStrategic({ proposalId, token, onNext, onBack, initialData }) {
    const [fields,  setFields]  = useState([{ ...emptyField }]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        const sub = initialData?.substance;
        if (sub?.strategic_fields?.length > 0) setFields(sub.strategic_fields);
    }, [initialData]);

    const addField    = () => setFields(f => [...f, { ...emptyField }]);
    const removeField = (idx) => { if (fields.length > 1) setFields(f => f.filter((_, i) => i !== idx)); };
    const update = (idx, key, val) =>
        setFields(f => f.map((fld, i) => i === idx ? { ...fld, [key]: val } : fld));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 4, strategic_fields: fields },
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

            <div className="text-sm text-gray-500 bg-purple-50 border border-purple-200 rounded-sm p-4">
                <strong className="text-purple-700">8 Bidang Strategis:</strong> Pilih bidang strategis nasional yang relevan dengan kegiatan PKM Anda dan uraikan kontribusinya.
            </div>

            <div className="space-y-5">
                {fields.map((fld, idx) => (
                    <div key={idx} className="border border-purple-200 rounded-sm overflow-hidden">
                        <div className="bg-purple-50 px-5 py-3 border-b border-purple-200 flex items-center justify-between">
                            <span className="font-bold text-purple-800 text-sm">Bidang Strategis #{idx + 1}</span>
                            {fields.length > 1 && (
                                <button type="button" onClick={() => removeField(idx)}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold">
                                    <Trash2 size={13} /> Hapus
                                </button>
                            )}
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-tight">
                                    Bidang Strategis <span className="text-red-500">*</span>
                                </label>
                                <select required value={fld.field} onChange={e => update(idx, 'field', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-purple-500">
                                    <option value="">-- Pilih Bidang Strategis --</option>
                                    {STRATEGIC_FIELDS.map((sf, i) => (
                                        <option key={i} value={sf}>{sf}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-tight">
                                    Problem Statement <span className="text-red-500">*</span>
                                </label>
                                <textarea required rows={3} value={fld.problem_statement}
                                    onChange={e => update(idx, 'problem_statement', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-purple-500"
                                    placeholder="Uraikan permasalahan yang melatarbelakangi bidang strategis ini dalam konteks PKM Anda..." />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-tight">
                                    Uraian Kegiatan Terkait Bidang <span className="text-red-500">*</span>
                                </label>
                                <textarea required rows={3} value={fld.description}
                                    onChange={e => update(idx, 'description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Jelaskan bagaimana kegiatan PKM berkontribusi pada bidang strategis ini..." />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={addField}
                className="w-full border-2 border-dashed border-purple-300 rounded-sm py-3 text-purple-700 font-semibold text-sm hover:bg-purple-50 flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Tambah Bidang Strategis
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
