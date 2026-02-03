import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, BookOpen } from 'lucide-react';

export default function StudentRegister() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [studyPrograms, setStudyPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'mahasiswa',
        identity_number: '', // NPM
        prodi: '',
        fakultas: '',
        jacket_size: ''
    });

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [facRes, prodiRes] = await Promise.all([
                api.get('/faculties'),
                api.get('/study-programs')
            ]);
            setFaculties(facRes.data);
            setStudyPrograms(prodiRes.data);
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Filter study programs when faculty changes
        if (name === 'fakultas') {
            const filtered = studyPrograms.filter(p => p.faculty_id == value);
            setFilteredPrograms(filtered);
            setFormData(prev => ({ ...prev, prodi: '' })); // Reset prodi
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Registrasi berhasil! Silakan login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Registrasi gagal.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div>
                     <div className="flex justify-center mb-2">
                        <div className="bg-green-100 p-3 rounded-full">
                            <BookOpen className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                        Daftar Akun Mahasiswa
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Atau <Link to="/login" className="font-medium text-green-600 hover:text-green-500">login jika sudah punya akun</Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Lengkap</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Nama Lengkap"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="relative mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">NPM (Nomor Pokok Mahasiswa)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><BookOpen size={18} /></span>
                                <input
                                    name="identity_number" // Maps to NPM
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="123456789"
                                    value={formData.identity_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        {/* Fakultas & Prodi Dropdowns */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Fakultas</label>
                                <select
                                    name="fakultas"
                                    required
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={formData.fakultas}
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Fakultas</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Program Studi</label>
                                <select
                                    name="prodi"
                                    required
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={formData.prodi}
                                    onChange={handleChange}
                                    disabled={!formData.fakultas}
                                >
                                    <option value="">Pilih Prodi</option>
                                    {filteredPrograms.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Ukuran Jaket/Kaos</label>
                            <select
                                name="jacket_size"
                                required
                                className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.jacket_size}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Ukuran</option>
                                {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Pilih ukuran untuk atribut KKN/Kegiatan.</p>
                        </div>

                        <div className="relative mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="relative mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Konfirmasi Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                                <input
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Ulangi Password"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-green-900 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
