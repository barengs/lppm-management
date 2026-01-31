import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import useAuthStore from '../../../store/useAuthStore';
import { Users, MapPin, Phone, Mail, User, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StudentKknGroup() {
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
            toast.error('Gagal memuat data kelompok');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Show message if not approved yet
    if (!registration || registration.status !== 'approved') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link to="/dashboard/kkn" className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                            ← Kembali ke Dashboard KKN
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Kelompok KKN Saya</h1>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-blue-900 mb-2">
                            Informasi Kelompok Belum Tersedia
                        </h2>
                        <p className="text-blue-800 mb-4">
                            Informasi kelompok KKN akan tersedia setelah pendaftaran Anda disetujui oleh admin.
                        </p>
                        <Link
                            to="/dashboard/kkn/status"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Lihat Status Pendaftaran
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link to="/dashboard/kkn" className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                        ← Kembali ke Dashboard KKN
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Kelompok KKN Saya</h1>
                </div>

                {/* Location Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-green-600" />
                        Lokasi KKN
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-600">Nama Lokasi:</span>
                            <span className="ml-2 font-medium text-gray-900">
                                {registration.location?.name || 'Belum ditentukan'}
                            </span>
                        </div>
                        {registration.location?.address && (
                            <div>
                                <span className="text-gray-600">Alamat:</span>
                                <span className="ml-2 text-gray-900">{registration.location.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DPL Info */}
                {registration.dpl && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-green-600" />
                            Dosen Pembimbing Lapangan (DPL)
                        </h3>
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg">{registration.dpl.name}</h4>
                                {registration.dpl.email && (
                                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{registration.dpl.email}</span>
                                    </div>
                                )}
                                {registration.dpl.phone && (
                                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{registration.dpl.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Group Members - Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-600" />
                        Anggota Kelompok
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <p className="text-blue-800 font-medium mb-2">Fitur Sedang Dikembangkan</p>
                        <p className="text-sm text-blue-700">
                            Informasi anggota kelompok akan tersedia setelah admin melakukan mapping mahasiswa ke kelompok KKN.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
