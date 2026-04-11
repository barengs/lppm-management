import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Star, Save, ArrowLeft, Info, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProposalReviewForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [scores, setScores] = useState({});
    const [comment, setComment] = useState('');
    const [decision, setDecision] = useState('accepted');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/reviewer_proposals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            
            // Initialize scores from existing review if any
            if (res.data.review?.details) {
                const initialScores = {};
                res.data.review.details.forEach(d => {
                    initialScores[d.criteria_id] = d.score;
                });
                setScores(initialScores);
                setComment(res.data.review.comment || '');
                setDecision(res.data.review.decision !== 'pending' ? res.data.review.decision : 'accepted');
            } else {
                // Default scores
                const initialScores = {};
                res.data.criteria.forEach(c => initialScores[c.id] = 7); // Default score 7/10
                setScores(initialScores);
            }
        } catch (err) {
            toast.error("Gagal memuat detail usulan.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleScoreChange = (criteriaId, value) => {
        setScores({ ...scores, [criteriaId]: parseInt(value) });
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await axios.post(`/api/reviewer_proposals/${id}/review`, {
                scores,
                comment,
                decision
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Penilaian berhasil disimpan!");
            navigate('/reviewer/dashboard');
        } catch (err) {
            toast.error("Gagal menyimpan penilaian.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-20 text-center text-gray-400">Memuat data review...</div>;

    const calculateTotal = () => {
        let total = 0;
        data.criteria.forEach(c => {
            total += (scores[c.id] || 0) * (c.weight / 100);
        });
        return total.toFixed(2);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/reviewer/dashboard')}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-green-700 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Kembali ke Dashboard
                </button>
                <div className="flex space-x-3">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <Star size={12} className="mr-1" /> Skor Akhir: {calculateTotal()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${decision === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Rekomendasi: {decision}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Proposal Sidebar / Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center uppercase tracking-tighter">
                            <FileText size={20} className="mr-2 text-green-700" /> Profil Usulan
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Judul</p>
                                <p className="text-xs font-bold text-gray-800 leading-relaxed">{data.proposal.title}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Pengusul</p>
                                <p className="text-xs font-medium text-gray-700">{data.proposal.user.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Skema</p>
                                <p className="text-xs font-medium text-gray-700">{data.proposal.scheme.name}</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                             <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3 text-center">Tautan Substansi</h3>
                             <div className="grid grid-cols-1 gap-2">
                                <button className="w-full py-2 bg-gray-50 text-gray-600 rounded-sm text-[10px] font-bold flex items-center justify-center hover:bg-gray-100">
                                    <ExternalLink size={12} className="mr-2" /> Lihat Full Proposal
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                         <div className="flex items-center text-blue-800 mb-2">
                            <Info size={16} className="mr-2" />
                            <span className="text-xs font-bold uppercase">Panduan Penilaian</span>
                         </div>
                         <p className="text-[10px] text-blue-700 leading-relaxed">
                            Berikan skor 1-10 untuk masing-masing kriteria sesuai dengan kualitas substansi yang diajukan. Gunakan kolom komentar untuk memberikan masukan konstruktif bagi pengusul.
                         </p>
                    </div>
                </div>

                {/* Review Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 border-l-4 border-green-700 pl-4 uppercase">Evaluasi Substansi</h2>
                        
                        <div className="space-y-8">
                            {data.criteria.map((c, idx) => (
                                <div key={c.id} className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 mr-4">
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">{idx+1}. {c.criteria_name}</h4>
                                            <p className="text-[10px] text-gray-500 leading-normal">{c.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Bobot: {c.weight}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="10" 
                                            step="1"
                                            className="flex-1 accent-green-700 h-2 bg-gray-200 rounded-lg cursor-pointer"
                                            value={scores[c.id] || 0}
                                            onChange={(e) => handleScoreChange(c.id, e.target.value)}
                                        />
                                        <div className="w-12 h-12 rounded-full border-2 border-green-700 flex items-center justify-center font-black text-green-700 bg-white shadow-inner text-lg">
                                            {scores[c.id] || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Komentar & Saran Perbaikan</label>
                                <textarea 
                                    className="w-full text-sm border-gray-200 rounded-sm p-4 focus:ring-green-500 min-h-[150px]"
                                    placeholder="Tuliskan alasan penilaian dan masukan untuk pengusul..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Rekomendasi Akhir</label>
                                    <select 
                                        className="w-full text-sm border-gray-200 rounded-sm p-3 focus:ring-green-500"
                                        value={decision}
                                        onChange={(e) => setDecision(e.target.value)}
                                    >
                                        <option value="accepted">DISETUJUI / LAYAK</option>
                                        <option value="revision">REVISI</option>
                                        <option value="rejected">TIDAK LAYAK / DITOLAK</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Floating bar for Save */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                    <div className="flex space-x-6 text-[11px] font-bold text-gray-400 uppercase italic">
                        <span className="flex items-center"><CheckCircle size={14} className="mr-1 text-green-600" /> Semua kriteria terisi</span>
                        <span>|</span>
                        <span>Draft Tersimpan {new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            disabled={isSaving}
                            onClick={handleSubmit}
                            className="px-10 py-3 bg-green-700 text-white rounded-sm font-black text-sm shadow-xl hover:bg-green-800 transition-all flex items-center transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" /> {isSaving ? 'Menyimpan...' : 'SIMPAN PENILAIAN SEKARANG'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
