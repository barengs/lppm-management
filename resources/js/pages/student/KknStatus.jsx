import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CheckCircle, XCircle, AlertCircle, Clock, Upload, 
    User, FileText, MapPin, Calendar, Award, Mail, Phone,
    RefreshCw, Download, Eye
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
    const [uploadFiles, setUploadFiles] = useState({
        krs_file: null,
        health_file: null,
        transcript_file: null,
        photo: null
    });

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

    const handleFileChange = (field, file) => {
        setUploadFiles(prev => ({ ...prev, [field]: file }));
    };

    const handleReupload = async () => {
        const formData = new FormData();
        let hasFiles = false;

        Object.entries(uploadFiles).forEach(([key, file]) => {
            if (file) {
                formData.append(key, file);
                hasFiles = true;
            }
        });

        if (!hasFiles) {
            alert('Silakan pilih minimal satu dokumen untuk diupload');
            return;
        }

        setUploading(true);
        try {
            await axios.post('/api/student/kkn/reupload', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Dokumen berhasil diupload ulang!');
            setUploadFiles({ krs_file: null, health_file: null, transcript_file: null, photo: null });
            fetchStatus();
        } catch (error) {
            console.error('Failed to reupload:', error);
            alert(error.response?.data?.message || 'Gagal mengupload dokumen');
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
                            <FileText className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="text-xs text-gray-500">Program Studi</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.prodi || '-'}</p>
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
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="mr-2 text-purple-600" size={20} />
                    Dokumen Pendaftaran
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                {/* Re-upload Section */}
                {canReupload && (
                    <div className="border-t pt-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <AlertCircle className="text-orange-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-orange-900 mb-1">Upload Ulang Dokumen</h4>
                                    <p className="text-sm text-orange-800">
                                        Silakan upload ulang dokumen yang perlu direvisi. Anda hanya perlu mengupload dokumen yang ingin diperbaiki.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    KRS (PDF/Image)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('krs_file', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Surat Sehat (PDF/Image)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('health_file', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transkrip Nilai (PDF/Image)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('transcript_file', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Foto (Image)
                                </label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('photo', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleReupload}
                            disabled={uploading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <RefreshCw className="animate-spin mr-2" size={20} />
                                    Mengupload...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2" size={20} />
                                    Upload Ulang Dokumen
                                </>
                            )}
                        </button>
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
