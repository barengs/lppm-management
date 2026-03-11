import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { PlusCircle, Edit, Trash2, Key, User, BookOpen, Eye, EyeOff } from 'lucide-react';
import DataTable from '../../../components/DataTable';
import { toast } from 'react-toastify';

export default function StudentsIndex() {
    const { token, user } = useAuth();
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        npm: '', prodi: '', fakultas: '', phone: '', address: '', gender: ''
    });

    // Reset Password State
    const [resetData, setResetData] = useState({
        id: null,
        name: '',
        newPassword: ''
    });

    const [editId, setEditId] = useState(null);
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);

    const [faculties, setFaculties] = useState([]);
    const [studyPrograms, setStudyPrograms] = useState([]);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
            toast.error("Failed to fetch student list");
        }
    };

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [facRes, prodiRes] = await Promise.all([
                    axios.get('/api/faculties'),
                    axios.get('/api/study-programs')
                ]);
                setFaculties(facRes.data);
                setStudyPrograms(prodiRes.data);
            } catch (error) {
                console.error("Failed to fetch master data", error);
            }
        };

        fetchStudents();
        fetchMasterData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            if (editId) {
                await axios.put(`/api/students/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Student updated");
            } else {
                await axios.post('/api/students', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Student created");
            }
            setShowModal(false);
            fetchStudents();
            resetForm();
        } catch (error) {
            console.error("Failed to save student", error);
            toast.error(error.response?.data?.message || "Failed to save student");
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/students/${resetData.id}`, { password: resetData.newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Password mahasiswa berhasil direset");
            setShowResetModal(false);
            setResetData({ id: null, name: '', newPassword: '' });
        } catch (error) {
            console.error("Failed to reset password", error);
            toast.error("Gagal mereset password");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await axios.delete(`/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Student deleted");
            fetchStudents();
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete student");
        }
    };

    const handleEdit = (student) => {
        const profile = student.mahasiswa_profile || {};
        setFormData({
            name: student.name,
            email: student.email,
            password: '',
            npm: profile.npm || '',
            prodi: profile.prodi || '',
            fakultas: profile.fakultas || '',
            phone: profile.phone || '',
            address: profile.address || '',
            gender: profile.gender || ''
        });
        setEditId(student.id);
        setActiveTab('account');
        setShowPassword(false);
        setShowModal(true);
    };

    const handleOpenResetModal = (student) => {
        setResetData({
            id: student.id,
            name: student.name,
            newPassword: ''
        });
        setShowPassword(false);
        setShowResetModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', password: '',
            npm: '', prodi: '', fakultas: '', phone: '', address: '', gender: ''
        });
        setEditId(null);
        setActiveTab('account');
        setShowPassword(false);
    };

    // Filter program studi berdasarkan fakultas
    const filteredStudyPrograms = formData.fakultas
        ? studyPrograms.filter(p => p.faculty_id == faculties.find(f => f.name === formData.fakultas)?.id || p.faculty_id == formData.fakultas)
        : [];

    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{row.original.name}</div>
                    <div className="text-sm text-gray-500">{row.original.email}</div>
                </div>
            )
        },
        {
            accessorKey: 'npm',
            header: 'NPM',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.mahasiswa_profile?.npm || '-'}</span>
        },
        {
            accessorKey: 'info',
            header: 'Program Studi / Fakultas',
            cell: ({ row }) => (
                <div className="text-sm text-gray-500">
                    <div>{row.original.mahasiswa_profile?.prodi || '-'}</div>
                    <div className="text-xs">{row.original.mahasiswa_profile?.fakultas || '-'}</div>
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenResetModal(row.original)} className="text-orange-600 hover:text-orange-900 border border-orange-200 bg-orange-50 px-2 py-1 rounded" title="Reset Password">
                        <Key size={14} className="inline mr-1" /> Reset
                    </button>
                    <button onClick={() => handleEdit(row.original)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.original.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], [faculties, studyPrograms]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Mahasiswa</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable
                    data={students}
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari mahasiswa atau NPM...',
                        emptyMessage: 'Tidak ada mahasiswa ditemukan'
                    }}
                />
            </div>

            {/* Modal Tambah/Edit Mahasiswa */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-800">{editId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b">
                            <button
                                type="button"
                                onClick={() => setActiveTab('account')}
                                className={`flex-1 py-3 text-sm font-medium text-center flex items-center justify-center gap-2 border-b-2 ${activeTab === 'account' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <User size={16} /> Informasi Akun
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 py-3 text-sm font-medium text-center flex items-center justify-center gap-2 border-b-2 ${activeTab === 'profile' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <BookOpen size={16} /> Profil Akademik
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
                            <div className="p-6 overflow-y-auto flex-grow">
                                {/* Account Tab */}
                                <div className={activeTab === 'account' ? 'block' : 'hidden'}>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                required
                                                placeholder="Nama lengkap..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5 pr-10"
                                                    placeholder={editId ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password baru...'}
                                                    {...(!editId && { required: true })}
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Tab */}
                                <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">NPM</label>
                                            <input
                                                type="text"
                                                value={formData.npm}
                                                onChange={(e) => setFormData({ ...formData, npm: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                placeholder="Nomor Pokok Mahasiswa"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5 bg-white"
                                            >
                                                <option value="">Pilih...</option>
                                                <option value="L">Laki-laki</option>
                                                <option value="P">Perempuan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                                            <select
                                                value={formData.fakultas}
                                                onChange={(e) => setFormData({ ...formData, fakultas: e.target.value, prodi: '' })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5 bg-white"
                                            >
                                                <option value="">Pilih Fakultas...</option>
                                                {faculties.map(f => (
                                                    <option key={f.id} value={f.name}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                                            <select
                                                value={formData.prodi}
                                                onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5 bg-white"
                                                disabled={!formData.fakultas}
                                            >
                                                <option value="">Pilih Program Studi...</option>
                                                {filteredStudyPrograms.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Reset Password Khusus */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg w-full max-w-sm shadow-xl flex flex-col">
                        <div className="px-6 py-4 border-b bg-orange-50 rounded-t-lg">
                            <h2 className="text-lg font-bold text-orange-800 flex items-center">
                                <Key className="mr-2" size={20} /> Reset Password
                            </h2>
                        </div>
                        <form onSubmit={handleResetPasswordSubmit} className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Mereset password untuk mahasiswa <strong>{resetData.name}</strong>.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                            <div className="relative mb-6">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={resetData.newPassword}
                                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2.5 pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-end gap-2 text-sm">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 bg-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
