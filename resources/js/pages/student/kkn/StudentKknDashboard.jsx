import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import useAuthStore from '../../../store/useAuthStore';
import { CheckCircle, Clock, XCircle, AlertCircle, FileText, Users, MapPin, Calendar, Award } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StudentKknDashboard() {
    const { user } = useAuthStore();
    const [registration, setRegistration] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRegistration();
    }, []);

    const fetchRegistration = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/kkn-registrations');
            if (data && data.length > 0) {
                setRegistration(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch registration:', error);
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
                title: 'Menunggu Verifikasi',
                description: 'Pendaftaran Anda sedang dalam proses verifikasi oleh admin.'
            },
            approved: {
                icon: CheckCircle,
                color: 'green',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                iconColor: 'text-green-600',
                title: 'Pendaftaran Disetujui',
                description: 'Selamat! Pendaftaran KKN Anda telah disetujui.'
            },
            rejected: {
                icon: XCircle,
                color: 'red',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
                title: 'Pendaftaran Ditolak',
                description: 'Mohon maaf, pendaftaran Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.'
            },
            needs_revision: {
                icon: AlertCircle,
                color: 'orange',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-800',
                iconColor: 'text-orange-600',
                title: 'Perlu Revisi',
                description: 'Dokumen Anda perlu diperbaiki. Silakan upload ulang dokumen yang diminta.'
            }
        };
        return configs[status] || configs.pending;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const statusConfig = registration ? getStatusConfig(registration.status) : null;
    const StatusIcon = statusConfig?.icon;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard KKN</h1>
                    <p className="mt-2 text-gray-600">
                        Kelola pendaftaran dan informasi KKN Anda
                    </p>
                </div>

                {/* Status Card */}
                {registration ? (
                    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-xl p-6 mb-8`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 ${statusConfig.bgColor} rounded-lg`}>
                                <StatusIcon className={`w-8 h-8 ${statusConfig.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <h2 className={`text-xl font-bold ${statusConfig.textColor} mb-1`}>
                                    {statusConfig.title}
                                </h2>
                                <p className={`${statusConfig.textColor} opacity-90 mb-4`}>
                                    {statusConfig.description}
                                </p>
                                
                                {registration.location && (
                                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-medium">Lokasi:</span>
                                        <span>{registration.location.name}</span>
                                    </div>
                                )}
                                
                                {registration.validation_notes && (
                                    <div className={`mt-4 p-4 bg-white rounded-lg border ${statusConfig.borderColor}`}>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Catatan Admin:</p>
                                        <p className="text-sm text-gray-600">{registration.validation_notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-blue-900 mb-1">
                                    Belum Terdaftar
                                </h2>
                                <p className="text-blue-800 opacity-90 mb-4">
                                    Anda belum mendaftar KKN. Silakan lengkapi formulir pendaftaran untuk memulai.
                                </p>
                                <Link
                                    to="/dashboard/kkn/register"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    Daftar KKN Sekarang
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Registration/Status Card */}
                    <Link
                        to={registration ? "/dashboard/kkn/status" : "/dashboard/kkn/register"}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {registration ? 'Status Pendaftaran' : 'Pendaftaran KKN'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {registration ? 'Lihat detail pendaftaran' : 'Daftar KKN sekarang'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Group Card */}
                    <Link
                        to="/dashboard/kkn/group"
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                            !registration || registration.status !== 'approved' ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Kelompok KKN</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {registration?.status === 'approved' ? 'Lihat anggota kelompok' : 'Tersedia setelah disetujui'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Documents Card */}
                    <Link
                        to="/dashboard/kkn/status"
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                            !registration ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Dokumen</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {registration ? 'Lihat & kelola dokumen' : 'Belum ada dokumen'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Assessment Card */}
                    <Link
                        to="/dashboard/kkn/assessment"
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                            !registration || registration.status !== 'approved' ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Nilai & Sertifikat</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {registration?.status === 'approved' ? 'Lihat nilai & unduh sertifikat' : 'Tersedia setelah selesai'}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penting</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>• Pastikan semua dokumen yang diupload jelas dan sesuai dengan persyaratan</p>
                        <p>• Proses verifikasi pendaftaran membutuhkan waktu 1-3 hari kerja</p>
                        <p>• Jika status pendaftaran "Perlu Revisi", segera perbaiki dokumen yang diminta</p>
                        <p>• Informasi kelompok dan lokasi KKN akan tersedia setelah pendaftaran disetujui</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
