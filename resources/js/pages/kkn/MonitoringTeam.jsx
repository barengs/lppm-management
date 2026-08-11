import React, { useState, useMemo } from 'react';
import {
    Users, User, MapPin, Search, Plus, Trash2, CheckSquare,
    Square, X, Shield, ChevronRight, Phone, Mail, Hash,
    ClipboardList, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import {
    useGetMonitorTeamQuery,
    useBulkAssignMonitorMutation,
    useRemoveMonitorFromPostoMutation,
    useGetPostosQuery,
    useGetKknPeriodsQuery,
} from '../../store/api/kknApi';

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        active:    { label: 'Aktif',    cls: 'bg-green-100 text-green-700' },
        draft:     { label: 'Draft',    cls: 'bg-gray-100  text-gray-600'  },
        completed: { label: 'Selesai',  cls: 'bg-blue-100  text-blue-700'  },
        inactive:  { label: 'Nonaktif', cls: 'bg-red-100   text-red-700'   },
    };
    const { label, cls } = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'md' }) => {
    const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' };
    const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];
    const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
    return (
        <div className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
};

export default function MonitoringTeam() {
    const { hasRole } = useAuth();
    const canManage = hasRole('admin') || hasRole('staff_kkn');

    // ── Filters ──────────────────────────────────────────────────────────────
    const [periodFilter, setPeriodFilter] = useState('');
    const [evaluatorSearch, setEvaluatorSearch] = useState('');
    const [selectedEvaluator, setSelectedEvaluator] = useState(null);

    // ── Modal state ──────────────────────────────────────────────────────────
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [modalSearch, setModalSearch] = useState('');
    const [selectedPostoIds, setSelectedPostoIds] = useState([]);

    // ── RTK Query ────────────────────────────────────────────────────────────
    const { data: periodsData } = useGetKknPeriodsQuery();
    const periods = useMemo(() => {
        const d = periodsData?.data ?? periodsData ?? [];
        return Array.isArray(d) ? d : [];
    }, [periodsData]);

    const { data: teamData, isLoading, refetch } = useGetMonitorTeamQuery(
        periodFilter ? { kkn_period_id: periodFilter } : {}
    );
    const team = useMemo(() => Array.isArray(teamData) ? teamData : [], [teamData]);

    const { data: postosData } = useGetPostosQuery(
        periodFilter ? { kkn_period_id: periodFilter } : {},
        { skip: !showAssignModal }
    );
    const allPostos = useMemo(() => {
        const d = postosData?.data ?? postosData ?? [];
        return Array.isArray(d) ? d : [];
    }, [postosData]);

    const [bulkAssign, { isLoading: isAssigning }] = useBulkAssignMonitorMutation();
    const [removeFromPosto, { isLoading: isRemoving }] = useRemoveMonitorFromPostoMutation();

    // ── Derived data ─────────────────────────────────────────────────────────
    const filteredTeam = useMemo(() => {
        if (!evaluatorSearch) return team;
        const q = evaluatorSearch.toLowerCase();
        return team.filter(e =>
            e.name.toLowerCase().includes(q) ||
            e.email?.toLowerCase().includes(q) ||
            e.nidn?.toLowerCase().includes(q)
        );
    }, [team, evaluatorSearch]);

    // All postos assigned to ANY evaluator
    const globallyAssignedPostoIds = useMemo(() => {
        const set = new Set();
        team.forEach(evaluator => {
            evaluator.postos?.forEach(p => set.add(p.id));
        });
        return set;
    }, [team]);

    const availablePostos = useMemo(() => {
        let list = allPostos.filter(p => !globallyAssignedPostoIds.has(p.id));
        if (modalSearch) {
            const q = modalSearch.toLowerCase();
            list = list.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.location?.name?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [allPostos, globallyAssignedPostoIds, modalSearch]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSelectEvaluator = (evaluator) => {
        setSelectedEvaluator(evaluator);
        setSelectedPostoIds([]);
    };

    const togglePosto = (id) => {
        setSelectedPostoIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedPostoIds.length === availablePostos.length) {
            setSelectedPostoIds([]);
        } else {
            setSelectedPostoIds(availablePostos.map(p => p.id));
        }
    };

    const handleOpenAssignModal = () => {
        setModalSearch('');
        setSelectedPostoIds([]);
        setShowAssignModal(true);
    };

    const handleBulkAssign = async () => {
        if (!selectedEvaluator || selectedPostoIds.length === 0) return;
        try {
            await bulkAssign({
                user_id: selectedEvaluator.id,
                posto_ids: selectedPostoIds,
            }).unwrap();
            toast.success(`Evaluator berhasil ditugaskan ke ${selectedPostoIds.length} posko`);
            setShowAssignModal(false);
            setSelectedPostoIds([]);
            refetch();
        } catch (err) {
            toast.error(err.data?.message || 'Gagal menugaskan evaluator');
        }
    };

    const handleRemoveFromPosto = async (postoId, postoName) => {
        if (!confirm(`Hapus ${selectedEvaluator?.name} dari Posko "${postoName}"?`)) return;
        try {
            await removeFromPosto({ postoId, userId: selectedEvaluator.id }).unwrap();
            toast.success('Penugasan berhasil dihapus');
            refetch();
        } catch (err) {
            toast.error(err.data?.message || 'Gagal menghapus penugasan');
        }
    };

    React.useEffect(() => {
        if (selectedEvaluator && team.length > 0) {
            const updated = team.find(e => e.id === selectedEvaluator.id);
            if (updated) setSelectedEvaluator(updated);
        }
    }, [team]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* ── Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tim Monitoring Lapangan</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola penugasan dosen evaluator ke posko KKN secara terpusat
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        id="period-filter"
                        value={periodFilter}
                        onChange={e => { setPeriodFilter(e.target.value); setSelectedEvaluator(null); }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Semua Periode</option>
                        {periods.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={refetch}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* ── Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-50 rounded-lg"><Shield size={20} className="text-violet-600" /></div>
                        <div>
                            <p className="text-xs text-gray-500">Total Evaluator</p>
                            <p className="text-2xl font-bold text-gray-900">{team.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg"><MapPin size={20} className="text-green-600" /></div>
                        <div>
                            <p className="text-xs text-gray-500">Total Penugasan</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {team.reduce((sum, e) => sum + e.posto_count, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg"><ClipboardList size={20} className="text-amber-600" /></div>
                        <div>
                            <p className="text-xs text-gray-500">Belum Ditugaskan</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {team.filter(e => e.posto_count === 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Two-Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Left Panel — Evaluator List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden" style={{ minHeight: '520px' }}>
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Dosen Evaluator</h2>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="evaluator-search"
                                type="text"
                                value={evaluatorSearch}
                                onChange={e => setEvaluatorSearch(e.target.value)}
                                placeholder="Cari nama, email, NIDN..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-400">
                                <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                                <p className="text-sm">Memuat data...</p>
                            </div>
                        ) : filteredTeam.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Shield size={32} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Tidak ada evaluator ditemukan</p>
                            </div>
                        ) : (
                            filteredTeam.map(evaluator => {
                                const isSelected = selectedEvaluator?.id === evaluator.id;
                                return (
                                    <button
                                        key={evaluator.id}
                                        id={`evaluator-${evaluator.id}`}
                                        onClick={() => handleSelectEvaluator(evaluator)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${
                                            isSelected ? 'bg-green-50 border-l-4 border-green-500' : 'border-l-4 border-transparent'
                                        }`}
                                    >
                                        <Avatar name={evaluator.name} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                                                {evaluator.name}
                                            </p>
                                            {evaluator.nidn && (
                                                <p className="text-xs text-gray-400 mt-0.5">NIDN: {evaluator.nidn}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    evaluator.posto_count > 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    <MapPin size={10} />
                                                    {evaluator.posto_count} posko
                                                </span>
                                            </div>
                                        </div>
                                        {isSelected && <ChevronRight size={16} className="text-green-500 flex-shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel — Assigned Postos */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden" style={{ minHeight: '520px' }}>
                    {!selectedEvaluator ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400">
                            <Users size={48} className="mb-4 opacity-30" />
                            <p className="text-sm font-medium text-gray-500">Pilih evaluator di sebelah kiri</p>
                            <p className="text-xs mt-1 text-center">untuk melihat dan mengelola penugasan posko</p>
                        </div>
                    ) : (
                        <>
                            {/* Right Panel Header */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={selectedEvaluator.name} size="lg" />
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900">{selectedEvaluator.name}</h2>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                {selectedEvaluator.email && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Mail size={11} />{selectedEvaluator.email}
                                                    </span>
                                                )}
                                                {selectedEvaluator.phone && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Phone size={11} />{selectedEvaluator.phone}
                                                    </span>
                                                )}
                                                {selectedEvaluator.nidn && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Hash size={11} />NIDN: {selectedEvaluator.nidn}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <button
                                            id="btn-tugaskan-posko"
                                            onClick={handleOpenAssignModal}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                                        >
                                            <Plus size={16} />
                                            Tugaskan ke Posko
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Posto List */}
                            <div className="flex-1 overflow-y-auto">
                                {selectedEvaluator.postos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                        <AlertCircle size={36} className="mb-3 opacity-40" />
                                        <p className="text-sm font-medium text-gray-500">Belum ada penugasan</p>
                                        <p className="text-xs mt-1">Klik "Tugaskan ke Posko" untuk mulai menugaskan</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posko</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Lokasi</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Anggota</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                {canManage && <th className="px-4 py-3"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedEvaluator.postos.map(posto => (
                                                <tr key={posto.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-900">{posto.name}</p>
                                                        {posto.period && (
                                                            <p className="text-xs text-gray-400 mt-0.5">{posto.period}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={13} className="text-gray-400" />
                                                            {posto.location || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                                        <span className="flex items-center gap-1">
                                                            <Users size={13} className="text-gray-400" />
                                                            {posto.member_count} orang
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={posto.status} />
                                                    </td>
                                                    {canManage && (
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                id={`btn-hapus-${posto.id}`}
                                                                onClick={() => handleRemoveFromPosto(posto.id, posto.name)}
                                                                disabled={isRemoving}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                                                                title="Hapus penugasan"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Bulk Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAssignModal(false)}
                    />
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Tugaskan ke Posko</h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Pilih posko untuk <span className="font-medium text-gray-700">{selectedEvaluator?.name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search & Select All */}
                        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="modal-posko-search"
                                    type="text"
                                    value={modalSearch}
                                    onChange={e => setModalSearch(e.target.value)}
                                    placeholder="Cari nama posko atau lokasi..."
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {availablePostos.length > 0 && (
                                <button
                                    id="btn-pilih-semua"
                                    onClick={toggleAll}
                                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    {selectedPostoIds.length === availablePostos.length
                                        ? <><CheckSquare size={16} /> Batal Pilih Semua</>
                                        : <><Square size={16} /> Pilih Semua ({availablePostos.length})</>
                                    }
                                </button>
                            )}
                        </div>

                        {/* Posto Checklist */}
                        <div className="flex-1 overflow-y-auto px-6 py-2">
                            {availablePostos.length === 0 ? (
                                <div className="py-12 text-center text-gray-400">
                                    <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">Semua posko sudah ditugaskan ke evaluator ini</p>
                                </div>
                            ) : (
                                <div className="space-y-1 py-2">
                                    {availablePostos.map(posto => {
                                        const checked = selectedPostoIds.includes(posto.id);
                                        return (
                                            <button
                                                key={posto.id}
                                                id={`modal-posto-${posto.id}`}
                                                onClick={() => togglePosto(posto.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                                                    checked
                                                        ? 'bg-green-50 border border-green-200'
                                                        : 'hover:bg-gray-50 border border-transparent'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                    checked ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                                }`}>
                                                    {checked && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${checked ? 'text-green-700' : 'text-gray-800'}`}>
                                                        {posto.name}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        {posto.location?.name && (
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <MapPin size={10} />{posto.location.name}
                                                            </span>
                                                        )}
                                                        <StatusBadge status={posto.status} />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                {selectedPostoIds.length > 0
                                    ? <span className="font-medium text-green-600">{selectedPostoIds.length} posko dipilih</span>
                                    : 'Belum ada posko dipilih'
                                }
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    id="btn-simpan-penugasan"
                                    onClick={handleBulkAssign}
                                    disabled={selectedPostoIds.length === 0 || isAssigning}
                                    className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isAssigning ? (
                                        <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
                                    ) : (
                                        <><Plus size={14} /> Tugaskan</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
