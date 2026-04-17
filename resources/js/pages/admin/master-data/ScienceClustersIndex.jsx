import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function ScienceClustersIndex() {
    const { token } = useAuth();
    const [clusters, setClusters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', level: '1', parent_id: '' });
    const [editId, setEditId] = useState(null);
    const [parentOptions, setParentOptions] = useState([]);

    const fetchClusters = async () => {
        try {
            // Get all clusters for the table
            const response = await axios.get('/api/master/science-clusters', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // To make sure all levels are fetched, MasterDataController returns everything if no level param
            setClusters(response.data);
        } catch (error) {
            console.error("Failed to fetch clusters", error);
        }
    };

    useEffect(() => {
        fetchClusters();
    }, []);

    // Dynamically update available parents when level changes
    useEffect(() => {
        const fetchParents = async () => {
            if (formData.level === '1') {
                setParentOptions([]);
                setFormData(prev => ({ ...prev, parent_id: '' }));
                return;
            }
            try {
                const parentLevel = parseInt(formData.level) - 1;
                const response = await axios.get(`/api/master/science-clusters?level=${parentLevel}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setParentOptions(response.data);
            } catch (error) {
                console.error("Failed to fetch parent options", error);
            }
        };
        fetchParents();
    }, [formData.level]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                level: parseInt(formData.level),
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
            };

            if (editId) {
                await axios.put(`/api/master/master-science-clusters/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/master/master-science-clusters', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchClusters();
            setFormData({ name: '', level: '1', parent_id: '' });
            setEditId(null);
        } catch (error) {
            console.error("Failed to save cluster", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus rumpun ilmu ini? Data yang terkait akan terpengaruh.")) return;
        try {
            await axios.delete(`/api/master/master-science-clusters/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClusters();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleEdit = (cluster) => {
        setFormData({ 
            name: cluster.name, 
            level: cluster.level.toString(), 
            parent_id: cluster.parent_id || '' 
        });
        setEditId(cluster.id);
        setShowModal(true);
    };

    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama Rumpun Ilmu',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>
        },
        {
            accessorKey: 'level',
            header: 'Level',
            cell: ({ row }) => <span className="text-gray-500">Level {row.original.level}</span>
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
                <h1 className="text-2xl font-bold text-gray-900">Rumpun Ilmu</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', level: '1', parent_id: '' });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Rumpun
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={clusters} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari rumpun ilmu...',
                        emptyMessage: 'Tidak ada data rumpun ilmu'
                    }} 
                />
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Rumpun Ilmu' : 'Tambah Rumpun Ilmu'}</h2>
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
                                <label className="block text-sm font-medium text-gray-700">Level (Tingkat)</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                >
                                    <option value="1">Level 1 (Utama)</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                </select>
                            </div>
                            
                            {formData.level !== '1' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700">Induk / Parent (Level {parseInt(formData.level) - 1})</label>
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
