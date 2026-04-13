import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { FileText, ClipboardList, Clock, CheckCircle2, Search, ArrowRight, User } from 'lucide-react';
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

    const getStatusIndicator = (status) => {
        if (status === 'accepted' || status === 'rejected') return <CheckCircle2 size={16} className="text-green-500" />;
        return <Clock size={16} className="text-yellow-500" />;
    };

    const filteredProposals = proposals.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <ClipboardList className="mr-3 text-green-700" size={32} />
                    Panel Penilaian Reviewer
                </h1>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari usulan..."
                        className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 rounded-sm focus:ring-green-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Daftar Penugasan Review</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {isLoading ? (
                        <div className="p-10 text-center text-sm text-gray-400">Memuat data penugasan...</div>
                    ) : filteredProposals.length === 0 ? (
                        <div className="p-10 text-center text-sm text-gray-400">Tidak ada usulan yang ditugaskan kepada Anda saat ini.</div>
                    ) : filteredProposals.map((p) => (
                        <div key={p.id} className="p-4 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center md:justify-between group">
                            <div className="flex items-start">
                                <div className="p-3 bg-green-50 rounded-sm text-green-700 mr-4 group-hover:bg-green-700 group-hover:text-white transition-all">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{p.title}</h3>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight flex items-center">
                                            <User size={12} className="mr-1" /> {p.user.name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium">#{p.id} • {p.scheme?.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center space-x-6">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center space-x-1 text-[10px] font-bold uppercase text-gray-500 mb-1">
                                        {getStatusIndicator(p.status)}
                                        <span>Status</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-800 uppercase">{p.status}</span>
                                </div>
                                <Link 
                                    to={`/reviewer/proposals/${p.id}`}
                                    className="px-4 py-2 bg-green-700 text-white rounded-sm text-xs font-bold flex items-center shadow-lg hover:bg-green-800 transition-all"
                                >
                                    Berikan Penilaian <ArrowRight size={14} className="ml-2" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-sm flex items-start">
                <div className="p-1 bg-blue-100 rounded-full mr-3 text-blue-700"><ClipboardList size={20} /></div>
                <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-bold mb-1">Pemberitahuan:</p>
                    <p>Harap menyelesaikan penilaian sesuai dengan batas waktu yang telah ditentukan oleh LPPM. Penilaian Anda bersifat rahasia dan akan menjadi dasar utama pengambilan keputusan hibah.</p>
                </div>
            </div>
        </div>
    );
}
