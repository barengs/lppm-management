import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';

export default function RolesIndex() {
    const { token } = useAuthStore();
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(response.data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRoles();
    }, [token]);

    const handleAddClick = () => {
        setName('');
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (role) => {
        setName(role.name);
        setSelectedId(role.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = async (id, roleName) => {
        if (['admin', 'dosen', 'reviewer', 'mahasiswa'].includes(roleName)) {
            alert("Cannot delete system roles.");
            return;
        }

        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await axios.delete(`/api/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoles();
        } catch (error) {
            console.error(error);
            alert("Failed to delete role.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await axios.put(`/api/roles/${selectedId}`, { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/roles', { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchRoles();
        } catch (error) {
            console.error(error);
            alert("Failed to save role.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Shield className="mr-2 text-green-700" /> Manajemen Hak Akses (Role)
                </h1>
                <button 
                    onClick={handleAddClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center shadow-sm"
                >
                    <Plus size={18} className="mr-2" /> Tambah Role
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading roles...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard Name</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{role.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.guard_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(role)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={16} /></button>
                                        <button 
                                            onClick={() => handleDeleteClick(role.id, role.name)} 
                                            className={`text-red-600 hover:text-red-900 ${['admin', 'dosen', 'reviewer', 'mahasiswa'].includes(role.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={['admin', 'dosen', 'reviewer', 'mahasiswa'].includes(role.name)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Role' : 'Tambah Role'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Role</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. kaprodi"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Gunakan huruf kecil, tanpa spasi (e.g. 'staff_admin')</p>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
