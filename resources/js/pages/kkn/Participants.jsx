import React, { useState, useMemo } from 'react';
import {
    Users, Search, Filter, CheckCircle, XCircle,
    AlertCircle, Clock, Eye, User, MapPin, Calendar,
    Mail, Phone, GraduationCap, Award, FileText,
    BarChart2, PieChart as PieChartIcon, Map, ArrowLeft, Download
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    useGetRegistrationsQuery, useGetStatisticsQuery, useGetRegistrationByIdQuery,
    useApproveRegistrationMutation, useRejectRegistrationMutation,
    useRequestRevisionMutation, useAddNoteMutation, useUpdateRegistrationMutation,
    useExportKknRegistrationsMutation
} from '../../store/api/kknApi';
import { useGetStudyProgramsQuery } from '../../store/api/masterDataApi';
import DocumentPreview, { DocumentCard } from '../../components/DocumentPreview';
import ActivityTimeline from '../../components/ActivityTimeline';
import DataTable from '../../components/DataTable';

const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Review',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
    },
    approved: {
        label: 'Disetujui',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
    },
    rejected: {
        label: 'Ditolak',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
    },
    needs_revision: {
        label: 'Perlu Revisi',
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle
    }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F87171', '#60A5FA', '#34D399', '#FBBF24'];

