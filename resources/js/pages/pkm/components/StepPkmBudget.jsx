import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, AlertCircle, DollarSign, Calculator, Info } from 'lucide-react';
import axios from 'axios';

const formatRp = (val) => {
    if (!val && val !== 0) return '0';
    return Number(val).toLocaleString('id-ID');
};

export default function StepPkmBudget({ proposalId, token, onNext, onBack, initialData }) {
    const [items, setItems] = useState([]);
    const [groups, setGroups] = useState([]);
    const [allComponents, setAllComponents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch Master Data
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [gRes, cRes] = await Promise.all([
                    axios.get('/api/pkm-master-data?type=cost_group', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/pkm-master-data?type=budget_component', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setGroups(gRes.data);
                setAllComponents(cRes.data);
            } catch (err) {
                console.error("Failed to fetch budget master data", err);
            }
        };
        fetchMaster();
    }, [token]);

    // 2. Initialize Data
    useEffect(() => {
        if (initialData?.budget_items?.length > 0) {
            setItems(initialData.budget_items.map(b => ({
                id: b.id || Math.random().toString(36).substr(2, 9),
                cost_group: b.cost_group,
                component: b.component || '',
                item_name: b.item_name || '',
                unit: b.unit || '',
                volume: Number(b.volume) || 0,
                unit_cost: Number(b.unit_cost) || 0,
            })));
        } else {
            setItems([]);
        }
    }, [initialData]);

    // 3. Helper Functions
    const getGroupItems = (groupName) => items.filter(it => it.cost_group === groupName);
    
    const calculateGroupTotal = (groupName) => {
        return getGroupItems(groupName).reduce((sum, it) => sum + (it.volume * it.unit_cost), 0);
    };

    const grandTotal = useMemo(() => {
        return items.reduce((sum, it) => sum + (it.volume * it.unit_cost), 0);
    }, [items]);

    const addItem = (groupName) => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            cost_group: groupName,
            component: '',
            item_name: '',
            unit: '',
            volume: 1,
            unit_cost: 0,
        };
        setItems(prev => [...prev, newItem]);
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(it => it.id !== id));
    };

    const updateItem = (id, field, val) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Optional: Validate caps before saving
        const violations = groups.filter(g => {
            const total = calculateGroupTotal(g.name);
            const cap = g.metadata?.cap || 100;
            const percent = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
            return percent > cap + 0.1; // small buffer for floating point
        });

        // We'll show a warning but allow save, or block if required. 
        // For now, just save.

        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { 
                    step: 8, 
                    budget_items: items,
                    total_budget: grandTotal
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan RAB.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
            )}

            {/* Header Summary */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden sticky top-0 z-10">
                <div className="bg-green-700 px-6 py-4 flex items-center justify-between text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Rencana Anggaran Biaya (Grand Total)</p>
                        <h2 className="text-3xl font-black mt-1">Rp {formatRp(grandTotal)}</h2>
                    </div>
                    <Calculator size={40} className="opacity-20" />
                </div>
            </div>

            {/* Render each group */}
            {groups.map((group, gIdx) => {
                const groupItems = getGroupItems(group.name);
                const groupTotal = calculateGroupTotal(group.name);
                const cap = group.metadata?.cap || 100;
                const percentage = grandTotal > 0 ? (groupTotal / grandTotal) * 100 : 0;
                const isOverCap = percentage > cap + 0.1;
                const prefix = group.metadata?.prefix || String.fromCharCode(65 + gIdx);

                return (
                    <div key={group.id} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                        {/* Group Header */}
                        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black text-sm border border-green-200">
                                    {prefix}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-tight">{group.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                        Alokasi Maksimal: <span className="text-green-700">{cap}%</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-black ${isOverCap ? 'text-red-600' : 'text-gray-900'}`}>
                                    Rp {formatRp(groupTotal)}
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-0.5">
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${isOverCap ? 'bg-red-500' : 'bg-green-600'}`} 
                                            style={{ width: `${Math.min(percentage, 100)}%` }} 
                                        />
                                    </div>
                                    <span className={`text-[10px] font-black ${isOverCap ? 'text-red-600' : 'text-gray-500'}`}>
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12 text-center">No</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Komponen & Nama Item</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Satuan</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 text-center">Vol</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Harga Satuan</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40 text-right">Subtotal</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {groupItems.map((it, idx) => (
                                        <tr key={it.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-center text-xs font-bold text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-4 space-y-2">
                                                <select 
                                                    required
                                                    className="w-full border-gray-200 rounded-sm text-xs focus:ring-green-500 py-1.5"
                                                    value={it.component}
                                                    onChange={e => updateItem(it.id, 'component', e.target.value)}
                                                >
                                                    <option value="">-- Pilih Komponen --</option>
                                                    {allComponents.filter(c => c.parent_id === group.id).map(c => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <input 
                                                    required
                                                    type="text"
                                                    placeholder="Deskripsi spesifik item..."
                                                    className="w-full border-gray-200 rounded-sm text-xs focus:ring-green-500 py-1.5"
                                                    value={it.item_name}
                                                    onChange={e => updateItem(it.id, 'item_name', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input 
                                                    required
                                                    type="text"
                                                    placeholder="Contoh: OJ, Unit"
                                                    className="w-full border-gray-200 rounded-sm text-xs focus:ring-green-500 py-1.5"
                                                    value={it.unit}
                                                    onChange={e => updateItem(it.id, 'unit', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input 
                                                    required
                                                    type="number"
                                                    min="1"
                                                    className="w-full border-gray-200 rounded-sm text-xs text-center focus:ring-green-500 py-1.5"
                                                    value={it.volume}
                                                    onChange={e => updateItem(it.id, 'volume', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">Rp</span>
                                                    <input 
                                                        required
                                                        type="number"
                                                        min="0"
                                                        className="w-full border-gray-200 rounded-sm text-xs pl-7 focus:ring-green-500 py-1.5"
                                                        value={it.unit_cost}
                                                        onChange={e => updateItem(it.id, 'unit_cost', Number(e.target.value))}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="text-xs font-bold text-gray-800">
                                                    {formatRp(it.volume * it.unit_cost)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeItem(it.id)}
                                                    className="text-red-300 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {groupItems.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Info size={24} className="text-gray-300" />
                                                    <p className="text-xs text-gray-400 italic">Belum ada item untuk kelompok ini.</p>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => addItem(group.name)}
                                                        className="mt-2 text-[10px] font-bold text-green-700 hover:underline uppercase tracking-widest"
                                                    >
                                                        + Tambah Item Pertama
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {groupItems.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50/30">
                                            <td colSpan="5" className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Total {group.name}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-black text-gray-900">Rp {formatRp(groupTotal)}</span>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Add Button Footer */}
                        {groupItems.length > 0 && (
                            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => addItem(group.name)}
                                    className="flex items-center gap-2 text-[10px] font-black text-green-700 uppercase tracking-widest hover:text-green-800 transition-colors"
                                >
                                    <Plus size={14} /> Tambah Item Baru
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Bottom Warning if over cap */}
            {items.length > 0 && groups.some(g => (calculateGroupTotal(g.name) / grandTotal * 100) > (g.metadata?.cap || 100) + 0.1) && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3">
                    <AlertCircle className="text-red-600 shrink-0" size={20} />
                    <div>
                        <p className="text-xs font-bold text-red-800 uppercase tracking-tight">Peringatan Alokasi Anggaran</p>
                        <p className="text-xs text-red-700 mt-1">Beberapa kelompok biaya melebihi persentase maksimal yang diizinkan. Mohon sesuaikan rincian anggaran Anda sebelum melanjutkan.</p>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-100">
                <button type="button" onClick={onBack}
                    className="px-8 py-3 border-2 border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest transition-all">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-10 py-3 bg-green-700 text-white rounded-sm font-black shadow-lg hover:bg-green-800 transition-all disabled:opacity-50 text-xs uppercase tracking-[0.2em]">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
