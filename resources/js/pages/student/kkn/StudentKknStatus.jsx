import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import {
    CheckCircle, Clock, XCircle, AlertCircle, FileText,
    MapPin, User, Calendar, Download, Upload, Eye
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
                            <p className="text-sm text-orange-800 mb-3">
                                Dokumen Anda perlu diperbaiki. Silakan upload ulang dokumen yang diminta.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/kkn/register', { state: { edit: true } })}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Ulang Dokumen
                            </button>
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
        </div>
    );
}
