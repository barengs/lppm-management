import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Search, Filter, CheckCircle, XCircle, 
    AlertCircle, Clock, Eye, User, MapPin, Calendar,
    Mail, Phone, GraduationCap, Award, FileText
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import DocumentPreview, { DocumentCard } from '../../components/DocumentPreview';
import ActivityTimeline from '../../components/ActivityTimeline';

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

export default function KknParticipants() {
    const { token } = useAuthStore();
    const [registrations, setRegistrations] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        per_page: 10
    });
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchStatistics();
        fetchRegistrations();
    }, [filters]);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('/api/admin/kkn-registrations/statistics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatistics(response.data);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    const fetchRegistrations = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/kkn-registrations', {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }
            });
            setRegistrations(response.data.data);
            setPagination(response.data);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        }
        setLoading(false);
    };

    const viewDetail = async (id) => {
        try {
            const response = await axios.get(`/api/admin/kkn-registrations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedRegistration(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Failed to fetch registration detail:', error);
        }
    };

    const handleApprove = async (id, note) => {
        try {
            await axios.post(`/api/admin/kkn-registrations/${id}/approve`, 
                { note },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRegistrations();
            fetchStatistics();
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
            await axios.post(`/api/admin/kkn-registrations/${id}/reject`, 
                { note },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRegistrations();
            fetchStatistics();
            setShowDetailModal(false);
            alert('Pendaftaran ditolak');
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
            await axios.post(`/api/admin/kkn-registrations/${id}/revise`, 
                { note },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRegistrations();
            fetchStatistics();
            setShowDetailModal(false);
            alert('Permintaan revisi berhasil dikirim');
        } catch (error) {
            console.error('Failed to request revision:', error);
            alert('Gagal mengirim permintaan revisi');
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
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600">Total Pendaftar</div>
                        <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow p-4">
                        <div className="text-sm text-yellow-800">Menunggu Review</div>
                        <div className="text-2xl font-bold text-yellow-900">{statistics.pending}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow p-4">
                        <div className="text-sm text-green-800">Disetujui</div>
                        <div className="text-2xl font-bold text-green-900">{statistics.approved}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg shadow p-4">
                        <div className="text-sm text-orange-800">Perlu Revisi</div>
                        <div className="text-2xl font-bold text-orange-900">{statistics.needs_revision}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg shadow p-4">
                        <div className="text-sm text-red-800">Ditolak</div>
                        <div className="text-2xl font-bold text-red-900">{statistics.rejected}</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIM..."
                            className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
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

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mahasiswa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lokasi KKN
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal Daftar
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada data pendaftaran
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((registration) => (
                                    <tr key={registration.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {registration.student?.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {registration.student?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {registration.location?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={registration.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(registration.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => viewDetail(registration.id)}
                                                className="text-green-600 hover:text-green-900 flex items-center"
                                            >
                                                <Eye size={16} className="mr-1" />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => fetchRegistrations(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchRegistrations(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{pagination.from}</span> sampai{' '}
                                    <span className="font-medium">{pagination.to}</span> dari{' '}
                                    <span className="font-medium">{pagination.total}</span> hasil
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {[...Array(pagination.last_page)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => fetchRegistrations(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                pagination.current_page === i + 1
                                                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

    const profile = registration.student?.mahasiswa_profile || {};

    const handlePreview = (doc, title) => {
        setPreviewDoc(doc);
        setPreviewTitle(title);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
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
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <User className="inline mr-2" size={16} />
                                Profil Mahasiswa
                            </button>
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'documents'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FileText className="inline mr-2" size={16} />
                                Dokumen
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'timeline'
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
                                            <label className="text-sm font-medium text-gray-600">IPS</label>
                                            <p className="text-gray-900 flex items-center">
                                                <Award size={14} className="mr-1 text-yellow-500" />
                                                {profile.ips || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Program Studi</label>
                                            <p className="text-gray-900">{profile.prodi || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Fakultas</label>
                                            <p className="text-gray-900">{profile.fakultas || '-'}</p>
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
                                            <label className="text-sm font-medium text-gray-600">Lokasi KKN</label>
                                            <p className="text-gray-900 font-semibold">{registration.location?.name || 'Belum dipilih'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Tahun Akademik</label>
                                            <p className="text-gray-900">{registration.fiscal_year?.year || '-'}</p>
                                        </div>
                                        {registration.reviewer && (
                                            <div className="col-span-2">
                                                <label className="text-sm font-medium text-gray-600">Direview oleh</label>
                                                <p className="text-gray-900">{registration.reviewer.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="grid grid-cols-2 gap-4">
                                <DocumentCard
                                    document={registration.documents?.krs}
                                    title="KRS"
                                    onPreview={() => handlePreview(registration.documents?.krs, 'Kartu Rencana Studi (KRS)')}
                                />
                                <DocumentCard
                                    document={registration.documents?.health}
                                    title="Surat Sehat"
                                    onPreview={() => handlePreview(registration.documents?.health, 'Surat Keterangan Sehat')}
                                />
                                <DocumentCard
                                    document={registration.documents?.transcript}
                                    title="Transkrip Nilai"
                                    onPreview={() => handlePreview(registration.documents?.transcript, 'Transkrip Nilai')}
                                />
                                <DocumentCard
                                    document={registration.documents?.photo}
                                    title="Foto"
                                    onPreview={() => handlePreview(registration.documents?.photo, 'Foto Mahasiswa')}
                                />
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
