import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { Shield, Plus, Edit, Trash2, CheckSquare, Square } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function RolesIndex() {
    const { token } = useAuthStore();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);
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

    const fetchPermissions = async () => {
        try {
            const response = await axios.get('/api/permissions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissions(response.data);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, [token]);

    // Group permissions by resource for the Matrix
    const permissionGroups = React.useMemo(() => {
        const groups = {};
        permissions.forEach(p => {
            const parts = p.name.split('.');
            const resource = parts[0]; 
            const action = parts.slice(1).join('.'); // Handle multi-part actions like 'view-status'
            
            if (!groups[resource]) {
                groups[resource] = [];
            }
            groups[resource].push({ id: p.id, name: p.name, action: action });
        });
        return groups;
    }, [permissions]);

    const handleAddClick = () => {
        setName('');
        setSelectedPermissions([]);
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (role) => {
        setName(role.name);
        setSelectedPermissions(role.permissions.map(p => p.name));
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

    const togglePermission = (permissionName) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionName)) {
                return prev.filter(p => p !== permissionName);
            } else {
                return [...prev, permissionName];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { name, permissions: selectedPermissions };
            
            if (isEditing) {
                await axios.put(`/api/roles/${selectedId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/roles', payload, {
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

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama Role',
            cell: ({ row }) => <span className="font-medium text-gray-900 capitalize">{row.original.name}</span>
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard',
            cell: ({ row }) => <span className="text-gray-500 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{row.original.guard_name}</span>
        },
        {
            id: 'permissions_count',
            header: 'Hak Akses',
            cell: ({ row }) => <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">{row.original.permissions?.length || 0} Permissions</span>
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const isSystemRole = ['admin', 'dosen', 'reviewer', 'mahasiswa'].includes(row.original.name);
                return (
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(row.original)} className="text-blue-600 hover:text-blue-900" title="Manage Permissions">
                            <Shield size={16} />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(row.original.id, row.original.name)} 
                            className={`text-red-600 hover:text-red-900 ${isSystemRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSystemRole}
                            title={isSystemRole ? "System Role cannot be deleted" : "Delete"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            }
        }
    ], []);

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

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={roles} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari role...',
                        emptyMessage: 'Tidak ada data role'
                    }} 
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Role & Permissions' : 'Tambah Role Baru'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                            {/* Scrollable Content */}
                            <div className="flex-grow overflow-y-auto p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700">Nama Role</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. staff_keuangan"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isEditing && ['admin', 'dosen', 'mahasiswa', 'reviewer'].includes(name)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Gunakan huruf kecil, tanpa spasi.</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <CheckSquare size={18} className="mr-2 text-green-600"/> Permission Matrix
                                </h3>

                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Module</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">View</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Create</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Edit</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Delete</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lainnya</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(permissionGroups).map(([resource, perms]) => {
                                                // Helper to find specific action permission
                                                const findPerm = (action) => perms.find(p => p.action === action);
                                                
                                                // Standard actions
                                                const viewPerm = findPerm('view');
                                                const createPerm = findPerm('create');
                                                const editPerm = findPerm('edit');
                                                const deletePerm = findPerm('delete');

                                                // Other actions (exclude standard ones)
                                                const otherPerms = perms.filter(p => !['view', 'create', 'edit', 'delete'].includes(p.action));

                                                const renderCheckbox = (perm) => {
                                                    if (!perm) return <span className="text-gray-300">-</span>;
                                                    const isChecked = selectedPermissions.includes(perm.name);
                                                    return (
                                                        <div 
                                                            onClick={() => togglePermission(perm.name)}
                                                            className={`w-5 h-5 mx-auto rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                                                isChecked ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-green-500'
                                                            }`}
                                                            title={perm.name}
                                                        >
                                                            {isChecked && <CheckSquare size={14} />}
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <tr key={resource} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                            {resource.replace(/_/g, ' ')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {renderCheckbox(viewPerm)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {renderCheckbox(createPerm)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {renderCheckbox(editPerm)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {renderCheckbox(deletePerm)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            <div className="flex flex-wrap gap-2">
                                                                {otherPerms.map(p => {
                                                                    const isChecked = selectedPermissions.includes(p.name);
                                                                    return (
                                                                        <span 
                                                                            key={p.id} 
                                                                            onClick={() => togglePermission(p.name)}
                                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                                                                                isChecked 
                                                                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                                                                    : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                                                                            }`}
                                                                        >
                                                                            {p.action}
                                                                        </span>
                                                                    )
                                                                })}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3">
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
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 shadow-sm"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
