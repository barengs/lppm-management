import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../hooks/useAuth';
import { Users, MapPin, Phone, Mail, User, AlertCircle, Calendar, Award, FileText, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import KknGroupPreviewModal from '../../../components/pdf/KknGroupPreviewModal';

export default function StudentKknGroup() {
    const { user, hasRole } = useAuth();
    const [posto, setPosto] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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
            kordes: 'bg-purple-50 text-purple-700 border-purple-200',
            sekretaris: 'bg-blue-50 text-blue-700 border-blue-200',
            bendahara: 'bg-green-50 text-green-700 border-green-200',
            humas: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            publikasi: 'bg-pink-50 text-pink-700 border-pink-200',
            anggota: 'bg-gray-50 text-gray-600 border-gray-200',
            dpl: 'bg-teal-50 text-teal-700 border-teal-200',
        };
        return colors[position] || colors.anggota;
    };

    const getPostoStatusBadge = (status) => {
        const badges = {
            draft: 'bg-orange-50 text-orange-700 border-orange-200',
            active: 'bg-green-50 text-green-700 border-green-200',
            completed: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        const labels = {
            draft: 'Draft',
            active: 'Aktif',
            completed: 'Selesai',
        };
        const longLabels = {
            draft: 'Draft (Struktur Belum Lengkap)',
            active: 'Aktif (Sudah Lengkap)',
            completed: 'Selesai KKN',
        };
        return {
            className: badges[status] || badges.draft,
            label: labels[status] || 'Draft',
            longLabel: longLabels[status] || 'Draft (Struktur Belum Lengkap)'
        };
    };

    // Sort members so officers are listed first: Kordes, Sekretaris, Bendahara, Humas, Publikasi, then Anggota
    const sortedMembers = useMemo(() => {
        const order = {
            kordes: 1,
            sekretaris: 2,
            bendahara: 3,
            humas: 4,
            publikasi: 5,
            anggota: 6
        };
        return [...members].sort((a, b) => {
            const orderA = order[a.position] || 99;
            const orderB = order[b.position] || 99;
            return orderA - orderB;
        });
    }, [members]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Show message if not assigned to posto yet
    if (error === 'not_assigned') {
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <Link to={hasRole('mahasiswa') ? "/dashboard/kkn" : "/dashboard"} className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                        ← Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Posko KKN</h1>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-sm p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-blue-900 mb-2">
                        Belum Tergabung dalam Posko
                    </h2>
                    <p className="text-blue-800 mb-4">
                        Anda belum ditugaskan ke posko KKN. Informasi posko akan tersedia setelah admin melakukan penugasan.
                    </p>
                    <Link
                        to="/dashboard/kkn/status"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 font-medium"
                    >
                        Lihat Status Pendaftaran
                    </Link>
                </div>
            </div>
        );
    }

    if (error === 'fetch_failed') {
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <Link to={hasRole('mahasiswa') ? "/dashboard/kkn" : "/dashboard"} className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                        ← Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Posko KKN</h1>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-sm p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">
                        Akses Ditolak / Gagal Memuat Data
                    </h2>
                    <p className="text-red-800 mb-4">
                        Anda tidak memiliki akses ke halaman ini, atau terjadi kesalahan pada server.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
                <div className="mb-6">
                    <Link to={hasRole('mahasiswa') ? "/dashboard/kkn" : "/dashboard"} className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block">
                        ← Kembali ke Dashboard
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold text-gray-900">{posto?.posto?.name}</h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold border ${getPostoStatusBadge(posto?.posto?.status).className}`}>
                                    {getPostoStatusBadge(posto?.posto?.status).label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{posto?.posto?.fiscal_year?.year || posto?.posto?.kkn_period?.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPrintModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                            >
                                <Printer size={16} />
                                Cetak PDF
                            </button>
                            {posto?.my_position && (
                                <div className={`px-4 py-2 rounded-sm border-2 ${getPositionBadge(posto.my_position)}`}>
                                    <div className="text-xs font-medium">Jabatan Saya</div>
                                    <div className="text-sm font-bold">{posto.my_position_name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    {/* Left Column - Posto Info (Single Card) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 space-y-6">
                            {/* Status Posko */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                                    <Award className="w-5 h-5 mr-2 text-green-600" />
                                    Status Posko
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-bold border ${getPostoStatusBadge(posto?.posto?.status).className}`}>
                                    {getPostoStatusBadge(posto?.posto?.status).longLabel}
                                </span>
                            </div>

                            {/* Location Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                    Lokasi KKN
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500">Nama Lokasi</div>
                                        <div className="font-semibold text-gray-900">
                                            {posto?.posto?.location?.name || '-'}
                                        </div>
                                    </div>
                                    {posto?.posto?.location?.address && (
                                        <div>
                                            <div className="text-xs text-gray-500">Alamat</div>
                                            <div className="text-sm text-gray-900">{posto.posto.location.address}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DPL Info */}
                            {posto?.posto?.dpl && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                                        <User className="w-5 h-5 mr-2 text-green-600" />
                                        Dosen Pembimbing Lapangan
                                    </h3>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-sm flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-green-600" />
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

                            {/* Description Info - Moved below DPL */}
                            {posto?.posto?.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                                        Deskripsi Posko
                                    </h3>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{posto.posto.description}</p>
                                </div>
                            )}

                            {/* Period Info */}
                            {(posto?.posto?.start_date || posto?.posto?.end_date) && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                                        <Calendar className="w-5 h-5 mr-2 text-green-600" />
                                        Periode KKN
                                    </h3>
                                    <div className="text-sm text-gray-900 font-medium">
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
                    </div>

                    {/* Right Column - Member List in Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                                <Users className="w-5 h-5 mr-2 text-green-600" />
                                Anggota Kelompok ({members.length})
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12 text-center">#</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama / NPM</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Program Studi / Fakultas</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Kontak</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Jabatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedMembers.length > 0 ? (
                                            sortedMembers.map((member, idx) => (
                                                <tr key={member.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 text-xs text-gray-400 font-medium text-center">{idx + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-gray-800 uppercase tracking-tight leading-tight">{member.student?.name}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">{member.student?.mahasiswa_profile?.npm || member.student?.mahasiswaProfile?.npm || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-600">
                                                        <div>{member.student?.mahasiswa_profile?.study_program?.name || member.student?.mahasiswaProfile?.studyProgram?.name || '-'}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">{member.student?.mahasiswa_profile?.faculty?.name || member.student?.mahasiswaProfile?.faculty?.name || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        {member.student?.mahasiswa_profile?.phone || member.student?.mahasiswaProfile?.phone ? (
                                                            <a href={`https://wa.me/${(member.student?.mahasiswa_profile?.phone || member.student?.mahasiswaProfile?.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-full transition-colors font-medium">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {member.student?.mahasiswa_profile?.phone || member.student?.mahasiswaProfile?.phone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        {posto?.my_position === 'dpl' ? (
                                                            <select
                                                                value={member.position}
                                                                onChange={async (e) => {
                                                                    try {
                                                                        await api.put(`/kkn/postos/${posto.posto.id}/members/${member.id}`, {
                                                                            position: e.target.value
                                                                        });
                                                                        toast.success('Jabatan berhasil diubah!');
                                                                        fetchPostoData();
                                                                    } catch (err) {
                                                                        toast.error(err.response?.data?.message || 'Gagal mengubah jabatan');
                                                                    }
                                                                }}
                                                                className="text-xs px-2 py-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-medium text-gray-900"
                                                            >
                                                                <option value="kordes">Koordinator Desa (Kordes)</option>
                                                                <option value="sekretaris">Sekretaris</option>
                                                                <option value="bendahara">Bendahara</option>
                                                                <option value="humas">Humas</option>
                                                                <option value="publikasi">Publikasi</option>
                                                                <option value="anggota">Anggota</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`inline-block text-xs font-bold px-2.5 py-1 border rounded-sm ${getPositionBadge(member.position)}`}>
                                                                {member.position_name}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">Belum ada anggota kelompok.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <KknGroupPreviewModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    posto={posto}
                    members={members}
                />
            </div>
        );
    }
