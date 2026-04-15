import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Plus, FileHeart, ChevronRight, Calendar, Users, DollarSign, Clock } from 'lucide-react';

const STATUS_MAP = {
    draft:     { label: 'Draft',       bg: 'bg-gray-100',   text: 'text-gray-700' },
    submitted: { label: 'Terkirim',    bg: 'bg-blue-100',   text: 'text-blue-700' },
    review:    { label: 'Direview',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
    accepted:  { label: 'Diterima',   bg: 'bg-green-100',  text: 'text-green-700' },
    rejected:  { label: 'Ditolak',    bg: 'bg-red-100',    text: 'text-red-700' },
};

const STEP_LABELS = [
    'Identitas', 'Tim Pengusul', 'Mitra', 'Asta Cita', 'Bidang', 'Luaran', 'RAB', 'Dokumen',
];

export default function PkmIndex() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        axios.get('/api/pkm-proposals', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setProposals(r.data))
            .catch(() => setProposals([]))
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileHeart size={24} className="text-emerald-600" />
                        Proposal PKM Saya
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Program Kemitraan Masyarakat — Daftar usulan yang Anda buat atau ikuti.</p>
                </div>
                <Link to="/pkm/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow hover:bg-emerald-800 transition-all text-sm">
                    <Plus size={16} /> Ajukan PKM Baru
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            ) : proposals.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow">
                    <FileHeart size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">Belum ada proposal PKM.</p>
                    <p className="text-sm mt-1">Klik "Ajukan PKM Baru" untuk memulai pengajuan.</p>
                    <Link to="/pkm/create"
                        className="inline-block mt-4 px-6 py-2 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all">
                        Ajukan Sekarang
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {proposals.map(p => {
                        const status = STATUS_MAP[p.status] || STATUS_MAP.draft;
                        const stepPct = Math.min(100, Math.round(((p.current_step || 0) / 8) * 100));
                        return (
                            <div key={p.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Title row */}
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                                                    {status.label}
                                                </span>
                                                <span className="text-xs text-gray-400">#{p.id}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-2">{p.title}</h3>
                                        </div>
                                        <Link to={p.status === 'draft' ? `/pkm/create/${p.id}` : `/pkm/${p.id}`}
                                            className="shrink-0 flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline">
                                            {p.status === 'draft' ? 'Lanjutkan' : 'Lihat Detail'}
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {p.fiscal_year?.year || '-'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={12} />
                                            Rp {Number(p.budget || 0).toLocaleString('id-ID')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Progress bar (for draft) */}
                                    {p.status === 'draft' && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
                                                <span>Progres Pengisian</span>
                                                <span className="font-semibold text-emerald-700">
                                                    Tahap {Math.min(p.current_step || 0, 8)}/8 — {stepPct}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all"
                                                    style={{ width: `${stepPct}%` }} />
                                            </div>
                                            <div className="flex mt-1 gap-0.5">
                                                {STEP_LABELS.map((lbl, i) => (
                                                    <div key={i} title={lbl}
                                                        className={`flex-1 h-1 rounded-sm ${(p.current_step || 0) > i ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
