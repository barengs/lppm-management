import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function SchemesIndex() {
    const { token } = useAuthStore();
    const [schemes, setSchemes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'research', max_budget: '' });
    const [editId, setEditId] = useState(null);

    const fetchSchemes = async () => {
        try {
            const response = await axios.get('/api/schemes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchemes(response.data);
        } catch (error) {
            console.error("Failed to fetch schemes", error);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/api/schemes/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/schemes', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchSchemes();
            setFormData({ name: '', type: 'research', max_budget: '' });
            setEditId(null);
        } catch (error) {
            console.error("Failed to save scheme", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this scheme?")) return;
        try {
            await axios.delete(`/api/schemes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSchemes();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleEdit = (scheme) => {
        setFormData({ name: scheme.name, type: scheme.type, max_budget: scheme.max_budget });
        setEditId(scheme.id);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Schemes</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', type: 'research', max_budget: '' });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Budget</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {schemes.map((scheme) => (
                            <tr key={scheme.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scheme.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{scheme.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(scheme.max_budget)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(scheme)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(scheme.id)} className="text-red-600 hover:text-red-900">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Scheme' : 'New Scheme'}</h2>
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
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                >
                                    <option value="research">Research</option>
                                    <option value="abmas">Abmas</option>
                                    <option value="kkn">KKN</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700">Max Budget</label>
                                <input
                                    type="number"
                                    value={formData.max_budget}
                                    onChange={(e) => setFormData({ ...formData, max_budget: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
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
        </div>
    );
}
