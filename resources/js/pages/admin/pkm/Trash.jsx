import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Trash2, RefreshCcw, ArrowLeft, FileX, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminPkmTrash() {
    const navigate = useNavigate();
    const { token, hasPermission } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch if has permission
        if (hasPermission && !hasPermission('manage_pkm_trash')) {
            toast.error("Anda tidak memiliki akses ke halaman ini.");
            navigate('/admin/pkm');
            return;
        }

        fetchTrash();
    }, [token, hasPermission, navigate]);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin_pkm/trash', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(res.data);
        } catch (error) {
            toast.error("Gagal memuat data sampah PKM.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin mengembalikan proposal PKM ini?")) return;
        try {
            await axios.post(`/api/admin_pkm/${id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Proposal berhasil dikembalikan.");
            fetchTrash();
        } catch (error) {
            toast.error("Gagal mengembalikan proposal.");
        }
    };

    const handleForceDelete = async (id) => {
        if (!window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus permanen proposal PKM ini? Data tidak dapat dikembalikan!")) return;
        try {
            await axios.delete(`/api/admin_pkm/${id}/force-delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Proposal berhasil dihapus permanen.");
            fetchTrash();
        } catch (error) {
            toast.error("Gagal menghapus permanen proposal.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow p-6 border-l-4 border-red-600 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link to="/admin/pkm" className="text-gray-400 hover:text-red-700 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Trash2 className="text-red-600" /> Sampah Proposal PKM
                        </h1>
                    </div>
                    <p className="text-gray-600 ml-8">Daftar usulan PKM yang telah dihapus (soft delete).</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-gray-400 bg-white shadow rounded-sm">
                    <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
                </div>
            ) : proposals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-sm border border-gray-100 shadow">
                    <FileX size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold text-gray-500">Tempat sampah kosong.</p>
                </div>
            ) : (
                <div className="bg-white rounded-sm shadow overflow-hidden">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-red-50 text-red-800 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 border-b border-red-100">ID</th>
                                <th className="px-6 py-4 border-b border-red-100">Judul PKM</th>
                                <th className="px-6 py-4 border-b border-red-100">Pengusul</th>
                                <th className="px-6 py-4 border-b border-red-100">Dihapus Pada</th>
                                <th className="px-6 py-4 border-b border-red-100 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {proposals.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-600">#{p.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 line-clamp-2">{p.title}</p>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest mt-1 inline-block">
                                            {p.scheme_group || 'PKM'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-700">{p.user?.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-gray-500">
                                            {new Date(p.deleted_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleRestore(p.id)}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-sm hover:bg-green-200 font-bold text-xs flex items-center transition-colors"
                                                title="Kembalikan Proposal"
                                            >
                                                <RefreshCcw size={14} className="mr-1" /> Restore
                                            </button>
                                            <button 
                                                onClick={() => handleForceDelete(p.id)}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-sm hover:bg-red-200 font-bold text-xs flex items-center transition-colors"
                                                title="Hapus Permanen"
                                            >
                                                <AlertTriangle size={14} className="mr-1" /> Hapus Permanen
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
