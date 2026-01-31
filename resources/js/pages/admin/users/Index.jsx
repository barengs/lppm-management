import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { PlusCircle, Edit, Trash2, Upload, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UsersIndex() {
    const { token } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'dosen', password: '', nidn: '', prodi: '', fakultas: '' });
    const [editId, setEditId] = useState(null);

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
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const data = { ...formData };
                if (!data.password) delete data.password;
                await axios.put(`/api/users/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("User updated");
            } else {
                await axios.post('/api/users', formData, {
                    headers: { Authorization: `Bearer ${token}` }
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
            fakultas: profile.fakultas || ''
        });
        setEditId(user.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', role: 'dosen', password: '', nidn: '', prodi: '', fakultas: '' });
        setEditId(null);
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

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                          user.role === 'dosen' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.dosen_profile?.nidn && <div>NIDN: {user.dosen_profile.nidn}</div>}
                                    {user.dosen_profile?.prodi && <div>Prodi: {user.dosen_profile.prodi}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md h-auto max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Staff/Dosen' : 'New Staff/Dosen'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Password {editId && '(Leave blank to keep current)'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    {...(!editId && { required: true })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="dosen">Dosen</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="tendik">Tendik</option>
                                </select>
                            </div>
                            
                            {(formData.role === 'dosen' || formData.role === 'reviewer') && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">NIDN</label>
                                        <input
                                            type="text"
                                            value={formData.nidn}
                                            onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                                        <input
                                            type="text"
                                            value={formData.prodi}
                                            onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Fakultas</label>
                                        <input
                                            type="text"
                                            value={formData.fakultas}
                                            onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Save
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
