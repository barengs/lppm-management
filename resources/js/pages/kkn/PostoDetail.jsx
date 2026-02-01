import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, Edit, Users, MapPin, Calendar, User, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';

export default function PostoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [posto, setPosto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPosto();
    }, [id]);

    const fetchPosto = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/kkn/postos/${id}`);
            setPosto(data);
        } catch (error) {
            console.error('Failed to fetch posto:', error);
            toast.error('Gagal memuat data posko');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return;

        try {
            await api.delete(`/kkn/postos/${id}/members/${memberId}`);
            toast.success('Anggota berhasil dihapus');
            fetchPosto();
        } catch (error) {
            console.error('Failed to remove member:', error);
            toast.error('Gagal menghapus anggota');
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await api.patch(`/kkn/postos/${id}/status`, { status: newStatus });
            toast.success('Status posko berhasil diupdate');
            fetchPosto();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error(error.response?.data?.message || 'Gagal update status');
        }
    };

    const getPositionBadge = (position) => {
        const colors = {
            kordes: 'bg-purple-100 text-purple-800',
            sekretaris: 'bg-blue-100 text-blue-800',
            bendahara: 'bg-green-100 text-green-800',
            humas: 'bg-yellow-100 text-yellow-800',
            publikasi: 'bg-pink-100 text-pink-800',
            anggota: 'bg-gray-100 text-gray-800',
        };
        return colors[position] || colors.anggota;
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Selesai' },
        };
        const badge = badges[status] || badges.draft;
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    // Define columns for DataTable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'student.mahasiswa_profile.npm',
                header: 'NPM',
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900">
                        {row.original.student?.mahasiswa_profile?.npm || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'student.name',
                header: 'Nama',
                cell: ({ row }) => (
                    <div className="text-gray-900">{row.original.student?.name}</div>
                ),
            },
            {
                accessorKey: 'student.mahasiswa_profile.faculty.name',
                header: 'Fakultas',
                cell: ({ row }) => (
                    <div className="text-gray-900">
                        {row.original.student?.mahasiswa_profile?.faculty?.name || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'student.mahasiswa_profile.study_program.name',
                header: 'Program Studi',
                cell: ({ row }) => (
                    <div className="text-gray-900">
                        {row.original.student?.mahasiswa_profile?.study_program?.name || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'position',
                header: 'Jabatan',
                cell: ({ row }) => (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getPositionBadge(row.original.position)}`}>
                        {row.original.position_name}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => (
                    <div className="text-right">
                        <button
                            onClick={() => handleRemoveMember(row.original.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus anggota"
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

    if (!posto) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Posko tidak ditemukan</p>
                    <button
                        onClick={() => navigate('/kkn/postos')}
                        className="mt-4 text-green-600 hover:text-green-700"
                    >
                        Kembali ke Daftar Posko
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/kkn/postos')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Daftar Posko
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{posto.name}</h1>
                            <p className="mt-1 text-sm text-gray-600">{posto.fiscal_year?.year}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(posto.status)}
                            <Link
                                to={`/kkn/postos/${id}/edit`}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Posko
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Posto Info */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Informasi Posko</h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Lokasi</div>
                                        <div className="text-sm font-medium text-gray-900">{posto.location?.name}</div>
                                        <div className="text-xs text-gray-500">{posto.location?.address}</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">DPL</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {posto.dpl?.name || 'Belum ditentukan'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Periode</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {posto.start_date && posto.end_date
                                                ? `${new Date(posto.start_date).toLocaleDateString('id-ID')} - ${new Date(posto.end_date).toLocaleDateString('id-ID')}`
                                                : 'Belum ditentukan'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Jumlah Anggota</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {posto.member_count} orang
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {posto.description && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-600 mb-1">Deskripsi</div>
                                    <div className="text-sm text-gray-900">{posto.description}</div>
                                </div>
                            )}
                        </div>

                        {/* Status Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Kelola Status</h2>
                            <div className="space-y-2">
                                {posto.status !== 'active' && (
                                    <button
                                        onClick={() => handleUpdateStatus('active')}
                                        disabled={!posto.is_complete}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Aktifkan Posko
                                    </button>
                                )}
                                {posto.status === 'active' && (
                                    <button
                                        onClick={() => handleUpdateStatus('completed')}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        Tandai Selesai
                                    </button>
                                )}
                                {!posto.is_complete && (
                                    <div className="text-xs text-orange-600 mt-2">
                                        ⚠ Posko harus memiliki Kordes, Sekretaris, dan Bendahara sebelum diaktifkan
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Members */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-900">Anggota Posko</h2>
                                <Link
                                    to={`/kkn/postos/${id}/members/add`}
                                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Tambah Anggota
                                </Link>
                            </div>

                            {/* Members DataTable */}
                            {posto.members?.length > 0 ? (
                                <DataTable
                                    data={posto.members}
                                    columns={columns}
                                    options={{
                                        enableGlobalFilter: true,
                                        enableSorting: true,
                                        enablePagination: true,
                                        initialPageSize: 10,
                                        searchPlaceholder: 'Cari berdasarkan NPM, nama, fakultas, atau prodi...',
                                        emptyMessage: 'Tidak ada anggota ditemukan',
                                    }}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-4">Belum ada anggota di posko ini</p>
                                    <Link
                                        to={`/kkn/postos/${id}/members/add`}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Anggota Pertama
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
