import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Briefcase, MapPin, Award, BookOpen, Fingerprint } from 'lucide-react';

export default function ProfileIndex() {
    const { user } = useAuth();

    if (!user) return null;

    // Determine profile data based on role
    const profileData = user.dosen_profile || user.mahasiswa_profile || {};
    const specificId = profileData.nidn || profileData.npm || '-';
    const specificLabel = user.role === 'mahasiswa' ? 'NPM' : 'NIDN';
    
    // Avatar Logic
    const avatarSrc = user.avatar 
        ? (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Cover */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="h-32 bg-gradient-to-r from-green-600 to-green-400"></div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4 gap-4">
                        <div className="relative">
                            <img 
                                src={avatarSrc} 
                                alt={user.name} 
                                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                            />
                            {/* <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border text-gray-600 hover:text-green-600">
                                <Edit size={14} />
                            </button> */}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                    {user.role}
                                </span>
                                <span className="text-sm">•</span>
                                <span className="text-sm">{user.email}</span>
                            </div>
                        </div>
                        <div>
                             {/* Placeholder for future Edit Action */}
                             {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">Edit Profil</button> */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="mr-2 text-green-600" size={20} /> Informasi Pribadi
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nama Lengkap</div>
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</div>
                                    <div className="font-medium text-gray-900">{user.email}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{specificLabel}</div>
                                    <div className="font-medium text-gray-900 flex items-center">
                                        <Fingerprint className="mr-1.5 text-gray-400" size={16} />
                                        {specificId}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</div>
                                    <div className="font-medium text-gray-900 capitalize flex items-center">
                                        <Award className="mr-1.5 text-gray-400" size={16} />
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <Briefcase className="mr-2 text-green-600" size={20} /> Akademik & Afiliasi
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fakultas</div>
                                    <div className="font-medium text-gray-900 flex items-center">
                                        <MapPin className="mr-1.5 text-gray-400" size={16} />
                                        {profileData.fakultas || '-'}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Program Studi</div>
                                    <div className="font-medium text-gray-900 flex items-center">
                                        <BookOpen className="mr-1.5 text-gray-400" size={16} />
                                        {profileData.prodi || '-'}
                                    </div>
                                </div>
                                {/* Jacket Size for Students */}
                                {user.role === 'mahasiswa' && (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ukuran Jaket/Kaos</div>
                                        <div className="font-medium text-gray-900 flex items-center">
                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-green-100 text-green-800 text-xs font-bold mr-2">
                                                {profileData.jacket_size || '-'}
                                            </span>
                                            {profileData.jacket_size ? 'Ukuran Terpilih' : 'Belum Dipilih'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info (Summary) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Akun</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600 text-sm">Status</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Aktif</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600 text-sm">Bergabung</span>
                                <span className="text-gray-900 text-sm">{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600 text-sm">Verifikasi Email</span>
                                <span className={`text-sm ${user.email_verified_at ? 'text-green-600' : 'text-orange-500'}`}>
                                    {user.email_verified_at ? 'Terverifikasi' : 'Belum'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links or Helper */}
                    <div className="bg-green-50 rounded-lg border border-green-100 p-4">
                        <h4 className="text-green-800 font-medium mb-2 text-sm">Butuh Bantuan?</h4>
                        <p className="text-green-600 text-xs mb-3">
                            Jika terdapat kesalahan data pada profil Anda, silakan hubungi administrator LPPM.
                        </p>
                        <a href="mailto:lppm@uim.ac.id" className="text-green-700 text-sm font-semibold hover:underline flex items-center">
                            <Mail size={14} className="mr-1" /> Hubungi Admin
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
