import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Save, Upload, Info } from 'lucide-react';

export default function SystemSetting() {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // System Settings Data
    const [formData, setFormData] = useState({
        system_name: '',
        university_name: '',
        description: '',
        address: '',
        email: '',
        phone: '',
        theme_color: '#004d40',
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);

    // Cover Settings Data
    const [coverData, setCoverData] = useState({
        penelitian: {
            title_top: '',
            title_bottom_prodi: '',
            title_bottom_faculty: '',
            title_bottom_university: '',
            logo_path: ''
        },
        pkm: {
            title_top: '',
            title_bottom_prodi: '',
            title_bottom_faculty: '',
            title_bottom_university: '',
            logo_path: ''
        }
    });
    const [penelitianLogoFile, setPenelitianLogoFile] = useState(null);
    const [penelitianLogoPreview, setPenelitianLogoPreview] = useState(null);
    const [pkmLogoFile, setPkmLogoFile] = useState(null);
    const [pkmLogoPreview, setPkmLogoPreview] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            // Fetch System Settings
            const systemRes = await api.get('/system-settings');
            const data = systemRes.data;
            setFormData({
                system_name: data.system_name || '',
                university_name: data.university_name || '',
                description: data.description || '',
                address: data.address || '',
                email: data.email || '',
                phone: data.phone || '',
                theme_color: data.theme_color || '#004d40',
            });
            if (data.logo_path) setLogoPreview(`/storage/${data.logo_path}`);
            if (data.favicon_path) setFaviconPreview(`/storage/${data.favicon_path}`);

            // Fetch Cover Settings
            const coverRes = await api.get('/proposal-cover-settings');
            setCoverData(coverRes.data);
            if (coverRes.data.penelitian?.logo_path) setPenelitianLogoPreview(`/storage/${coverRes.data.penelitian.logo_path}`);
            if (coverRes.data.pkm?.logo_path) setPkmLogoPreview(`/storage/${coverRes.data.pkm.logo_path}`);

        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Gagal memuat pengaturan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate size (Logo: 2MB, Favicon: 1MB)
            if (type === 'logo' && file.size > 2 * 1024 * 1024) {
                return toast.error('Ukuran logo maksimal 2MB');
            }
            if (type === 'favicon' && file.size > 1 * 1024 * 1024) {
                return toast.error('Ukuran favicon maksimal 1MB');
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoFile(file);
                    setLogoPreview(reader.result);
                } else {
                    setFaviconFile(file);
                    setFaviconPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (activeTab === 'general') {
                const data = new FormData();
                data.append('system_name', formData.system_name);
                if (formData.university_name) data.append('university_name', formData.university_name);
                if (formData.description) data.append('description', formData.description);
                if (formData.address) data.append('address', formData.address);
                if (formData.email) data.append('email', formData.email);
                if (formData.phone) data.append('phone', formData.phone);
                if (formData.theme_color) data.append('theme_color', formData.theme_color);
                if (logoFile) data.append('logo', logoFile);
                if (faviconFile) data.append('favicon', faviconFile);

                await api.post('/system-settings', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                // Update CSS variable
                document.documentElement.style.setProperty('--primary-color', formData.theme_color);
            } else {
                // Handle Cover Settings (Penelitian or PKM)
                const type = activeTab === 'penelitian' ? 'penelitian' : 'pkm';
                const currentData = coverData[type];
                const file = activeTab === 'penelitian' ? penelitianLogoFile : pkmLogoFile;

                const data = new FormData();
                data.append('type', type);
                data.append('title_top', currentData.title_top || '');
                data.append('title_bottom_prodi', currentData.title_bottom_prodi || '');
                data.append('title_bottom_faculty', currentData.title_bottom_faculty || '');
                data.append('title_bottom_university', currentData.title_bottom_university || '');
                if (file) data.append('logo', file);

                await api.post('/proposal-cover-settings', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            toast.success('Pengaturan berhasil disimpan');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Memuat pengaturan...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
                    <p className="text-gray-500">Kelola informasi sistem dan sampul proposal</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Informasi Sistem
                </button>
                <button
                    onClick={() => setActiveTab('penelitian')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'penelitian' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Sampul Penelitian
                </button>
                <button
                    onClick={() => setActiveTab('pkm')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pkm' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Sampul PKM
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'general' ? (
                        <>
                            {/* General Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sistem / Aplikasi</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.system_name}
                                        onChange={e => setFormData({ ...formData, system_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                {/* ... rest of general fields ... */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Universitas</label>
                                    <input
                                        type="text"
                                        value={formData.university_name}
                                        onChange={e => setFormData({ ...formData, university_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: Universitas Islam Madura"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    ></textarea>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Instansi</label>
                                    <textarea
                                        rows="2"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Kontak</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Tema Dasar</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={formData.theme_color}
                                            onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                                            className="h-10 w-10 p-0 border border-gray-300 rounded cursor-pointer overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme_color}
                                            onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Branding & Logo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Aplikasi</label>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <Upload className="text-gray-400" size={24} />}
                                            </div>
                                            <div>
                                                <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                                                <label htmlFor="logo-upload" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer inline-block">Ganti Logo</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                                {faviconPreview ? <img src={faviconPreview} alt="Favicon" className="w-8 h-8 object-contain" /> : <Info className="text-gray-400" size={24} />}
                                            </div>
                                            <div>
                                                <input type="file" id="favicon-upload" accept=".ico,.png,.jpg" className="hidden" onChange={(e) => handleFileChange(e, 'favicon')} />
                                                <label htmlFor="favicon-upload" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer inline-block">Ganti Favicon</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Atas Sampul</label>
                                    <input
                                        type="text"
                                        value={coverData[activeTab]?.title_top || ''}
                                        onChange={e => setCoverData({
                                            ...coverData,
                                            [activeTab]: { ...coverData[activeTab], title_top: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder={activeTab === 'penelitian' ? 'LAPORAN PENELITIAN' : 'USULAN PROGRAM KREATIVITAS MAHASISWA'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bawah (Program Studi)</label>
                                    <input
                                        type="text"
                                        value={coverData[activeTab]?.title_bottom_prodi || ''}
                                        onChange={e => setCoverData({
                                            ...coverData,
                                            [activeTab]: { ...coverData[activeTab], title_bottom_prodi: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bawah (Fakultas)</label>
                                    <input
                                        type="text"
                                        value={coverData[activeTab]?.title_bottom_faculty || ''}
                                        onChange={e => setCoverData({
                                            ...coverData,
                                            [activeTab]: { ...coverData[activeTab], title_bottom_faculty: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bawah (Universitas)</label>
                                    <input
                                        type="text"
                                        value={coverData[activeTab]?.title_bottom_university || ''}
                                        onChange={e => setCoverData({
                                            ...coverData,
                                            [activeTab]: { ...coverData[activeTab], title_bottom_university: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Sampul</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {activeTab === 'penelitian' ? (
                                            penelitianLogoPreview ? <img src={penelitianLogoPreview} alt="Logo" className="w-full h-full object-contain" /> : <Upload className="text-gray-400" size={24} />
                                        ) : (
                                            pkmLogoPreview ? <img src={pkmLogoPreview} alt="Logo" className="w-full h-full object-contain" /> : <Upload className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id={`logo-upload-${activeTab}`}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        if (activeTab === 'penelitian') {
                                                            setPenelitianLogoFile(file);
                                                            setPenelitianLogoPreview(reader.result);
                                                        } else {
                                                            setPkmLogoFile(file);
                                                            setPkmLogoPreview(reader.result);
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label htmlFor={`logo-upload-${activeTab}`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer inline-block">Ganti Logo</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors shadow-sm"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
