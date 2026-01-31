import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { Users, Plus, Edit, Trash2, Upload } from 'lucide-react';

export default function OrganizationIndex() {
    const { token } = useAuthStore();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ name: '', position: '', order_index: 0 });
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

    useEffect(() => {
        fetchMembers();
    }, [token]);

    const handleAddClick = () => {
        setFormData({ name: '', position: '', order_index: members.length + 1 });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (member) => {
        setFormData({ name: member.name, position: member.position, order_index: member.order_index });
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

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading structure...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((member) => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.order_index}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(member)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteClick(member.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
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
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Anggota' : 'Tambah Anggota'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={formData.position}
                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700">Urutan Tampilan</label>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({...formData, order_index: e.target.value})}
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
