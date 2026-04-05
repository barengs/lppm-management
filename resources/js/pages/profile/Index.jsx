import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Mail, Briefcase, MapPin, Award, BookOpen, Fingerprint, 
    Edit, Save, X, Camera, RefreshCw, Phone, Home, Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

export default function ProfileIndex() {
    const { user, token, fetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [studyPrograms, setStudyPrograms] = useState([]);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        npm: '',
        nidn: '',
        fakultas: '',
        prodi: '',
        phone: '',
        address: '',
        gender: '',
        place_of_birth: '',
        date_of_birth: '',
        jacket_size: '',
        scopus_id: '',
        sinta_id: '',
        google_scholar_id: '',
        avatar: null
    });

    useEffect(() => {
        if (user) {
            const profile = user.mahasiswa_profile || user.dosen_profile || {};
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                password_confirmation: '',
                npm: profile.npm || '',
                nidn: profile.nidn || '',
                fakultas: profile.fakultas || '',
                prodi: profile.prodi || '',
                phone: profile.phone || '',
                address: profile.address || '',
                gender: profile.gender || '',
                place_of_birth: profile.place_of_birth || '',
                date_of_birth: profile.date_of_birth || '',
                jacket_size: profile.jacket_size || '',
                scopus_id: profile.scopus_id || '',
                sinta_id: profile.sinta_id || '',
                google_scholar_id: profile.google_scholar_id || '',
                avatar: null
            });
        }
    }, [user, isEditing]);

    useEffect(() => {
        if (isEditing) {
            fetchMasterData();
        }
    }, [isEditing]);

    const fetchMasterData = async () => {
        try {
            const [facRes, prodiRes] = await Promise.all([
                axios.get('/api/faculties'),
                axios.get('/api/study-programs')
            ]);
            setFaculties(facRes.data);
            setStudyPrograms(prodiRes.data);
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                data.append(key, value);
            }
        });

        try {
            await axios.post('/api/profile/update', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Profil berhasil diperbarui!');
            await fetchUser(); // Refresh global auth state
            setIsEditing(false);
            setPreviewAvatar(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const profileData = user.mahasiswa_profile || user.dosen_profile || {};
    const avatarSrc = previewAvatar || (user.avatar 
        ? (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header / Cover */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-green-700 via-green-600 to-green-500 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
                        <div className="relative group">
                            <img 
                                src={avatarSrc} 
                                alt={user.name} 
                                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                            />
                            {isEditing && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                            <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                                    {user.role}
                                </span>
                                <span className="text-gray-400 hidden md:inline">•</span>
                                <span className="text-gray-600 flex items-center gap-1">
                                    <Mail size={14} /> {user.email}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        <X size={18} className="mr-2" /> Batal
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md shadow-green-100"
                                    >
                                        {loading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                                        Simpan Perubahan
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-200"
                                >
                                    <Edit size={18} className="mr-2" /> Edit Profil
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                <User className="mr-3 text-green-600" size={22} /> Akun Dasar
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
                                    <input 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                                    <input 
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                <Briefcase className="mr-3 text-green-600" size={22} /> Akademik & Identitas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">
                                        {user.role === 'mahasiswa' ? 'NPM (Nomor Pokok Mahasiswa)' : 'NIDN (Nomor Induk Dosen)'}
                                    </label>
                                    <input 
                                        name={user.role === 'mahasiswa' ? 'npm' : 'nidn'}
                                        value={user.role === 'mahasiswa' ? formData.npm : formData.nidn}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Fakultas</label>
                                    <select 
                                        name="fakultas"
                                        value={formData.fakultas}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    >
                                        <option value="">Pilih Fakultas</option>
                                        {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Program Studi</label>
                                    <select 
                                        name="prodi"
                                        value={formData.prodi}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    >
                                        <option value="">Pilih Program Studi</option>
                                        {studyPrograms
                                            .filter(p => !formData.fakultas || p.faculty_id == formData.fakultas)
                                            .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                {user.role === 'mahasiswa' && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Ukuran Jaket</label>
                                        <select 
                                            name="jacket_size"
                                            value={formData.jacket_size}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                        >
                                            <option value="">Pilih Ukuran</option>
                                            {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                <Home className="mr-3 text-green-600" size={22} /> Informasi Kontak & Pribadi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">No. WhatsApp</label>
                                    <input 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Jenis Kelamin</label>
                                    <select 
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Tempat Lahir</label>
                                    <input 
                                        name="place_of_birth"
                                        value={formData.place_of_birth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Tanggal Lahir</label>
                                    <input 
                                        name="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Alamat Lengkap</label>
                                    <textarea 
                                        name="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Security */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                <Fingerprint className="mr-3 text-red-600" size={22} /> Keamanan
                            </h3>
                            <p className="text-xs text-gray-500 mb-4 italic">Kosongkan jika tidak ingin mengubah password</p>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Password Baru</label>
                                    <input 
                                        name="password"
                                        type="password"
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Konfirmasi Password</label>
                                    <input 
                                        name="password_confirmation"
                                        type="password"
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {user.role !== 'mahasiswa' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                                    <Award className="mr-3 text-blue-600" size={22} /> Riset & Publikasi
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Scopus ID</label>
                                        <input 
                                            name="scopus_id"
                                            value={formData.scopus_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Sinta ID</label>
                                        <input 
                                            name="sinta_id"
                                            value={formData.sinta_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Google Scholar ID</label>
                                        <input 
                                            name="google_scholar_id"
                                            value={formData.google_scholar_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* View Mode Components */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <User className="mr-3 text-green-600" size={22} /> Informasi Pribadi
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoItem label="Nama Lengkap" value={user.name} />
                                <InfoItem label="Email" value={user.email} />
                                <InfoItem label={user.role === 'mahasiswa' ? 'NPM' : 'NIDN'} value={profileData.npm || profileData.nidn} icon={<Fingerprint size={16} />} />
                                <InfoItem label="No. HP" value={profileData.phone} icon={<Phone size={16} />} />
                                <InfoItem label="Tempat, Tgl Lahir" value={`${profileData.place_of_birth || '-'}, ${profileData.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString('id-ID') : '-'}`} icon={<Calendar size={16} />} />
                                <InfoItem label="Jenis Kelamin" value={profileData.gender === 'L' ? 'Laki-laki' : (profileData.gender === 'P' ? 'Perempuan' : '-')} icon={<User size={16} />} />
                                <div className="sm:col-span-2">
                                    <InfoItem label="Alamat" value={profileData.address} icon={<Home size={16} />} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <Briefcase className="mr-3 text-green-600" size={22} /> Akademik & Afiliasi
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoItem label="Fakultas" value={profileData?.faculty?.name || profileData?.faculty_name || profileData?.fakultas} icon={<MapPin size={16} />} />
                                <InfoItem label="Program Studi" value={profileData?.studyProgram?.name || profileData?.study_program?.name || profileData?.prodi} icon={<BookOpen size={16} />} />
                                {user.role === 'mahasiswa' && <InfoItem label="Ukuran Jaket" value={profileData?.jacket_size} badge />}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Akun</h3>
                            <div className="space-y-4">
                                <SummaryItem label="Status" value="Aktif" status />
                                <SummaryItem label="Bergabung" value={new Date(user.created_at).toLocaleDateString('id-ID')} />
                                <SummaryItem label="Verifikasi" value={user.email_verified_at ? 'Terverifikasi' : 'Belum'} check={user.email_verified_at} />
                            </div>
                        </div>

                        {user.role !== 'mahasiswa' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <Award className="mr-3 text-blue-600" size={22} /> IDs Riset
                                </h3>
                                <div className="space-y-4">
                                    <SummaryItem label="Scopus ID" value={profileData.scopus_id} />
                                    <SummaryItem label="Sinta ID" value={profileData.sinta_id} />
                                    <SummaryItem label="Scholar ID" value={profileData.google_scholar_id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const InfoItem = ({ label, value, icon, badge }) => (
    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-1 hover:border-green-200 transition-colors">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</div>
        <div className="font-semibold text-gray-800 flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            {badge ? (
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-green-600 text-white text-xs font-black">
                    {value || '-'}
                </span>
            ) : (value || '-')}
        </div>
    </div>
);

const SummaryItem = ({ label, value, status, check }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 px-2 rounded-lg transition-colors">
        <span className="text-gray-500 text-sm">{label}</span>
        {status ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-black uppercase tracking-tighter ring-1 ring-green-200">{value}</span>
        ) : (
            <span className={`text-sm font-bold ${check === false ? 'text-orange-500' : 'text-gray-900'}`}>{value}</span>
        )}
    </div>
);