export default function KknParticipants() {
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        prodi_id: '',
        per_page: 10,
        page: 1
    });
    const [selectedId, setSelectedId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'table'
    // RTK Query hooks
    const { data: registrationsData, isLoading: loading, refetch } = useGetRegistrationsQuery(filters);
    const { data: statistics } = useGetStatisticsQuery();
    const { data: selectedRegistration } = useGetRegistrationByIdQuery(selectedId, { skip: !selectedId });
    const { data: studyPrograms = [] } = useGetStudyProgramsQuery();

    const [approveRegistration] = useApproveRegistrationMutation();
    const [rejectRegistration] = useRejectRegistrationMutation();
    const [requestRevision] = useRequestRevisionMutation();
    const [addNote] = useAddNoteMutation();
    const [exportRegistrations, { isLoading: isExporting }] = useExportKknRegistrationsMutation();

    const registrations = registrationsData?.data || [];
    const pagination = registrationsData;

    const viewDetail = (id) => {
        setSelectedId(id);
        setShowDetailModal(true);
    };

    const handleApprove = async (id, note) => {
        try {
            await approveRegistration({ id, note }).unwrap();
            setShowDetailModal(false);
            alert('Pendaftaran berhasil disetujui');
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Gagal menyetujui pendaftaran');
        }
    };

    const handleReject = async (id, note) => {
        if (!note || note.trim() === '') {
            alert('Catatan penolakan wajib diisi');
            return;
        }
        try {
            await rejectRegistration({ id, note }).unwrap();
            setShowDetailModal(false);
            alert('Pendaftaran berhasil ditolak');
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Gagal menolak pendaftaran');
        }
    };

    const handleRequestRevision = async (id, note) => {
        if (!note || note.trim() === '') {
            alert('Catatan revisi wajib diisi');
            return;
        }
        try {
            await requestRevision({ id, note }).unwrap();
            setShowDetailModal(false);
            alert('Permintaan revisi berhasil dikirim');
        } catch (error) {
            console.error('Failed to request revision:', error);
            alert('Gagal mengirim permintaan revisi');
        }
    };

    const handleExportPdf = async () => {
        try {
            await exportRegistrations(filters).unwrap();
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Gagal mengekspor PDF');
        }
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon size={14} className="mr-1" />
                {config.label}
            </span>
        );
    };

    // Define columns for DataTable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'student.name',
                header: 'Mahasiswa',
                cell: ({ row }) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {row.original.student?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {row.original.student?.email}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'location.name',
                header: 'Lokasi KKN',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">
                        {row.original.location?.name || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                accessorKey: 'created_at',
                header: 'Tanggal Daftar',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-500">
                        {new Date(row.original.created_at).toLocaleDateString('id-ID')}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => (
                    <button
                        onClick={() => viewDetail(row.original.id)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                    >
                        <Eye size={16} className="mr-1" />
                        Detail
                    </button>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Users className="mr-2 text-green-700" />
                            Peserta KKN
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola pendaftaran dan approval peserta KKN
                        </p>
                    </div>
                    <button
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Download size={18} />
                        <span>{isExporting ? 'Mengekspor...' : 'Ekspor PDF'}</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div
                        className={`rounded-lg shadow p-4 border-2 transition-colors cursor-pointer ${viewMode === 'table' && filters.status === 'all'
                            ? 'bg-gray-100 border-gray-300'
                            : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                            }`}
                        onClick={() => {
                            if (viewMode === 'table' && filters.status === 'all') setViewMode('dashboard');
                            else { setViewMode('table'); setFilters({ ...filters, status: 'all' }); }
                        }}
                    >
                        <div className="text-sm text-gray-600">Total Pendaftar</div>
                        <div className="text-2xl font-bold text-gray-900">{statistics.total || 0}</div>
                        <div className={`text-xs mt-1 flex items-center ${viewMode === 'table' && filters.status === 'all' ? 'text-gray-600 font-medium' : 'text-blue-500 hover:text-blue-600'}`}>
                            {viewMode === 'table' && filters.status === 'all' ? '← Kembali' : 'Lihat Detail Tabel →'}
                        </div>
                    </div>
                    <div
                        className={`rounded-lg shadow p-4 border-2 transition-colors cursor-pointer ${viewMode === 'table' && filters.status === 'pending'
                            ? 'bg-yellow-100 border-yellow-300'
                            : 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100 hover:border-yellow-200'
                            }`}
                        onClick={() => {
                            if (viewMode === 'table' && filters.status === 'pending') setViewMode('dashboard');
                            else { setViewMode('table'); setFilters({ ...filters, status: 'pending' }); }
                        }}
                    >
                        <div className="text-sm text-yellow-800">Menunggu Review</div>
                        <div className="text-2xl font-bold text-yellow-900">{statistics.pending || 0}</div>
                        <div className={`text-xs mt-1 flex items-center ${viewMode === 'table' && filters.status === 'pending' ? 'text-yellow-700 font-medium' : 'text-blue-500 hover:text-blue-600'}`}>
                            {viewMode === 'table' && filters.status === 'pending' ? '← Kembali' : 'Lihat Detail Tabel →'}
                        </div>
                    </div>
                    <div
                        className={`rounded-lg shadow p-4 border-2 transition-colors cursor-pointer ${viewMode === 'table' && filters.status === 'approved'
                            ? 'bg-green-100 border-green-300'
                            : 'bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-200'
                            }`}
                        onClick={() => {
                            if (viewMode === 'table' && filters.status === 'approved') setViewMode('dashboard');
                            else { setViewMode('table'); setFilters({ ...filters, status: 'approved' }); }
                        }}
                    >
                        <div className="text-sm text-green-800">Disetujui</div>
                        <div className="text-2xl font-bold text-green-900">{statistics.approved || 0}</div>
                        <div className={`text-xs mt-1 flex items-center ${viewMode === 'table' && filters.status === 'approved' ? 'text-green-700 font-medium' : 'text-blue-500 hover:text-blue-600'}`}>
                            {viewMode === 'table' && filters.status === 'approved' ? '← Kembali' : 'Lihat Detail Tabel →'}
                        </div>
                    </div>
                    <div
                        className={`rounded-lg shadow p-4 border-2 transition-colors cursor-pointer ${viewMode === 'table' && filters.status === 'needs_revision'
                            ? 'bg-orange-100 border-orange-300'
                            : 'bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-200'
                            }`}
                        onClick={() => {
                            if (viewMode === 'table' && filters.status === 'needs_revision') setViewMode('dashboard');
                            else { setViewMode('table'); setFilters({ ...filters, status: 'needs_revision' }); }
                        }}
                    >
                        <div className="text-sm text-orange-800">Perlu Revisi</div>
                        <div className="text-2xl font-bold text-orange-900">{statistics.needs_revision || 0}</div>
                        <div className={`text-xs mt-1 flex items-center ${viewMode === 'table' && filters.status === 'needs_revision' ? 'text-orange-700 font-medium' : 'text-blue-500 hover:text-blue-600'}`}>
                            {viewMode === 'table' && filters.status === 'needs_revision' ? '← Kembali' : 'Lihat Detail Tabel →'}
                        </div>
                    </div>
                    <div
                        className={`rounded-lg shadow p-4 border-2 transition-colors cursor-pointer ${viewMode === 'table' && filters.status === 'rejected'
                            ? 'bg-red-100 border-red-300'
                            : 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200'
                            }`}
                        onClick={() => {
                            if (viewMode === 'table' && filters.status === 'rejected') setViewMode('dashboard');
                            else { setViewMode('table'); setFilters({ ...filters, status: 'rejected' }); }
                        }}
                    >
                        <div className="text-sm text-red-800">Ditolak</div>
                        <div className="text-2xl font-bold text-red-900">{statistics.rejected || 0}</div>
                        <div className={`text-xs mt-1 flex items-center ${viewMode === 'table' && filters.status === 'rejected' ? 'text-red-700 font-medium' : 'text-blue-500 hover:text-blue-600'}`}>
                            {viewMode === 'table' && filters.status === 'rejected' ? '← Kembali' : 'Lihat Detail Tabel →'}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'dashboard' && statistics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                    {/* Fakultas Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <PieChartIcon className="mr-2 text-indigo-500" size={20} />
                            Peserta Berdasarkan Fakultas
                        </h3>
                        {statistics.by_faculty && statistics.by_faculty.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statistics.by_faculty} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                            {statistics.by_faculty.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Belum ada data</div>
                        )}
                    </div>

                    {/* Prodi Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <BarChart2 className="mr-2 text-blue-500" size={20} />
                            Peserta Berdasarkan Program Studi
                        </h3>
                        {statistics.by_prodi && statistics.by_prodi.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statistics.by_prodi}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                            {statistics.by_prodi.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Belum ada data</div>
                        )}
                    </div>

                    {/* Jacket Size Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <User className="mr-2 text-orange-500" size={20} />
                            Statistik Ukuran Jaket
                        </h3>
                        {statistics.by_jacket_size && statistics.by_jacket_size.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statistics.by_jacket_size} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={50} />
                                        <RechartsTooltip />
                                        <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Belum ada data</div>
                        )}
                    </div>

                    {/* Posko Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <MapPin className="mr-2 text-green-500" size={20} />
                            Peserta Berdasarkan Lokasi KKN
                        </h3>
                        {statistics.by_location && statistics.by_location.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statistics.by_location}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Belum ada data</div>
                        )}
                    </div>

                    {/* Peta Sebaran KKN List fallback */}
                    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <Map className="mr-2 text-teal-500" size={20} />
                            Peta Sebaran KKN
                        </h3>
                        {statistics.map_data && statistics.map_data.length > 0 ? (
                            <div className="rounded-lg border bg-gray-50 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Koordinat</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Peserta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {statistics.map_data.map(loc => (
                                            <tr key={loc.id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{loc.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                                    {loc.latitude}, {loc.longitude}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                                                        {loc.participants_count} Peserta
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                Koordinat lokasi KKN belum tersedia
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="space-y-6 slide-in-bottom">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau NIM..."
                                    className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow appearance-none"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu Review</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="rejected">Ditolak</option>
                                    <option value="needs_revision">Perlu Revisi</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow appearance-none"
                                    value={filters.prodi_id}
                                    onChange={(e) => setFilters({ ...filters, prodi_id: e.target.value })}
                                >
                                    <option value="">Semua Program Studi</option>
                                    {studyPrograms.map(prodi => (
                                        <option key={prodi.id} value={prodi.id}>{prodi.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow appearance-none"
                                    value={filters.per_page}
                                    onChange={(e) => setFilters({ ...filters, per_page: e.target.value })}
                                >
                                    <option value="10">10 per halaman</option>
                                    <option value="25">25 per halaman</option>
                                    <option value="50">50 per halaman</option>
                                    <option value="100">100 per halaman</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* DataTable */}
                    <div className="bg-white rounded-lg shadow p-4">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                                Memuat Data...
                            </div>
                        ) : (
                            <>
                                <DataTable
                                    data={registrations}
                                    columns={columns}
                                    options={{
                                        enableGlobalFilter: false, // Using custom filters above
                                        enableSorting: true,
                                        enablePagination: false, // Using server-side pagination
                                        searchPlaceholder: '',
                                        emptyMessage: 'Tidak ada data pendaftaran',
                                    }}
                                />

                                {/* Server-side Pagination - Always show info */}
                                {pagination && pagination.total > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="text-sm text-gray-700">
                                                Menampilkan <span className="font-medium">{pagination.from || 0}</span> sampai{' '}
                                                <span className="font-medium">{pagination.to || 0}</span> dari{' '}
                                                <span className="font-medium">{pagination.total}</span> hasil
                                            </div>

                                            {/* Show pagination controls only if more than 1 page */}
                                            {pagination.last_page > 1 && (
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                    <button
                                                        onClick={() => setFilters(prev => ({ ...prev, page: pagination.current_page - 1 }))}
                                                        disabled={pagination.current_page === 1}
                                                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Previous
                                                    </button>
                                                    {[...Array(Math.min(pagination.last_page, 5))].map((_, i) => {
                                                        const page = i + 1;
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => setFilters(prev => ({ ...prev, page }))}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${pagination.current_page === page
                                                                    ? 'z-10 bg-green-50 border-green-500 text-green-600 font-semibold'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        onClick={() => setFilters(prev => ({ ...prev, page: pagination.current_page + 1 }))}
                                                        disabled={pagination.current_page === pagination.last_page}
                                                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Next
                                                    </button>
                                                </nav>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Enhanced Detail Modal */}
            {showDetailModal && selectedRegistration && (
                <EnhancedRegistrationDetailModal
                    registration={selectedRegistration}
                    onClose={() => setShowDetailModal(false)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRequestRevision={handleRequestRevision}
                />
            )}
        </div>
    );
}

// Enhanced Registration Detail Modal Component
function EnhancedRegistrationDetailModal({ registration, onClose, onApprove, onReject, onRequestRevision }) {
    const [note, setNote] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // profile, documents, timeline
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [isEditingType, setIsEditingType] = useState(false);
    const [editedType, setEditedType] = useState(registration.registration_type || 'reguler');
    const [updateRegistration, { isLoading: isUpdating }] = useUpdateRegistrationMutation();

    const profile = registration.student?.mahasiswa_profile || {};

    const handleSaveType = async () => {
        try {
            await updateRegistration({ id: registration.id, registration_type: editedType }).unwrap();
            setIsEditingType(false);
            alert('Jenis pendaftaran berhasil diperbarui');
        } catch (error) {
            console.error('Failed to update registration type:', error);
            alert('Gagal memperbarui jenis pendaftaran');
        }
    };

    const handlePreview = (doc, title) => {
        setPreviewDoc(doc);
        setPreviewTitle(title);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-lg max-w-6xl w-full my-8">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detail Pendaftaran KKN</h2>
                                <div className="flex items-center space-x-4">
                                    <StatusBadge status={registration.status} />
                                    <span className="text-sm text-gray-600">
                                        Daftar: {new Date(registration.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                    {registration.reviewed_at && (
                                        <span className="text-sm text-gray-600">
                                            Review: {new Date(registration.reviewed_at).toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <User className="inline mr-2" size={16} />
                                Profil Mahasiswa
                            </button>
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileText className="inline mr-2" size={16} />
                                Dokumen
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'timeline'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Clock className="inline mr-2" size={16} />
                                Riwayat Aktivitas
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="mr-2 text-blue-600" size={20} />
                                        Informasi Dasar
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                                            <p className="text-gray-900 font-semibold">{registration.student?.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-gray-900 flex items-center">
                                                <Mail size={14} className="mr-1 text-gray-500" />
                                                {registration.student?.email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">No. HP</label>
                                            <p className="text-gray-900 flex items-center">
                                                <Phone size={14} className="mr-1 text-gray-500" />
                                                {profile.phone || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                                            <p className="text-gray-900">{profile.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Info */}
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <GraduationCap className="mr-2 text-green-600" size={20} />
                                        Informasi Akademik
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">NPM</label>
                                            <p className="text-gray-900 font-semibold">{profile.npm || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">IPK</label>
                                            <p className="text-gray-900 flex items-center">
                                                <Award size={14} className="mr-1 text-yellow-500" />
                                                {profile.ips || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Program Studi</label>
                                            <p className="text-gray-900">{profile.study_program?.name || profile.prodi || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Fakultas</label>
                                            <p className="text-gray-900">{profile.faculty?.name || profile.fakultas || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Calendar className="mr-2 text-purple-600" size={20} />
                                        Informasi Pribadi
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Tempat Lahir</label>
                                            <p className="text-gray-900">{profile.place_of_birth || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                                            <p className="text-gray-900">
                                                {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('id-ID') : '-'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-sm font-medium text-gray-600">Alamat</label>
                                            <p className="text-gray-900">{profile.address || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* KKN Info */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="mr-2 text-orange-600" size={20} />
                                        Informasi KKN
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-sm font-medium text-gray-600">Jenis Pendaftaran</label>
                                                {!isEditingType ? (
                                                    <button onClick={() => setIsEditingType(true)} className="text-xs text-blue-600 hover:text-blue-800">
                                                        Edit
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setIsEditingType(false)} className="text-xs text-gray-500 hover:text-gray-700">
                                                        Batal
                                                    </button>
                                                )}
                                            </div>
                                            {!isEditingType ? (
                                                <p className="text-gray-900 font-semibold uppercase">
                                                    {registration.registration_type || 'REGULER'}
                                                </p>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={editedType}
                                                        onChange={(e) => setEditedType(e.target.value)}
                                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-green-500 focus:border-green-500"
                                                    >
                                                        <option value="reguler">Reguler</option>
                                                        <option value="progsus">Progsus</option>
                                                        <option value="santri">Santri</option>
                                                    </select>
                                                    <button
                                                        onClick={handleSaveType}
                                                        disabled={isUpdating}
                                                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                                                    >
                                                        {isUpdating ? '...' : 'Simpan'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Lokasi KKN</label>
                                            <p className="text-gray-900 font-semibold">{registration.location?.name || 'Belum dipilih'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Tahun Akademik</label>
                                            <p className="text-gray-900">{registration.fiscal_year?.year || '-'}</p>
                                        </div>
                                        {registration.reviewer && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Direview oleh</label>
                                                <p className="text-gray-900">{registration.reviewer.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents Tab - Dynamic */}
                        {activeTab === 'documents' && (
                            <div className="grid grid-cols-2 gap-4">
                                {registration.documents && Object.entries(registration.documents).map(([key, doc]) => {
                                    if (!doc || !doc.file_path) return null;

                                    // Generate readable title from key or use doc name
                                    const title = doc.name || key.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ');

                                    return (
                                        <DocumentCard
                                            key={key}
                                            document={doc}
                                            title={title}
                                            onPreview={() => handlePreview(doc, title)}
                                        />
                                    );
                                })}
                                {(!registration.documents || Object.keys(registration.documents).length === 0) && (
                                    <div className="col-span-2 text-center py-8 text-gray-500">
                                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>Tidak ada dokumen yang diupload</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <ActivityTimeline logs={registration.logs || []} />
                        )}
                    </div>

                    {/* Action Footer */}
                    {!['approved', 'rejected'].includes(registration.status) && (
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catatan <span className="text-gray-500">(wajib untuk penolakan dan revisi)</span>
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        rows="3"
                                        placeholder="Tulis catatan untuk mahasiswa..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Tutup
                                    </button>
                                    <button
                                        onClick={() => onRequestRevision(registration.id, note)}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                                    >
                                        <AlertCircle size={18} className="mr-2" />
                                        Minta Revisi
                                    </button>
                                    <button
                                        onClick={() => onReject(registration.id, note)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                    >
                                        <XCircle size={18} className="mr-2" />
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => onApprove(registration.id, note)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        Setujui
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <DocumentPreview
                    document={previewDoc}
                    title={previewTitle}
                    onClose={() => setPreviewDoc(null)}
                />
            )}
        </>
    );
}

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status];
    const Icon = config?.icon || Clock;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
            <Icon size={14} className="mr-1" />
            {config?.label || status}
        </span>
    );
}
