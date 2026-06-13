import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Trash2, RefreshCcw, ArrowLeft, FileX, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminProposalTrash() {
    const navigate = useNavigate();
    const { token, hasPermission } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        // Only fetch if has permission
        if (hasPermission && !hasPermission('manage_proposal_trash')) {
            toast.error("Anda tidak memiliki akses ke halaman ini.");
            navigate('/admin/proposals');
            return;
        }

        fetchTrash();
    }, [token, navigate]);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin_proposals/trash', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(res.data);
        } catch (error) {
            toast.error("Gagal memuat data sampah proposal.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin mengembalikan proposal penelitian ini?")) return;
        try {
            await axios.post(`/api/admin_proposals/${id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Proposal berhasil dikembalikan.");
            fetchTrash();
        } catch (error) {
            toast.error("Gagal mengembalikan proposal.");
        }
    };

    const handleForceDelete = async (id) => {
        if (!window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus permanen proposal ini? Data tidak dapat dikembalikan!")) return;
        try {
            await axios.delete(`/api/admin_proposals/${id}/force-delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Proposal berhasil dihapus permanen.");
            fetchTrash();
        } catch (error) {
            toast.error("Gagal menghapus permanen proposal.");
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(proposals.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBatchForceDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus permanen ${selectedIds.length} proposal terpilih? Data tidak dapat dikembalikan!`)) return;
        try {
            await axios.post('/api/admin_proposals/batch-force-delete', { ids: selectedIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${selectedIds.length} proposal berhasil dihapus permanen.`);
            setSelectedIds([]);
            fetchTrash();
        } catch (error) {
            toast.error("Gagal menghapus permanen proposal terpilih.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow p-6 border-l-4 border-red-600 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link to="/admin/proposals" className="text-gray-400 hover:text-red-700 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Trash2 className="text-red-600" /> Sampah Proposal Penelitian
                        </h1>
                    </div>
                    <p className="text-gray-600 ml-8">Daftar usulan penelitian yang telah dihapus (soft delete).</p>
                </div>
                <div className="flex items-center">
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={handleBatchForceDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md flex items-center gap-2"
                        >
                            <AlertTriangle size={16} /> Hapus Terpilih ({selectedIds.length})
                        </button>
                    )}
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
                                <th className="px-6 py-4 border-b border-red-100 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded-sm border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        checked={proposals.length > 0 && selectedIds.length === proposals.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4 border-b border-red-100">ID</th>
                                <th className="px-6 py-4 border-b border-red-100">Judul Penelitian</th>
                                <th className="px-6 py-4 border-b border-red-100">Pengusul</th>
                                <th className="px-6 py-4 border-b border-red-100">Dihapus Pada</th>
                                <th className="px-6 py-4 border-b border-red-100 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {proposals.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="rounded-sm border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            checked={selectedIds.includes(p.id)}
                                            onChange={() => handleSelect(p.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-600">#{p.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 line-clamp-2">{p.title}</p>
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
