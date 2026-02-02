import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function PermissionsIndex() {
    const { token } = useAuthStore();
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPermissions = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/permissions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissions(response.data);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPermissions();
    }, [token]);

    const handleAddClick = () => {
        setName('');
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (permission) => {
        setName(permission.name);
        setSelectedId(permission.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (!confirm('Are you sure you want to delete this permission?')) return;
        try {
            await axios.delete(`/api/permissions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPermissions();
        } catch (error) {
            console.error(error);
            alert("Failed to delete permission.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await axios.put(`/api/permissions/${selectedId}`, { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/permissions', { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchPermissions();
        } catch (error) {
            console.error(error);
            alert("Failed to save permission.");
        }
        setIsSubmitting(false);
    };

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama Permission',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard',
            cell: ({ row }) => <span className="text-gray-500">{row.original.guard_name}</span>
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(row.original)} className="text-blue-600 hover:text-blue-900" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={() => handleDeleteClick(row.original.id)} 
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Key className="mr-2 text-green-700" /> Manajemen Permission
                </h1>
                <button 
                    onClick={handleAddClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center shadow-sm"
                >
                    <Plus size={18} className="mr-2" /> Tambah Permission
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={permissions} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari permission...',
                        emptyMessage: 'Tidak ada data permission'
                    }} 
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Permission' : 'Tambah Permission'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Permission</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. posts.publish"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: module.action (e.g., users.create)</p>
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
