import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircle, XCircle, AlertCircle, Clock, Upload,
    User, FileText, MapPin, Calendar, Award, Mail, Phone,
    RefreshCw, Download, Eye, Briefcase, BookOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import DocumentPreview, { DocumentCard } from '../../components/DocumentPreview';
import ActivityTimeline from '../../components/ActivityTimeline';

const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Review',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        message: 'Pendaftaran Anda sedang direview oleh admin. Mohon tunggu konfirmasi.'
    },
    approved: {
        label: 'Disetujui',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        message: 'Selamat! Pendaftaran KKN Anda telah disetujui. Silakan tunggu informasi selanjutnya.'
    },
    rejected: {
        label: 'Ditolak',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        message: 'Maaf, pendaftaran KKN Anda ditolak. Silakan lihat catatan dari admin di bawah.'
    },
    needs_revision: {
        label: 'Perlu Revisi',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: AlertCircle,
        message: 'Pendaftaran Anda memerlukan revisi. Silakan upload ulang dokumen yang diminta.'
    }
};

export default function StudentKknStatus() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState(null);
    const [profile, setProfile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [pendingUpdates, setPendingUpdates] = useState({}); // { doc_id: File }

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/student/kkn/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistration(response.data.registration);
            setProfile(response.data.profile);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
        setLoading(false);
    };

    const handleFileChange = (docId, file) => {
        if (!file) return;
        setPendingUpdates(prev => ({ ...prev, [`doc_${docId}`]: file }));
    };

    const cancelUpdate = (docId) => {
        const newUpdates = { ...pendingUpdates };
        delete newUpdates[`doc_${docId}`];
        setPendingUpdates(newUpdates);
    };

    const handleReupload = async () => {
        const formData = new FormData();
        let hasFiles = false;

        Object.entries(pendingUpdates).forEach(([key, file]) => {
            if (file) {
                formData.append(key, file);
                hasFiles = true;
            }
        });

        if (!hasFiles) {
            alert('Silakan pilih minimal satu dokumen untuk direvisi');
            return;
        }

        if (!confirm('Apakah Anda yakin ingin mengirim revisi dokumen ini?')) return;

        setUploading(true);
        try {
            await axios.post('/api/student/kkn/reupload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Dokumen berhasil dikirim dan status pendaftaran Anda diperbarui!');
            setPendingUpdates({});
            fetchStatus();
        } catch (error) {
            console.error('Failed to reupload:', error);
            alert(error.response?.data?.message || 'Gagal mengirim revisi dokumen');
        }
        setUploading(false);
    };

    const handlePreview = (doc, title) => {
        setPreviewDoc(doc);
        setPreviewTitle(title);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-green-600" size={48} />
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <FileText className="mx-auto mb-4 text-gray-400" size={64} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pendaftaran KKN</h2>
                    <p className="text-gray-600 mb-6">
                        Anda belum mendaftar KKN untuk periode ini.
                    </p>
                    <a
                        href="/kkn/register"
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Daftar KKN Sekarang
                    </a>
                </div>
            </div>
        );
    }

    const config = STATUS_CONFIG[registration.status];
    const Icon = config.icon;
    const canReupload = registration.status === 'needs_revision';

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Status Pendaftaran KKN</h1>
                <p className="text-gray-600">
                    Pantau status dan kelengkapan pendaftaran KKN Anda
                </p>
            </div>

            {/* Status Card */}
            <div className={`bg-white rounded-lg shadow-lg border-2 ${config.color} p-6`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${config.color}`}>
                            <Icon size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                            <p className="text-sm text-gray-600">
                                Daftar: {new Date(registration.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    {registration.reviewed_at && (
                        <div className="text-right text-sm text-gray-600">
                            <p>Direview:</p>
                            <p className="font-medium">
                                {new Date(registration.reviewed_at).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-lg ${config.color} bg-opacity-50`}>
                    <p className="text-gray-800">{config.message}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="mr-2 text-blue-600" size={20} />
                        Profil Anda
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <Mail className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.user?.email || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Award className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">NPM</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.npm || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Briefcase className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">Fakultas</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.faculty?.name || profile?.fakultas || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <BookOpen className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">Program Studi</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.study_program?.name || profile?.studyProgram?.name || profile?.prodi || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Phone className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">No. HP</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KKN Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="mr-2 text-green-600" size={20} />
                        Informasi KKN
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <MapPin className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">Lokasi KKN</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {registration.location?.name || 'Belum dipilih'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Calendar className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">Tahun Akademik</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {registration.fiscal_year?.year || '-'}
                                </p>
                            </div>
                        </div>
                        {registration.reviewer && (
                            <div className="flex items-start">
                                <User className="mr-2 text-gray-400 mt-1" size={16} />
                                <div>
                                    <p className="text-xs text-gray-500">Direview oleh</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {registration.reviewer.name}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="mr-2 text-purple-600" size={20} />
                        Dokumen Pendaftaran
                    </h3>
                    {canReupload && Object.keys(pendingUpdates).length > 0 && (
                        <button
                            onClick={handleReupload}
                            disabled={uploading}
                            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                            {uploading ? (
                                <RefreshCw className="animate-spin mr-2" size={16} />
                            ) : (
                                <Upload className="mr-2" size={16} />
                            )}
                            Simpan Kirim Revisi ({Object.keys(pendingUpdates).length})
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Dokumen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen Saat Ini</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {registration.documents && Object.values(registration.documents).length > 0 ? (
                                Object.values(registration.documents).map((doc, index) => {
                                    const isPending = pendingUpdates[`doc_${doc.id}`];
                                    return (
                                        <tr key={doc.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{doc.name || 'Dokumen'}</div>
                                                <div className="text-xs text-gray-500 capitalized">{doc.doc_type?.replace('_', ' ')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isPending ? (
                                                    <div className="flex items-center text-orange-600 text-sm font-medium">
                                                        <Upload size={14} className="mr-1" />
                                                        <span className="truncate max-w-[150px]">{isPending.name}</span>
                                                        <span className="ml-2 text-xs bg-orange-100 px-1.5 py-0.5 rounded">Baru</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={() => handlePreview(doc, doc.name || 'Dokumen')}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                            title="Preview"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <a 
                                                            href={`/storage/${doc.file_path}`} 
                                                            download 
                                                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {canReupload ? (
                                                    isPending ? (
                                                        <button 
                                                            onClick={() => cancelUpdate(doc.id)}
                                                            className="text-xs text-red-600 font-medium hover:underline"
                                                        >
                                                            Batal
                                                        </button>
                                                    ) : (
                                                        <div className="relative inline-block">
                                                            <input 
                                                                type="file" 
                                                                id={`upload-${doc.id}`}
                                                                className="hidden" 
                                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                                                            />
                                                            <label 
                                                                htmlFor={`upload-${doc.id}`}
                                                                className="cursor-pointer text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
                                                            >
                                                                <RefreshCw size={12} className="mr-1" />
                                                                Update
                                                            </label>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                                        Tidak ada dokumen pendaftaran.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {canReupload && (
                    <div className="p-6 bg-orange-50 border-t border-orange-100">
                        <div className="flex items-start">
                            <AlertCircle className="text-orange-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-orange-800">
                                <p className="font-semibold mb-1 uppercase tracking-wider">Instruksi Revisi:</p>
                                <p>Klik tombol <strong>Update</strong> pada tiap dokumen yang perlu diperbaiki. Setelah memilih semua file yang benar, klik tombol <strong>Simpan Kirim Revisi</strong> di bagian atas tabel.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="mr-2 text-indigo-600" size={20} />
                    Riwayat Aktivitas
                </h3>
                <ActivityTimeline logs={registration.logs || []} />
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <DocumentPreview
                    document={previewDoc}
                    title={previewTitle}
                    onClose={() => setPreviewDoc(null)}
                />
            )}
        </div>
    );
}
