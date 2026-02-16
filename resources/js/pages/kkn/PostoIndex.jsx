import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, MapPin, Users, Calendar, CheckCircle, Upload, Download, X } from 'lucide-react';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';
import { useGetPostosQuery, useDeletePostoMutation, useImportPostosMutation, useDownloadPostoTemplateMutation, useGetKknPeriodsQuery } from '../../store/api/kknApi';
import { useGetKknLocationsQuery } from '../../store/api/kknApi';

export default function PostoIndex() {
    const [filters, setFilters] = useState({
        kkn_period_id: '',
        status: '',
        location_id: '',
    });

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);

    // RTK Query hooks
    const { data: postosData, isLoading } = useGetPostosQuery(filters);
    const { data: periodsData } = useGetKknPeriodsQuery();
    const { data: locationsData } = useGetKknLocationsQuery();
    const [deletePosto] = useDeletePostoMutation();
    const [importPostos, { isLoading: isImporting }] = useImportPostosMutation();
    const [downloadTemplate] = useDownloadPostoTemplateMutation();

    // Derived data
    const postos = Array.isArray(postosData) ? postosData : [];
    // Handle both array and paginated response for periods
    const periods = periodsData?.data ? periodsData.data : (Array.isArray(periodsData) ? periodsData : []);
    const locations = Array.isArray(locationsData) ? locationsData : [];

    const handleDownloadTemplate = async () => {
        try {
            await downloadTemplate().unwrap();
        } catch (error) {
            console.error('Failed to download template:', error);
            toast.error('Gagal mengunduh template');
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            await importPostos(formData).unwrap();
            toast.success('Import berhasil');
            setIsImportModalOpen(false);
            setImportFile(null);
        } catch (error) {
            console.error(error);
            toast.error(error.data?.message || 'Gagal import data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus posko ini?')) return;

        try {
            await deletePosto(id).unwrap();
            toast.success('Posko berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete posto:', error);
            toast.error('Gagal menghapus posko');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
        };
        const labels = {
            draft: 'Draft',
            active: 'Aktif',
            completed: 'Selesai',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    // Define columns for DataTable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nama Posko',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium text-gray-900">{row.original.name}</div>
                        <div className="text-xs text-gray-500">
                            {row.original.location?.name}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'kkn_period.name',
                header: 'Periode KKN',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">{row.original.kkn_period?.name}</div>
                ),
            },
            {
                accessorKey: 'dpl.name',
                header: 'DPL',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">
                        {row.original.dpl?.name || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'member_count',
                header: 'Anggota',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">
                        {row.original.member_count} orang
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => getStatusBadge(row.original.status),
            },

            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/kkn/postos/${row.original.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Lihat detail"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                            to={`/kkn/postos/${row.original.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Posko KKN</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Kelola posko KKN, anggota, dan struktur kepengurusan
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/kkn/postos/create"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Buat Posko Baru
                        </Link>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Import Excel
                        </button>
                    </div>
                </div>

                {/* Import Modal */}
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Import Data Posko</h3>
                                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleImport}>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Unduh template file import di sini:
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                                    >
                                        <Download size={16} /> Download Template (.csv)
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        File Excel / CSV
                                    </label>
                                    <input 
                                        type="file" 
                                        accept=".xlsx,.xls,.csv"
                                        onChange={e => setImportFile(e.target.files[0])}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isImporting}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
                                    >
                                        {isImporting ? 'Mengimport...' : 'Import Sekarang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Periode KKN
                            </label>
                            <select
                                value={filters.kkn_period_id}
                                onChange={(e) => setFilters({ ...filters, kkn_period_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Semua Periode</option>
                                {periods.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="active">Aktif</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lokasi
                            </label>
                            <select
                                value={filters.location_id}
                                onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Semua Lokasi</option>
                                {Array.isArray(locations) && locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <MapPin className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Total Posko</p>
                                <p className="text-2xl font-bold text-gray-900">{postos.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Array.isArray(postos) ? postos.reduce((sum, p) => sum + (p.member_count || 0), 0) : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Posko Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Array.isArray(postos) ? postos.filter((p) => p.status === 'active').length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Posko Lengkap</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Array.isArray(postos) ? postos.filter((p) => p.is_complete).length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DataTable */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <DataTable
                        data={Array.isArray(postos) ? postos : []}
                        columns={columns}
                        options={{
                            enableGlobalFilter: true,
                            enableSorting: true,
                            enablePagination: true,
                            initialPageSize: 10,
                            searchPlaceholder: 'Cari posko berdasarkan nama, lokasi, atau DPL...',
                            emptyMessage: 'Tidak ada posko ditemukan',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
