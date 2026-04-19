import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { FileText, Users, Search, Filter, ShieldCheck, Clock, UserPlus, Info, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import FullProposalPreviewModal from '../../../components/pdf/FullProposalPreviewModal';

export default function AdminPkmDashboard() {
    const { token } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetchData();
        fetchReviewers();
        fetchStats();
    }, [filterStatus]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/admin_pkm?status=${filterStatus}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(res.data);
        } catch (err) {
            toast.error("Gagal memuat data PKM.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviewers = async () => {
        try {
            const res = await axios.get('/api/admin_pkm/reviewers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviewers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/admin_pkm/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async (reviewerId) => {
        setIsAssigning(true);
        try {
            await axios.post(`/api/admin_pkm/${selectedProposal.id}/assign`, {
                reviewer_id: reviewerId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Reviewer PKM berhasil ditugaskan!");
            setSelectedProposal(null);
            fetchData();
        } catch (err) {
            toast.error("Gagal menugaskan reviewer.");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleBatchAssign = async () => {
        if (!confirm('Plot semua usulan PKM baru secara otomatis ke reviewer tersedia?')) return;
        setIsLoading(true);
        try {
            const res = await axios.post('/api/admin_pkm/batch-assign', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(res.data.message);
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal memplot otomatis.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            submitted: 'bg-blue-100 text-blue-700',
            review: 'bg-yellow-100 text-yellow-700',
            accepted: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const filteredProposals = proposals.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openPreview = (proposal) => {
        setSelectedProposal(proposal);
        setIsPreviewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <ShieldCheck className="mr-3 text-green-700" size={32} />
                        Monitoring Proposal PKM
                    </h1>
                    <button 
                        onClick={handleBatchAssign}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-700 text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-all shadow-md disabled:opacity-50"
                    >
                        ⚡ Plot Otomatis
                    </button>
                </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">PKM Baru</p>
                    <p className="text-2xl font-black text-blue-600">{stats?.total_submitted || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Review</p>
                    <p className="text-2xl font-black text-yellow-600">{stats?.total_review || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Diterima</p>
                    <p className="text-2xl font-black text-green-600">{stats?.total_accepted || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Skema</p>
                    <p className="text-2xl font-black text-gray-800">{stats?.per_scheme?.length || 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row space-y-3 md:space-y-0 md:justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari judul atau pengusul..."
                            className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 rounded-sm focus:ring-green-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <select 
                            className="text-sm border-gray-200 rounded-sm py-2 px-3 focus:ring-green-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="submitted">Submitted</option>
                            <option value="review">Review</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button className="p-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Usulan PKM</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Ketua</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Reviewer</th>
                                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Memuat data...</td></tr>
                            ) : filteredProposals.length === 0 ? (
                                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Tidak ada usulan PKM.</td></tr>
                            ) : filteredProposals.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{p.scheme_group} — {p.fiscal_year?.year}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 font-medium">{p.user?.name || 'Unknown'}</p>
                                        <p className="text-[10px] text-gray-400">{p.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.pkm_reviews && p.pkm_reviews.length > 0 ? (
                                            <div className="flex items-center text-xs text-green-700 font-medium">
                                                <Users size={14} className="mr-1" />
                                                {p.pkm_reviews[0].reviewer?.name}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 font-bold uppercase italic flex items-center">
                                                <Clock size={12} className="mr-1" /> Belum Diplot
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(p.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                                        <button 
                                            onClick={() => openPreview(p)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                                            title="Pratinjau PDF"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setSelectedProposal(p)}
                                            className="p-2 text-green-700 hover:bg-green-50 rounded-sm transition-all"
                                            title="Plot Reviewer"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {selectedProposal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border-t-4 border-green-700">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Plot Reviewer PKM</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase line-clamp-1">{selectedProposal.title}</p>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-widest text-center underline">Daftar Reviewer Aktif</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {reviewers.map(r => (
                                        <div 
                                            key={r.id}
                                            onClick={() => handleAssign(r.id)}
                                            className="p-3 border border-gray-100 rounded-sm hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all flex items-center group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-100 group-hover:text-green-700 mr-3">
                                                <Users size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                                                <p className="text-[10px] text-gray-500">{r.email}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus size={16} className="text-green-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 italic font-medium">* Pilih reviewer untuk menugaskan.</span>
                            <button 
                                onClick={() => setSelectedProposal(null)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FullProposalPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                proposalId={selectedProposal?.id}
                type="pkm"
            />
        </div>
    );
}
