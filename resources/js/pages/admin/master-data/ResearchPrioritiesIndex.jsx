import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function ResearchPrioritiesIndex() {
    const { token } = useAuth();
    const [priorities, setPriorities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'focus_area', parent_id: '' });
    const [editId, setEditId] = useState(null);
    const [parentOptions, setParentOptions] = useState([]);

    const typeLabels = {
        'focus_area': 'Bidang Fokus',
        'theme': 'Tema Penelitian',
        'topic': 'Topik Penelitian'
    };

    const fetchPriorities = async () => {
        try {
            const response = await axios.get('/api/master/research-priorities', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPriorities(response.data);
        } catch (error) {
            console.error("Failed to fetch priorities", error);
        }
    };

    useEffect(() => {
        fetchPriorities();
    }, []);

    useEffect(() => {
        const fetchParents = async () => {
            if (formData.type === 'focus_area') {
                setParentOptions([]);
                setFormData(prev => ({ ...prev, parent_id: '' }));
                return;
            }
            try {
                const parentType = formData.type === 'theme' ? 'focus_area' : 'theme';
                const response = await axios.get(`/api/master/research-priorities?type=${parentType}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setParentOptions(response.data);
            } catch (error) {
                console.error("Failed to fetch parent options", error);
            }
        };
        fetchParents();
    }, [formData.type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
            };

            if (editId) {
                await axios.put(`/api/master/master-research-priorities/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/master/master-research-priorities', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchPriorities();
            setFormData({ name: '', type: 'focus_area', parent_id: '' });
            setEditId(null);
        } catch (error) {
            console.error("Failed to save priority", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus prioritas riset ini? Data yang terkait akan terpengaruh.")) return;
        try {
            await axios.delete(`/api/master/master-research-priorities/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPriorities();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleEdit = (priority) => {
        setFormData({ 
            name: priority.name, 
            type: priority.type, 
            parent_id: priority.parent_id || '' 
        });
        setEditId(priority.id);
        setShowModal(true);
    };

    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>
        },
        {
            accessorKey: 'type',
            header: 'Kategori',
            cell: ({ row }) => <span className="text-gray-500 uppercase">{typeLabels[row.original.type]}</span>
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
                <h1 className="text-2xl font-bold text-gray-900">Prioritas Riset</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', type: 'focus_area', parent_id: '' });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Prioritas
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={priorities} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari prioritas...',
                        emptyMessage: 'Tidak ada data prioritas riset'
                    }} 
                />
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Prioritas' : 'Tambah Prioritas'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                >
                                    <option value="focus_area">Bidang Fokus</option>
                                    <option value="theme">Tema Penelitian</option>
                                    <option value="topic">Topik Penelitian</option>
                                </select>
                            </div>
                            
                            {formData.type !== 'focus_area' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Induk ({formData.type === 'theme' ? 'Bidang Fokus' : 'Tema Penelitian'})
                                    </label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        required
                                    >
                                        <option value="">-- Pilih Induk --</option>
                                        {parentOptions.map((parent) => (
                                            <option key={parent.id} value={parent.id}>{parent.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
