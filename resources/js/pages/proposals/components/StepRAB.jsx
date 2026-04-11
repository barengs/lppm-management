import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calculator, Info } from 'lucide-react';

export default function StepRAB({ proposalId, token, onNext, onBack, initialData }) {
    const [budgetItems, setBudgetItems] = useState([]);
    const [duration, setDuration] = useState(1);
    const [currentYearView, setCurrentYearView] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [costGroups, setCostGroups] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        Promise.all([
            axios.get('/api/master/selections/cost_group', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('/api/master/selections/rab_unit', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([cgRes, uRes]) => {
            setCostGroups(cgRes.data);
            setUnits(uRes.data);
        });

        if (initialData?.identity?.duration_years) {
            setDuration(parseInt(initialData.identity.duration_years));
        }
        
        if (initialData?.budget_items && initialData.budget_items.length > 0) {
            setBudgetItems(initialData.budget_items);
        } else {
            // Default first item for year 1
            setBudgetItems([{ execution_year: 1, cost_group: 'honorarium', item_name: '', quantity: 1, unit: 'org_bln', unit_cost: 0 }]);
        }
    }, [initialData]);

    const addItem = (year) => {
        setBudgetItems([...budgetItems, { execution_year: year, cost_group: 'materials', item_name: '', quantity: 1, unit: 'unit', unit_cost: 0 }]);
    };

    const removeItem = (index) => {
        setBudgetItems(budgetItems.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...budgetItems];
        newItems[index][field] = value;
        setBudgetItems(newItems);
    };

    const calculateYearTotal = (year) => {
        return budgetItems
            .filter(item => item.execution_year === year)
            .reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    };

    const calculateGrandTotal = () => {
        return budgetItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    };

    const handleSave = async () => {
        if (budgetItems.some(i => !i.item_name || i.unit_cost <= 0)) {
            setError("Semua item belanja harus memiliki nama dan biaya valid.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 4,
                budget_items: budgetItems
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaving(false);
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan RAB.");
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start">
                <Info className="text-green-600 mr-2 mt-0.5" size={18} />
                <div className="text-xs text-green-800">
                    <p className="font-bold">Panduan Pengisian RAB:</p>
                    <ul className="list-disc ml-4 space-y-1 mt-1">
                        <li>Gunakan satuan yang standar (org/bln, unit, paket, hari, dsb).</li>
                        <li>Sesuai dengan SBM (Standar Biaya Masukan) yang berlaku.</li>
                        <li>Pastikan total usulan tidak melebihi batas maksimal skema ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(initialData?.scheme?.max_budget || 0)}).</li>
                    </ul>
                </div>
            </div>

            {/* Year Selector Tabs */}
            {duration > 1 && (
                <div className="flex border-b border-gray-100 mb-4">
                    {[...Array(duration)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentYearView(i + 1)}
                            className={`px-4 py-2 text-sm font-bold transition-colors ${currentYearView === i + 1 ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Tahun {i + 1}
                        </button>
                    ))}
                </div>
            )}

            <div className="overflow-x-auto border border-gray-100 rounded-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Kelompok</th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Item Belanja</th>
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase w-20">Vol</th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase w-24">Satuan</th>
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Harga Satuan</th>
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Total</th>
                            <th className="px-3 py-2 text-center w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {budgetItems.filter(item => item.execution_year === currentYearView).map((item, idx) => {
                            const originalIdx = budgetItems.indexOf(item);
                            return (
                                <tr key={originalIdx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2">
                                        <select 
                                            className="w-full text-xs border-gray-200 p-1 bg-white rounded-sm"
                                            value={item.cost_group}
                                            onChange={e => updateItem(originalIdx, 'cost_group', e.target.value)}
                                        >
                                            {costGroups.map(cg => (
                                                <option key={cg.key} value={cg.key}>{cg.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border-gray-200 p-1 rounded-sm"
                                            placeholder="Nama item..."
                                            value={item.item_name}
                                            onChange={e => updateItem(originalIdx, 'item_name', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="number"
                                            className="w-full text-xs border-gray-200 p-1 text-right rounded-sm"
                                            value={item.quantity}
                                            onChange={e => updateItem(originalIdx, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <select 
                                            className="w-full text-xs border-gray-200 p-1 bg-white rounded-sm"
                                            value={item.unit}
                                            onChange={e => updateItem(originalIdx, 'unit', e.target.value)}
                                        >
                                            <option value="">-- Pilih Satuan --</option>
                                            {units.map(u => (
                                                <option key={u.key} value={u.key}>{u.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="number"
                                            className="w-full text-xs border-gray-200 p-1 text-right rounded-sm"
                                            value={item.unit_cost}
                                            onChange={e => updateItem(originalIdx, 'unit_cost', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-bold text-gray-700">
                                        {(item.quantity * item.unit_cost).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-3 py-2 text-center text-red-500 hover:text-red-700 cursor-pointer">
                                        <button onClick={() => removeItem(originalIdx)}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold text-gray-700">
                        <tr>
                            <td colSpan={5} className="px-3 py-2 text-right text-xs">Total Tahun {currentYearView}</td>
                            <td className="px-3 py-2 text-right text-xs text-green-700">
                                {calculateYearTotal(currentYearView).toLocaleString('id-ID')}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-between items-center">
                <button 
                    onClick={() => addItem(currentYearView)}
                    className="flex items-center text-xs font-bold text-green-700 hover:text-green-800"
                >
                    <Plus size={16} className="mr-1" /> Tambah Item Baru
                </button>
                <div className="p-3 bg-gray-900 text-white rounded-sm flex items-center space-x-3">
                    <Calculator size={18} className="text-green-400" />
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Total Keseluruhan</p>
                        <p className="text-lg font-bold leading-none mt-1">Rp {calculateGrandTotal().toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-sm">{error}</div>}

            <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Kembali
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-2 bg-green-700 text-white rounded-sm text-sm font-bold shadow-md hover:bg-green-800 disabled:opacity-50"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan & Lanjut'}
                </button>
            </div>
        </div>
    );
}
