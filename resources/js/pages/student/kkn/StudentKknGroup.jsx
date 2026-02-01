import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import useAuthStore from '../../../store/useAuthStore';
import { Users, MapPin, Phone, Mail, User, AlertCircle, Calendar, Award } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StudentKknGroup() {
    const { user } = useAuthStore();
    const [posto, setPosto] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPostoData();
    }, []);

    const fetchPostoData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch posto info
            const { data: postoData } = await api.get('/dashboard/kkn/my-posto');
            setPosto(postoData);

            // Fetch members
            const { data: membersData } = await api.get('/dashboard/kkn/my-posto/members');
            setMembers(membersData);
        } catch (error) {
            console.error('Failed to fetch posto data:', error);
            if (error.response?.status === 404) {
                setError('not_assigned');
            } else {
                setError('fetch_failed');
                toast.error('Gagal memuat data posko');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getPositionBadge = (position) => {
        const colors = {
            kordes: 'bg-purple-100 text-purple-800 border-purple-200',
            sekretaris: 'bg-blue-100 text-blue-800 border-blue-200',
            bendahara: 'bg-green-100 text-green-800 border-green-200',
            humas: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            publikasi: 'bg-pink-100 text-pink-800 border-pink-200',
            anggota: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[position] || colors.anggota;
    };

    const groupMembersByPosition = () => {
        const positions = ['kordes', 'sekretaris', 'bendahara', 'humas', 'publikasi'];
        const grouped = {
            officers: [],
            regular: []
        };

        members.forEach(member => {
            if (positions.includes(member.position)) {
                grouped.officers.push(member);
            } else {
                grouped.regular.push(member);
            }
        });

        return grouped;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Show message if not assigned to posto yet
    if (error === 'not_assigned') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link to="/dashboard/kkn" className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                            ← Kembali ke Dashboard KKN
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Posko KKN Saya</h1>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-blue-900 mb-2">
                            Belum Tergabung dalam Posko
                        </h2>
                        <p className="text-blue-800 mb-4">
                            Anda belum ditugaskan ke posko KKN. Informasi posko akan tersedia setelah admin melakukan penugasan.
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

    const { officers, regular } = groupMembersByPosition();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link to="/dashboard/kkn" className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                        ← Kembali ke Dashboard KKN
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{posto?.posto?.name}</h1>
                            <p className="text-sm text-gray-600 mt-1">{posto?.posto?.fiscal_year?.year}</p>
                        </div>
                        {posto?.my_position && (
                            <div className={`px-4 py-2 rounded-lg border-2 ${getPositionBadge(posto.my_position)}`}>
                                <div className="text-xs font-medium">Jabatan Saya</div>
                                <div className="text-sm font-bold">{posto.my_position_name}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Posto Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Location Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                Lokasi KKN
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-600">Nama Lokasi</div>
                                    <div className="font-medium text-gray-900">
                                        {posto?.posto?.location?.name || '-'}
                                    </div>
                                </div>
                                {posto?.posto?.location?.address && (
                                    <div>
                                        <div className="text-sm text-gray-600">Alamat</div>
                                        <div className="text-sm text-gray-900">{posto.posto.location.address}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DPL Info */}
                        {posto?.posto?.dpl && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-green-600" />
                                    Dosen Pembimbing Lapangan
                                </h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-7 h-7 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900">{posto.posto.dpl.name}</h4>
                                        {posto.posto.dpl.email && (
                                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                                                <Mail className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm truncate">{posto.posto.dpl.email}</span>
                                            </div>
                                        )}
                                        {posto.posto.dpl.phone && (
                                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                                <Phone className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm">{posto.posto.dpl.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Period Info */}
                        {(posto?.posto?.start_date || posto?.posto?.end_date) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                                    Periode KKN
                                </h3>
                                <div className="text-sm text-gray-900">
                                    {posto.posto.start_date && posto.posto.end_date ? (
                                        <>
                                            {new Date(posto.posto.start_date).toLocaleDateString('id-ID', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                            {' - '}
                                            {new Date(posto.posto.end_date).toLocaleDateString('id-ID', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </>
                                    ) : (
                                        'Belum ditentukan'
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Members */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Struktur Kepengurusan */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-green-600" />
                                Struktur Kepengurusan
                            </h3>
                            {officers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {officers.map((member) => (
                                        <div key={member.id} className={`border-2 rounded-lg p-4 ${getPositionBadge(member.position)}`}>
                                            <div className="text-xs font-semibold uppercase mb-2">
                                                {member.position_name}
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">
                                                        {member.student?.name}
                                                    </div>
                                                    <div className="text-xs opacity-75">
                                                        {member.student?.mahasiswa_profile?.npm || '-'}
                                                    </div>
                                                    {member.student?.mahasiswa_profile?.study_program?.name && (
                                                        <div className="text-xs opacity-75 mt-1">
                                                            {member.student.mahasiswa_profile.study_program.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    Belum ada pengurus yang ditunjuk
                                </div>
                            )}
                        </div>

                        {/* Anggota */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-green-600" />
                                Anggota Posko ({regular.length})
                            </h3>
                            {regular.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {regular.map((member) => (
                                        <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {member.student?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {member.student?.mahasiswa_profile?.npm || '-'}
                                                    </div>
                                                    {member.student?.mahasiswa_profile?.study_program?.name && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {member.student.mahasiswa_profile.study_program.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    Belum ada anggota
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {posto?.posto?.description && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{posto.posto.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
