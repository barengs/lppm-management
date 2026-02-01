import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { Edit, Layout, Plus } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function MenuIndex() {
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        api.get('/menus').then(res => setMenus(res.data));
    }, []);

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama Menu',
            cell: ({ row }) => (
                <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 mr-3">
                        <Layout size={16} />
                    </div>
                    <span className="font-medium text-gray-900">{row.original.name}</span>
                </div>
            )
        },
        {
            accessorKey: 'location',
            header: 'Lokasi',
            cell: ({ row }) => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{row.original.location}</span>
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.original.is_active ? 'Aktif' : 'Draft'}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Link 
                        to={`/admin/menus/${row.original.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center text-sm font-medium"
                    >
                        <Edit size={16} className="mr-1" /> Atur Menu
                    </Link>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Menu</h1>
                <button className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-800 transition">
                    <Plus size={18} className="mr-2" /> Buat Menu Baru
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={menus} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari menu...',
                        emptyMessage: 'Tidak ada data menu'
                    }} 
                />
            </div>
        </div>
    );
}
