import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, Plus, Search, FileText, Globe, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

export default function PageIndex() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/pages');
            setPages(response.data);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
            toast.error('Gagal mengambil data halaman');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus halaman ini?')) return;

        try {
            await api.delete(`/admin/pages/${id}`);
            setPages(pages.filter(page => page.id !== id));
            toast.success('Halaman berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete page:', error);
            toast.error('Gagal menghapus halaman');
        }
    };

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Halaman Statis</h1>
                    <p className="text-gray-600">Kelola konten halaman statis seperti Visi Misi, Kontak, dll.</p>
                </div>
                <Link to="/admin/pages/create" className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-800 transition-colors">
                    <Plus size={20} className="mr-2" />
                    Tambah Halaman
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <Search size={20} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Cari halaman..."
                        className="bg-transparent outline-none w-full text-gray-600 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuat data...</div>
                ) : filteredPages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Belum ada halaman.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                                <tr>
                                    <th className="px-6 py-3">Judul</th>
                                    <th className="px-6 py-3">Slug (URL)</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Terakhir Diupdate</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{page.title}</div>
                                            <div className="text-xs text-gray-500">{page.content?.hero_title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a href={`/pages/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center">
                                                {page.slug}
                                                <Globe size={12} className="ml-1" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            {page.is_published ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Globe size={12} className="mr-1" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <EyeOff size={12} className="mr-1" /> Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(page.updated_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link to={`/admin/pages/${page.id}/edit`} className="text-blue-600 hover:text-blue-800 inline-block" title="Edit">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-800 inline-block" title="Hapus">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
