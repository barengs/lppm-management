import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Plus, FileHeart, Eye, ClipboardCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ReportModal from '../proposals/components/ReportModal';
import FullProposalPreviewModal from '../../components/pdf/FullProposalPreviewModal';
import DataTable from '../../components/DataTable';

const STATUS_MAP = {
    draft:     { label: 'Draft',    bg: 'bg-gray-100',   text: 'text-gray-700' },
    submitted: { label: 'Terkirim', bg: 'bg-blue-100',   text: 'text-blue-700' },
    review:    { label: 'Direview', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    accepted:  { label: 'Diterima', bg: 'bg-green-100',  text: 'text-green-700' },
    rejected:  { label: 'Ditolak',  bg: 'bg-red-100',    text: 'text-red-700' },
};

const TOTAL_STEPS = 10;

export default function PkmIndex() {
    const { token, hasPermission } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const fetchData = () => {
        setLoading(true);
        axios.get('/api/pkm-proposals', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setProposals(r.data))
            .catch(() => setProposals([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin memindahkan proposal ini ke tempat sampah?')) return;
        try {
            await axios.delete(`/api/admin_pkm/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Proposal PKM berhasil dipindahkan ke tempat sampah.');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus proposal.');
        }
    };

    const canManageTrash = Boolean(hasPermission && hasPermission('manage_pkm_trash'));

    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <span className="text-xs font-semibold text-gray-500">#{row.original.id}</span>
            ),
        },
        {
            id: 'title',
            accessorFn: (row) => `${row.title || ''} ${row.scheme_group || ''} ${row.user?.name || ''}`,
            header: 'Judul Proposal',
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <div className="max-w-md">
                        <Link
                            to={p.status === 'draft' ? `/pkm/create/${p.id}` : `/pkm/${p.id}`}
                            className="font-semibold text-gray-800 hover:text-green-700 line-clamp-2 transition-colors"
                        >
                            {p.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {p.scheme_group && <span>{p.scheme_group}</span>}
                            {p.scheme_group && p.user?.name && <span>•</span>}
                            {p.user?.name && <span>{p.user.name}</span>}
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'fiscal_year',
            accessorFn: (row) => row.fiscal_year?.year || '-',
            header: 'Tahun',
            cell: ({ row }) => (
                <span className="text-gray-700 whitespace-nowrap">{row.original.fiscal_year?.year || '-'}</span>
            ),
        },
        {
            accessorKey: 'budget',
            header: 'Anggaran',
            cell: ({ row }) => (
                <span className="font-medium text-gray-800 whitespace-nowrap">
                    Rp {Number(row.original.budget || 0).toLocaleString('id-ID')}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const p = row.original;
                const status = STATUS_MAP[p.status] || STATUS_MAP.draft;
                const step = Math.min(p.current_step || 0, TOTAL_STEPS);
                const stepPct = Math.min(100, Math.round((step / TOTAL_STEPS) * 100));

                return (
                    <div className="space-y-1 min-w-[110px]">
                        <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                            {status.label}
                        </span>
                        {p.status === 'draft' && (
                            <div>
                                <div className="text-[11px] text-gray-500">
                                    Tahap {step}/{TOTAL_STEPS} ({stepPct}%)
                                </div>
                                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${stepPct}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            enableSorting: false,
            cell: ({ row }) => {
                const p = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Link
                            to={p.status === 'draft' ? `/pkm/create/${p.id}` : `/pkm/${p.id}`}
                            className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-sm"
                            title={p.status === 'draft' ? 'Lanjutkan Pengisian' : 'Lihat Detail'}
                        >
                            <Eye size={17} />
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedProposal(p);
                                setIsPreviewOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm"
                            title="Pratinjau PDF"
                        >
                            <FileHeart size={17} />
                        </button>
                        {p.status === 'accepted' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedProposal(p);
                                    setIsReportOpen(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm"
                                title="Laporan Kemajuan/Akhir"
                            >
                                <ClipboardCheck size={17} />
                            </button>
                        )}
                        {canManageTrash && (
                            <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm"
                                title="Hapus (Soft Delete)"
                            >
                                <Trash2 size={17} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ], [canManageTrash]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow p-6 flex flex-wrap justify-between items-center gap-4 border-l-4 border-green-600">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proposal PKM Saya</h1>
                    <p className="text-gray-600">Program Kemitraan Masyarakat — Daftar usulan yang Anda buat atau ikuti.</p>
                </div>
                <div className="flex gap-2">
                    {canManageTrash && (
                        <Link
                            to="/admin/pkm/trash"
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-700 rounded-md font-bold shadow-sm hover:bg-red-200 transition-all text-sm"
                        >
                            <Trash2 size={16} /> Sampah Proposal
                        </Link>
                    )}
                    <Link
                        to="/pkm/create"
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-md font-bold shadow hover:bg-green-800 transition-all text-sm"
                    >
                        <Plus size={16} /> Ajukan PKM Baru
                    </Link>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white shadow rounded-sm border border-gray-100 p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <DataTable
                        data={proposals}
                        columns={columns}
                        options={{
                            enableGlobalFilter: true,
                            enableSorting: true,
                            enablePagination: true,
                            initialPageSize: 10,
                            pageSizeOptions: [10, 25, 50, 100],
                            searchPlaceholder: 'Cari judul, skema, pengusul, atau tahun...',
                            emptyMessage: 'Belum ada proposal PKM.',
                        }}
                    />
                )}
            </div>

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                proposalId={selectedProposal?.id}
                title={selectedProposal?.title}
                type="pkm"
            />

            <FullProposalPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                proposalId={selectedProposal?.id}
                type="pkm"
            />
        </div>
    );
}
