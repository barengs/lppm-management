import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { Edit, Layout, Plus } from 'lucide-react';

export default function MenuIndex() {
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        api.get('/menus').then(res => setMenus(res.data));
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Menu</h1>
                <button className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-800 transition">
                    <Plus size={18} className="mr-2" /> Buat Menu Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map(menu => (
                    <div key={menu.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                                <Layout size={24} />
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full ${menu.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {menu.is_active ? 'Aktif' : 'Draft'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{menu.name}</h3>
                        <p className="text-gray-500 text-sm mb-6">Lokasi: <span className="font-mono bg-gray-100 px-1 rounded">{menu.location}</span></p>
                        
                        <Link 
                            to={`/admin/menus/${menu.id}`}
                            className="block w-full text-center bg-gray-50 text-gray-700 font-medium py-2 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition"
                        >
                            Atur Menu
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
