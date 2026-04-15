import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle, FileText, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

export default function MemberConsentList({ onUpdate }) {
    const { token } = useAuth();
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('consent_id');

    useEffect(() => {
        fetchConsents();
    }, [token]);

    const fetchConsents = async () => {
        try {
            const response = await axios.get('/api/member-consents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConsents(response.data);
        } catch (error) {
            console.error("Failed to fetch member consents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`/api/member-consents/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Persetujuan anggota berhasil dikirim!");
            setConsents(consents.filter(c => c.id !== id));
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Gagal menyetujui permintaan.");
        }
    };

    if (loading) return null;
    if (consents.length === 0) return null;

    return (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center space-x-2 text-amber-600 mb-2">
                <AlertCircle size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest">Undangan Anggota Usulan ({consents.length})</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consents.map((consent) => {
                    const isHighlighted = highlightId && parseInt(highlightId) === consent.id;
                    return (
                        <div 
                            key={consent.id}
                            id={`consent-${consent.id}`}
                            className={`bg-white p-5 border-l-4 rounded-sm shadow-sm transition-all ${
                                isHighlighted 
                                ? 'border-amber-500 ring-2 ring-amber-100 shadow-amber-100 scale-[1.02] z-10' 
                                : 'border-amber-400'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-sm border border-amber-100">
                                    <FileText size={12} className="mr-1" />
                                    {consent.proposal?.scheme?.name || 'Skema Tidak Diketahui'}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">TA {consent.proposal?.fiscal_year?.year || '-'}</span>
                            </div>
                            
                            <h3 className="font-bold text-gray-800 text-sm mb-4 leading-relaxed">
                                {consent.proposal?.title}
                            </h3>
                            
                            <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-sm">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 text-gray-400">
                                    <User size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Ketua Pengusul</p>
                                    <p className="text-xs font-bold text-gray-700 truncate">{consent.proposal?.user?.name}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Peran Anda</p>
                                    <p className="text-xs font-black text-green-700 uppercase">{consent.role}</p>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => handleApprove(consent.id)}
                                    className="flex-1 bg-green-700 text-white py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-green-800 transition-all flex items-center justify-center shadow-md shadow-green-100 hover:shadow-none active:scale-95"
                                >
                                    <CheckCircle size={14} className="mr-2" /> Setujui Keanggotaan
                                </button>
                                <button 
                                    className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                    onClick={() => toast.info("Silakan hubungi ketua pengusul untuk pembatalan.")}
                                >
                                    Tolak
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
