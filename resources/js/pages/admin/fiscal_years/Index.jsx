import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function FiscalYearsIndex() {
    const { token } = useAuthStore();
    const [years, setYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ year: '', is_active: false });
    const [editId, setEditId] = useState(null);

    const fetchYears = async () => {
        try {
            const response = await axios.get('/api/fiscal-years', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setYears(response.data);
        } catch (error) {
            console.error("Failed to fetch fiscal years", error);
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/api/fiscal-years/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/fiscal-years', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchYears();
            setFormData({ year: '', is_active: false });
            setEditId(null);
        } catch (error) {
            console.error("Failed to save fiscal year", error);
            alert("Error saving data. Year must be unique.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this fiscal year?")) return;
        try {
            await axios.delete(`/api/fiscal-years/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchYears();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleEdit = (year) => {
        setFormData({ year: year.year, is_active: year.is_active });
        setEditId(year.id);
        setShowModal(true);
    };

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'year',
            header: 'Year',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.year}</span>
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                row.original.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                    </span>
                ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                    </span>
                )
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
                <h1 className="text-2xl font-bold text-gray-900">Manage Fiscal Years</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ year: '', is_active: false });
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={years} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Search years...',
                        emptyMessage: 'No fiscal years found'
                    }} 
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Fiscal Year' : 'New Fiscal Year'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Year</label>
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500 mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Set as Active Year</span>
                                </label>
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
