import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, DollarSign } from 'lucide-react';
import axios from 'axios';

const COST_GROUPS = [
    'Teknologi dan Inovasi',
    'Biaya Upah dan Jasa',
    'Biaya Pelatihan',
    'Biaya Perjalanan',
    'Bahan Habis Pakai',
    'Sewa',
    'Diseminasi Hasil',
    'Lainnya',
];

const emptyItem = {
    year:       1,
    cost_group: '',
    component:  '',
    item_name:  '',
    unit:       '',
    volume:     1,
    unit_cost:  0,
    url_price:  '',
};

const formatRp = (val) => {
    if (!val && val !== 0) return '';
    return Number(val).toLocaleString('id-ID');
};

export default function StepPkmBudget({ proposalId, token, onNext, onBack, initialData }) {
    const [items,   setItems]   = useState([{ ...emptyItem }]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        if (initialData?.budget_items?.length > 0) {
            setItems(initialData.budget_items.map(b => ({
                year:       b.year       || 1,
                cost_group: b.cost_group || '',
                component:  b.component  || '',
                item_name:  b.item_name  || '',
                unit:       b.unit       || '',
                volume:     b.volume     || 1,
                unit_cost:  b.unit_cost  || 0,
                url_price:  b.url_price  || '',
            })));
        }
    }, [initialData]);

    const addItem    = () => setItems(i => [...i, { ...emptyItem }]);
    const removeItem = (idx) => { if (items.length > 1) setItems(i => i.filter((_, j) => j !== idx)); };
    const update = (idx, field, val) =>
        setItems(i => i.map((it, j) => j === idx ? { ...it, [field]: val } : it));

    const totalBudget = items.reduce((sum, it) => sum + (Number(it.volume) * Number(it.unit_cost)), 0);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 6, budget_items: items },
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
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
            )}

            {/* Summary Card */}
            <div className="bg-emerald-700 text-white rounded-xl p-5 flex items-center justify-between">
                <div>
                    <div className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Total Anggaran PKM</div>
                    <div className="text-3xl font-bold mt-1">Rp {totalBudget.toLocaleString('id-ID')}</div>
                </div>
                <DollarSign size={48} className="text-emerald-500 opacity-50" />
            </div>

            {/* Items */}
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-700 text-sm">Item #{idx + 1}</span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                                    Rp {(Number(item.volume) * Number(item.unit_cost)).toLocaleString('id-ID')}
                                </span>
                            </div>
                            {items.length > 1 && (
                                <button type="button" onClick={() => removeItem(idx)}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold">
                                    <Trash2 size={13} /> Hapus
                                </button>
                            )}
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Tahun</label>
                                <select value={item.year} onChange={e => update(idx, 'year', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm">
                                    <option value={1}>Tahun 1</option>
                                    <option value={2}>Tahun 2</option>
                                    <option value={3}>Tahun 3</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Kelompok Biaya <span className="text-red-500">*</span>
                                </label>
                                <select required value={item.cost_group}
                                    onChange={e => update(idx, 'cost_group', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500">
                                    <option value="">-- Pilih Kelompok --</option>
                                    {COST_GROUPS.map((g, i) => <option key={i} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Komponen</label>
                                <input type="text" value={item.component}
                                    onChange={e => update(idx, 'component', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    placeholder="Contoh: Alat Teknologi Tepat Guna" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Nama Item <span className="text-red-500">*</span>
                                </label>
                                <input type="text" required value={item.item_name}
                                    onChange={e => update(idx, 'item_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Nama bahan/jasa/honorarium..." />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Satuan <span className="text-red-500">*</span>
                                </label>
                                <input type="text" required value={item.unit}
                                    onChange={e => update(idx, 'unit', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    placeholder="Contoh: Unit, OJ, OH, OK (kali)" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Volume <span className="text-red-500">*</span>
                                </label>
                                <input type="number" required min="0" step="0.01" value={item.volume}
                                    onChange={e => update(idx, 'volume', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">
                                    Harga Satuan (Rp) <span className="text-red-500">*</span>
                                </label>
                                <input type="number" required min="0" value={item.unit_cost}
                                    onChange={e => update(idx, 'unit_cost', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">URL Referensi Harga</label>
                                <input type="text" value={item.url_price}
                                    onChange={e => update(idx, 'url_price', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    placeholder="https://... (link referensi harga dari marketplace/situs resmi)" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={addItem}
                className="w-full border-2 border-dashed border-emerald-300 rounded-xl py-3 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Tambah Item Anggaran
            </button>

            <div className="flex justify-between pt-2">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-emerald-700 text-white rounded-lg font-bold shadow hover:bg-emerald-800 transition-all disabled:opacity-50 text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
