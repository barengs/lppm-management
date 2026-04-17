import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { FileText, ClipboardList, Search, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ReviewerProposalDashboard() {
    const { token } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/reviewer_proposals', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setProposals(res.data);
        } catch (err) {
            toast.error("Gagal memuat daftar usulan.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            submitted: { label: 'Menunggu Penilaian', cls: 'bg-blue-100 text-blue-700' },
            review:    { label: 'Sedang Dinilai',     cls: 'bg-yellow-100 text-yellow-700' },
            accepted:  { label: 'Diterima',           cls: 'bg-green-100 text-green-700' },
            rejected:  { label: 'Ditolak',            cls: 'bg-red-100 text-red-700' },
        };
        const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
        return <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${s.cls}`}>{s.label}</span>;
    };

    const filteredProposals = proposals.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-l-4 border-green-600">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="text-green-700" size={28} />
                        Daftar Usulan Penelitian
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Daftar usulan penelitian yang tersedia untuk Anda nilai.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari judul atau pengusul..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-sm p-4 flex items-start gap-3">
                <ClipboardList size={20} className="text-green-700 mt-0.5 shrink-0" />
                <div className="text-sm text-green-800 leading-relaxed">
                    <p className="font-bold mb-0.5">Sistem Penilaian Berbasis Peran:</p>
                    <p>
                        Sebagai Reviewer, Anda dapat mengakses semua usulan yang telah masuk ke tahap <span className="font-semibold text-green-700">Penilaian (Review)</span>. 
                        Silakan pilih usulan dari daftar di bawah untuk mulai memberikan penilaian.
                    </p>
                </div>
            </div>

            {/* Proposal List */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Usulan Siap Dinilai</p>
                    <span className="text-xs text-gray-400">{filteredProposals.length} tersedia</span>
                </div>

                <div className="divide-y divide-gray-100">
                    {isLoading ? (
                        <div className="p-12 text-center text-sm text-gray-400">
                            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
                            Memuat data penugasan...
                        </div>
                    ) : filteredProposals.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <ClipboardList size={40} className="mx-auto text-gray-300" />
                            <p className="font-semibold text-gray-500">Belum ada usulan yang tersedia</p>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                Saat ini tidak ada usulan baru yang menunggu penilaian dalam pool.
                            </p>
                        </div>
                    ) : filteredProposals.map((p) => (
                        <div key={p.id} className="p-5 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-50 rounded-sm text-green-700 shrink-0 group-hover:bg-green-700 group-hover:text-white transition-all">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{p.title}</h3>
                                    <div className="flex items-center flex-wrap gap-3 mt-1.5">
                                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                            <User size={11} /> {p.user.name}
                                        </p>
                                        <p className="text-[11px] text-gray-400">#{p.id} • {p.scheme?.name || 'PKM'}</p>
                                        {getStatusBadge(p.status)}
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Link 
                                    to={`/reviewer/proposals/${p.id}`}
                                    className="px-5 py-2 bg-green-700 text-white rounded-sm text-xs font-bold flex items-center gap-2 shadow hover:bg-green-800 transition-all"
                                >
                                    Berikan Penilaian <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
