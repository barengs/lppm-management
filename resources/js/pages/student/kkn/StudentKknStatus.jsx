import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import {
    CheckCircle, Clock, XCircle, AlertCircle, FileText,
    MapPin, User, Calendar, Download, Upload, Eye, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import DocumentPreview from '../../../components/DocumentPreview';

export default function StudentKknStatus() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [reuploadingDoc, setReuploadingDoc] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch registration
            const { data: regData } = await api.get('/kkn-registrations');
            if (regData && regData.length > 0) {
                setRegistration(regData[0]);
            } else {
                toast.info('Anda belum mendaftar KKN');
                navigate('/dashboard/kkn/register');
                return;
            }

            // Fetch user profile
            const { data: profileData } = await api.get('/profile/me');
            setProfile(profileData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Gagal memuat data pendaftaran');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: Clock,
                color: 'yellow',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-800',
                iconColor: 'text-yellow-600',
                title: 'Menunggu Verifikasi'
            },
            approved: {
                icon: CheckCircle,
                color: 'green',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                iconColor: 'text-green-600',
                title: 'Disetujui'
            },
            rejected: {
                icon: XCircle,
                color: 'red',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
                title: 'Ditolak'
            },
            needs_revision: {
                icon: AlertCircle,
                color: 'orange',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-800',
                iconColor: 'text-orange-600',
                title: 'Perlu Revisi'
            }
        };
        return configs[status] || configs.pending;
    };

    const handlePreview = (doc, title) => {
        setPreviewDoc(doc);
        setPreviewTitle(title);
    };

    const handleReupload = async (file) => {
        if (!file || !reuploadingDoc) return;

        const formData = new FormData();
        formData.append(`doc_${reuploadingDoc.id}`, file);

        setIsSubmitting(true);
        try {
            await api.post('/student/kkn/reupload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Dokumen berhasil diupdate');
            setReuploadingDoc(null);
            fetchData();
        } catch (error) {
            console.error('Reupload failed:', error);
            toast.error(error.response?.data?.message || 'Gagal mengupdate dokumen');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!registration) {
        return null; // Will redirect in useEffect
    }

    const statusConfig = getStatusConfig(registration.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link to="/dashboard/kkn" className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                        ← Kembali ke Dashboard KKN
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Status Pendaftaran KKN</h1>
                </div>

                {/* Status Card */}
                <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-xl p-6 mb-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 ${statusConfig.bgColor} rounded-lg`}>
                            <StatusIcon className={`w-8 h-8 ${statusConfig.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h2 className={`text-2xl font-bold ${statusConfig.textColor} mb-2`}>
                                Status: {statusConfig.title}
                            </h2>
                            {registration.validation_notes && (
                                <div className={`mt-4 p-4 bg-white rounded-lg border ${statusConfig.borderColor}`}>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Catatan dari Admin:</p>
                                    <p className="text-sm text-gray-600">{registration.validation_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Registration Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-green-600" />
                            Data Mahasiswa
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* User Photo */}
                            <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
                                <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    {(() => {
                                        let photoDoc = null;
                                        if (registration.documents) {
                                            const docs = Object.values(registration.documents);
                                            photoDoc = docs.find(d =>
                                                d.doc_type === 'required_photo' ||
                                                d.doc_type === 'photo' ||
                                                (d.name && d.name.toLowerCase().includes('foto'))
                                            );
                                        }

                                        return photoDoc ? (
                                            <img
                                                src={`/storage/${photoDoc.file_path}`}
                                                alt="Foto Profil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={48} />
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 text-sm flex-1">
                                <div>
                                    <span className="text-gray-600">Nama:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                        {profile?.name || user?.name || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">NPM:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                        {profile?.mahasiswa_profile?.npm || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Program Studi:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                        {profile?.mahasiswa_profile?.study_program?.name ||
                                            profile?.mahasiswa_profile?.prodi || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Fakultas:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                        {profile?.mahasiswa_profile?.faculty?.name ||
                                            profile?.mahasiswa_profile?.fakultas || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KKN Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-green-600" />
                            Informasi KKN
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-600">Lokasi:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {registration.location?.name || 'Belum ditentukan'}
                                </span>
                            </div>
                            {registration.dpl && (
                                <div>
                                    <span className="text-gray-600">DPL:</span>
                                    <span className="ml-2 font-medium text-gray-900">{registration.dpl.name}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-600">Tanggal Daftar:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {new Date(registration.created_at).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        Dokumen Pendaftaran
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {registration.documents && Object.values(registration.documents).length > 0 ? (
                            Object.values(registration.documents).map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">{doc.name || 'Dokumen'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {registration.status === 'needs_revision' && (
                                            <button
                                                onClick={() => setReuploadingDoc(doc)}
                                                className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full"
                                                title="Re-upload Dokumen"
                                            >
                                                <Upload className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handlePreview(doc, doc.name || 'Dokumen')}
                                            className="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-full"
                                            title="Preview Dokumen"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <a
                                            href={`/storage/${doc.file_path}`}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-700 bg-green-50 p-2 rounded-full"
                                            title="Download Dokumen"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-gray-500 py-4">
                                Tidak ada dokumen pendaftaran.
                            </div>
                        )}
                    </div>

                    {registration.status === 'needs_revision' && (
                        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800 mb-1 font-semibold uppercase tracking-wider">
                                <AlertCircle className="w-4 h-4 inline mr-1" /> Instruksi Revisi:
                            </p>
                            <p className="text-sm text-orange-700 mb-0">
                                Silakan klik icon <strong>Upload (Panah Atas)</strong> berwarna oranye pada setiap dokumen yang perlu diperbaiki di atas.
                            </p>
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

            {/* Reupload Modal */}
            {reuploadingDoc && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Upload Ulang Dokumen</h3>
                            <button 
                                onClick={() => setReuploadingDoc(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Nama Dokumen:</p>
                                <p className="text-md font-medium text-gray-800 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                    {reuploadingDoc.name}
                                </p>
                            </div>
                            
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih File Baru
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-blue-50 bg-opacity-30">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-blue-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload a file</span>
                                                <input 
                                                    id="file-upload" 
                                                    name="file-upload" 
                                                    type="file" 
                                                    className="sr-only"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={(e) => handleReupload(e.target.files[0])}
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PDF, JPG, PNG, DOC up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isSubmitting && (
                                <div className="mt-4 flex items-center justify-center text-blue-600 text-sm font-medium">
                                    <RefreshCw className="animate-spin mr-2" size={16} />
                                    Sedang mengupload...
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 text-right">
                            <button
                                type="button"
                                onClick={() => setReuploadingDoc(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                disabled={isSubmitting}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
