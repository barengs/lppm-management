import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function SdgIndex() {
    const { token } = useAuth();
    const [sdgs, setSdgs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ key: '', label: '', sort_order: '0', is_active: true });
    const [editId, setEditId] = useState(null);

    const fetchSdgs = async () => {
        try {
            const response = await axios.get('/api/master/selections/sdg_goal', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSdgs(response.data);
        } catch (error) {
            console.error("Failed to fetch SDGs", error);
        }
    };

    useEffect(() => {
        fetchSdgs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: 'sdg_goal',
                key: formData.key,
                label: formData.label,
                sort_order: parseInt(formData.sort_order),
                is_active: formData.is_active
            };

            if (editId) {
                await axios.put(`/api/master/master-selections/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/master/master-selections', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchSdgs();
            setFormData({ key: '', label: '', sort_order: '0', is_active: true });
            setEditId(null);
        } catch (error) {
            console.error("Failed to save SDG", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus Target SDG ini?")) return;
        try {
            await axios.delete(`/api/master/master-selections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSdgs();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleEdit = (sdg) => {
        setFormData({ 
            key: sdg.key, 
            label: sdg.label, 
            sort_order: sdg.sort_order.toString(), 
            is_active: sdg.is_active 
        });
        setEditId(sdg.id);
        setShowModal(true);
    };

    const columns = React.useMemo(() => [
        {
            accessorKey: 'key',
            header: 'Kode SDG',
            cell: ({ row }) => <span className="text-gray-500 uppercase">{row.original.key}</span>
        },
        {
            accessorKey: 'label',
            header: 'Label (Nama SDG)',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.label}</span>
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.original.is_active ? 'Aktif' : 'Non-Aktif'}
                </span>
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
                <h1 className="text-2xl font-bold text-gray-900">Target SDGs</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ key: '', label: '', sort_order: '0', is_active: true });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah SDG
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={sdgs} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari SDG...',
                        emptyMessage: 'Tidak ada data Target SDGs'
                    }} 
                />
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit SDG' : 'Tambah SDG'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Kode (Key)</label>
                                <input
                                    type="text"
                                    value={formData.key}
                                    placeholder="Contoh: sdg_1"
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Label (Nama)</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    placeholder="Contoh: Tanpa Kemiskinan"
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Urutan (Sort Order)</label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-6 flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                    Aktif
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
