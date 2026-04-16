import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { Plus, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight, Database } from 'lucide-react';
import { toast } from 'react-toastify';

const TYPE_LABELS = {
    scheme_group:  'Kelompok Skema',
    scope:         'Ruang Lingkup',
    focus_area:    'Bidang Fokus',
    output_group:  'Kelompok Luaran',
    cost_group:    'Kelompok Biaya (RAB)',
};

const TYPE_COLORS = {
    scheme_group:  'green',
    scope:         'blue',
    focus_area:    'purple',
    output_group:  'orange',
    cost_group:    'red',
};

function TypeTab({ type, label, color, active, count, onClick }) {
    const activeClasses = {
        green:  'bg-green-700 text-white border-green-700',
        blue:   'bg-blue-700 text-white border-blue-700',
        purple: 'bg-purple-700 text-white border-purple-700',
        orange: 'bg-orange-600 text-white border-orange-600',
        red:    'bg-red-700 text-white border-red-700',
    };
    const inactiveClasses = 'bg-white text-gray-600 border-gray-200 hover:border-gray-400';

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-bold border rounded-sm transition-all flex items-center gap-2 ${active ? activeClasses[color] : inactiveClasses}`}
        >
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                {count}
            </span>
        </button>
    );
}

export default function PkmMasterDataIndex() {
    const { token } = useAuth();
    const [allData, setAllData] = useState([]);
    const [activeType, setActiveType] = useState('scheme_group');
    const [isLoading, setIsLoading] = useState(true);

    // Inline‑add state
    const [addName, setAddName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Inline‑edit state
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/pkm-master-data/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllData(res.data);
        } catch {
            toast.error('Gagal memuat master data PKM.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const currentItems = allData.filter(d => d.type === activeType);

    // ── Create ──────────────────────────────────────────────────────────────
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!addName.trim()) return;
        setIsAdding(true);
        try {
            await axios.post('/api/pkm-master-data', {
                type: activeType,
                name: addName.trim(),
                sort_order: currentItems.length + 1,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setAddName('');
            toast.success('Data berhasil ditambahkan.');
            fetchAll();
        } catch {
            toast.error('Gagal menambahkan data.');
        } finally {
            setIsAdding(false);
        }
    };

    // ── Update name ─────────────────────────────────────────────────────────
    const handleSaveEdit = async (id) => {
        if (!editName.trim()) return;
        try {
            await axios.put(`/api/pkm-master-data/${id}`, { name: editName.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Data diperbarui.');
            setEditingId(null);
            fetchAll();
        } catch {
            toast.error('Gagal memperbarui data.');
        }
    };

    // ── Toggle active ───────────────────────────────────────────────────────
    const handleToggle = async (item) => {
        try {
            await axios.put(`/api/pkm-master-data/${item.id}`, { is_active: !item.is_active }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAll();
        } catch {
            toast.error('Gagal mengubah status.');
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm('Hapus data ini?')) return;
        try {
            await axios.delete(`/api/pkm-master-data/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Data dihapus.');
            fetchAll();
        } catch {
            toast.error('Gagal menghapus data.');
        }
    };

    const color = TYPE_COLORS[activeType] || 'green';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow p-6 border-l-4 border-green-600">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Database className="text-green-700" size={28} />
                    Master Data PKM
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Kelola opsi dropdown yang digunakan di formulir pengajuan Proposal PKM.
                </p>
            </div>

            {/* Type Tabs */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(TYPE_LABELS).map(([type, label]) => (
                    <TypeTab
                        key={type}
                        type={type}
                        label={label}
                        color={TYPE_COLORS[type]}
                        active={activeType === type}
                        count={allData.filter(d => d.type === type).length}
                        onClick={() => setActiveType(type)}
                    />
                ))}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">{TYPE_LABELS[activeType]}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{currentItems.length} item terdaftar</p>
                    </div>
                </div>

                {/* Add Form */}
                <form onSubmit={handleAdd} className="p-4 bg-gray-50 border-b border-gray-100 flex gap-2">
                    <input
                        type="text"
                        value={addName}
                        onChange={e => setAddName(e.target.value)}
                        placeholder={`Tambah ${TYPE_LABELS[activeType]} baru...`}
                        className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isAdding || !addName.trim()}
                        className="px-4 py-2 bg-green-700 text-white rounded-sm text-sm font-bold hover:bg-green-800 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Plus size={16} /> Tambah
                    </button>
                </form>

                {/* List */}
                {isLoading ? (
                    <div className="p-10 text-center text-sm text-gray-400">Memuat data...</div>
                ) : currentItems.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-400">
                        Belum ada data. Tambahkan item pertama di atas.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {currentItems.map((item, idx) => (
                            <li key={item.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 ${!item.is_active ? 'opacity-50' : ''}`}>
                                {/* Order */}
                                <span className="text-[11px] text-gray-400 w-6 text-right shrink-0">{idx + 1}</span>

                                {/* Name / Edit Input */}
                                {editingId === item.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="flex-1 border border-green-400 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                                    />
                                ) : (
                                    <span className="flex-1 text-sm text-gray-800">{item.name}</span>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {editingId === item.id ? (
                                        <>
                                            <button onClick={() => handleSaveEdit(item.id)} className="p-1.5 text-green-700 hover:bg-green-50 rounded-sm" title="Simpan"><Check size={15} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-sm" title="Batal"><X size={15} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(item.id); setEditName(item.name); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm" title="Edit"><Edit2 size={15} /></button>
                                            <button onClick={() => handleToggle(item)} className="p-1.5 hover:bg-gray-100 rounded-sm" title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                                                {item.is_active
                                                    ? <ToggleRight size={17} className="text-green-600" />
                                                    : <ToggleLeft size={17} className="text-gray-400" />}
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-sm" title="Hapus"><Trash2 size={15} /></button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-sm p-4 text-sm text-blue-800">
                <p className="font-bold mb-1">ℹ️ Catatan:</p>
                <ul className="list-disc list-inside space-y-1 text-[13px]">
                    <li>Item yang <strong>dinonaktifkan</strong> tidak akan muncul di formulir pengusul, tetapi data lama yang sudah tersimpan tetap aman.</li>
                    <li>Urutan tampil mengikuti urutan nomor di daftar ini.</li>
                </ul>
            </div>
        </div>
    );
}
