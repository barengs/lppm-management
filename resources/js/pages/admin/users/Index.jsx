import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { PlusCircle, Edit, Trash2, Upload, Download, User, BookOpen, Camera, Lock } from 'lucide-react';
import DataTable from '../../../components/DataTable';
import { toast } from 'react-toastify';

export default function UsersIndex() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    // Form and File state
    const [formData, setFormData] = useState({ 
        name: '', email: '', role: 'dosen', password: '', 
        nidn: '', prodi: '', fakultas: '',
        scopus_id: '', sinta_id: '', google_scholar_id: '' 
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    const [editId, setEditId] = useState(null);
    const [activeTab, setActiveTab] = useState('account'); // account | profile

    const [roles, setRoles] = useState([]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(response.data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to fetch staff list");
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use FormData for File Upload
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('email', formData.email);
            payload.append('role', formData.role);
            
            if (formData.password) payload.append('password', formData.password);
            if (avatarFile) payload.append('avatar', avatarFile);

            // Profile Fields
            if (['dosen', 'reviewer'].includes(formData.role)) {
                if (formData.nidn) payload.append('nidn', formData.nidn);
                if (formData.prodi) payload.append('prodi', formData.prodi);
                if (formData.fakultas) payload.append('fakultas', formData.fakultas);
                if (formData.scopus_id) payload.append('scopus_id', formData.scopus_id);
                if (formData.sinta_id) payload.append('sinta_id', formData.sinta_id);
                if (formData.google_scholar_id) payload.append('google_scholar_id', formData.google_scholar_id);
            }

            // Method Spoofing for PUT (Laravel requires POST for multipart with _method)
            if (editId) {
                payload.append('_method', 'PUT'); 
                await axios.post(`/api/users/${editId}`, payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success("User updated");
            } else {
                await axios.post('/api/users', payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success("User created");
            }
            setShowModal(false);
            fetchUsers();
            resetForm();
        } catch (error) {
            console.error("Failed to save user", error);
            toast.error(error.response?.data?.message || "Failed to save user");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("User deleted");
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete user");
        }
    };

    const handleEdit = (user) => {
        const profile = user.dosen_profile || {};
        setFormData({ 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            password: '', 
            nidn: profile.nidn || '', 
            prodi: profile.prodi || '',
            fakultas: profile.fakultas || '',
            scopus_id: profile.scopus_id || '',
            sinta_id: profile.sinta_id || '',
            google_scholar_id: profile.google_scholar_id || ''
        });
        setEditId(user.id);
        setAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null);
        setAvatarFile(null);
        setActiveTab('account');
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ 
            name: '', email: '', role: 'dosen', password: '', 
            nidn: '', prodi: '', fakultas: '',
            scopus_id: '', sinta_id: '', google_scholar_id: '' 
        });
        setAvatarFile(null);
        setAvatarPreview(null);
        setEditId(null);
        setActiveTab('account');
    };

    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);

        setIsImporting(true);
        try {
            await axios.post('/api/users/import', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            toast.success('Import successful');
            setShowImportModal(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Import failed check console');
        }
        setIsImporting(false);
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get('/api/users/template', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download template", error);
            toast.error("Failed to download template");
        }
    };

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 h-10 w-10">
                        {row.original.avatar ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={`/storage/${row.original.avatar}`} alt="" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                {row.original.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{row.original.name}</div>
                        <div className="text-sm text-gray-500">{row.original.email}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => {
                const colors = {
                    admin: 'bg-red-100 text-red-800',
                    dosen: 'bg-blue-100 text-blue-800',
                    reviewer: 'bg-yellow-100 text-yellow-800',
                    tendik: 'bg-green-100 text-green-800',
                    staff_kkn: 'bg-purple-100 text-purple-800'
                };
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[row.original.role] || 'bg-gray-100 text-gray-800'}`}>
                        {row.original.role ? row.original.role.toUpperCase() : '-'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'info',
            header: 'Info Akademik',
            cell: ({ row }) => (
                <div className="text-sm text-gray-500">
                    {row.original.dosen_profile?.nidn && <div><span className="font-semibold text-xs">NIDN:</span> {row.original.dosen_profile.nidn}</div>}
                    {row.original.dosen_profile?.prodi && <div><span className="font-semibold text-xs">Prodi:</span> {row.original.dosen_profile.prodi}</div>}
                    {row.original.dosen_profile?.scopus_id && <div><span className="font-semibold text-xs text-blue-600">Scopus:</span> {row.original.dosen_profile.scopus_id}</div>}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(row.original)} className="text-blue-600 hover:text-blue-900" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.original.id)} className="text-red-600 hover:text-red-900" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Staff / Dosen</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                        <Upload size={18} className="mr-2" /> Import Excel
                    </button>
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
                    data={users} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Search staff...',
                        emptyMessage: 'No staff found'
                    }} 
                />
            </div>

            {/* Main Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-800">{editId ? 'Edit Staff/Dosen' : 'Tambah Staff/Dosen Baru'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b">
                            <button 
                                onClick={() => setActiveTab('account')}
                                className={`flex-1 py-3 text-sm font-medium text-center flex items-center justify-center gap-2 border-b-2 ${activeTab === 'account' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <User size={16} /> Informasi Akun
                            </button>
                            <button 
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
                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="shrink-0 relative group">
                                            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User size={40} className="text-gray-300" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 p-1.5 bg-white border rounded-full shadow cursor-pointer hover:bg-gray-50 text-gray-600">
                                                <Camera size={14} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">Foto Profil</h3>
                                            <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG. Maksimal 2MB. Akan ditampilkan sebagai avatar pengguna.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                required
                                                placeholder="Nama lengkap beserta gelar..."
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5 bg-white"
                                            >
                                                <option value="" disabled>Pilih Role...</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.name}>
                                                        {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace(/_/g, ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="flex items-center gap-1"><Lock size={12}/> Password</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                placeholder={editId ? 'Kosongkan jika tidak ingin mengubah password' : 'Masukkan password...'}
                                                {...(!editId && { required: true })}
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Tab */}
                                <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
                                    {!['dosen', 'reviewer'].includes(formData.role) ? (
                                        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                            Role <strong>{formData.role}</strong> tidak memerlukan profil akademik secara mandatory.
                                            <br/>
                                            <span className="text-xs">Namun Anda tetap bisa mengisinya jika diperlukan.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs mb-4">
                                                Informasi ini akan ditampilkan pada profil publik dosen/reviewer dan digunakan untuk pelaporan.
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIDN / NIDK</label>
                                                    <input
                                                        type="text"
                                                        value={formData.nidn}
                                                        onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                        placeholder="Nomor Induk Dosen..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                                                    <input
                                                        type="text"
                                                        value={formData.prodi}
                                                        onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                                                    <input
                                                        type="text"
                                                        value={formData.fakultas}
                                                        onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sinta ID</label>
                                                    <input
                                                        type="text"
                                                        value={formData.sinta_id}
                                                        onChange={(e) => setFormData({ ...formData, sinta_id: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                        placeholder="Sinta Author ID"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scopus ID</label>
                                                    <input
                                                        type="text"
                                                        value={formData.scopus_id}
                                                        onChange={(e) => setFormData({ ...formData, scopus_id: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                        placeholder="Scopus Author ID"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Scholar ID</label>
                                                    <input
                                                        type="text"
                                                        value={formData.google_scholar_id}
                                                        onChange={(e) => setFormData({ ...formData, google_scholar_id: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                                        placeholder="Google Scholar ID"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white hover:shadow-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm flex items-center"
                                >
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Import Staff/Dosen (Excel)</h2>
                            <button onClick={handleDownloadTemplate} className="text-sm text-blue-600 hover:underline flex items-center">
                                <Download size={16} className="mr-1" /> Template
                            </button>
                        </div>
                        <form onSubmit={handleImport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel (.xlsx, .xls, .csv)</label>
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    className="w-full border p-2 rounded"
                                    required 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Kolom: <strong>name, email, role, nidn, faculty_code, prodi_code</strong>
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded">Batal</button>
                                <button type="submit" disabled={isImporting} className="px-4 py-2 bg-blue-600 text-white rounded">{isImporting ? 'Importing...' : 'Import'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
