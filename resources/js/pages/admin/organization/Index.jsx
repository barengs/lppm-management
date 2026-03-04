import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { Users, Plus, Edit, Trash2, Upload } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function OrganizationIndex() {
    const { token } = useAuth();
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ user_id: '', position: '', order_index: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/organization-members', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(response.data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
        setIsLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    useEffect(() => {
        fetchMembers();
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const handleAddClick = () => {
        setFormData({ user_id: '', position: '', order_index: members.length + 1 });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (member) => {
        setFormData({ user_id: member.user_id || '', position: member.position || '', order_index: member.order_index || 0 });
        setSelectedId(member.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (!confirm('Are you sure you want to delete this member?')) return;
        try {
            await axios.delete(`/api/organization-members/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMembers();
        } catch (error) {
            console.error(error);
            alert("Failed to delete member.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await axios.put(`/api/organization-members/${selectedId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/organization-members', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchMembers();
        } catch (error) {
            console.error(error);
            alert("Failed to save member.");
        }
        setIsSubmitting(false);
    };

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'order_index',
            header: 'Order',
            cell: ({ row }) => <span className="text-gray-500">{row.original.order_index}</span>
        },
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.user?.name || row.original.name || '-'}</span>
        },
        {
            accessorKey: 'position',
            header: 'Jabatan',
            cell: ({ row }) => <span className="text-gray-500">{row.original.position}</span>
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(row.original)} className="text-blue-600 hover:text-blue-900" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(row.original.id)} className="text-red-600 hover:text-red-900" title="Delete">
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
                    <Users className="mr-2 text-green-700" /> Struktur Organisasi
                </h1>
                <button
                    onClick={handleAddClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center shadow-sm"
                >
                    <Plus size={18} className="mr-2" /> Tambah Anggota
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable
                    data={members}
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari anggota...',
                        emptyMessage: 'Tidak ada data anggota'
                    }}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Anggota' : 'Tambah Anggota'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <select
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2 bg-white"
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                >
                                    <option value="">-- Pilih Anggota --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700">Urutan Tampilan</label>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                                />
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
