import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { FileText, Star, Save, ArrowLeft, Info, CheckCircle, ExternalLink, Users, Target, Rocket } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReviewerPkmShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [scores, setScores] = useState({});
    const [globalScore, setGlobalScore] = useState(0);
    const [comment, setComment] = useState('');
    const [decision, setDecision] = useState('accepted');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/reviewer_pkm/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            
            setGlobalScore(res.data.review?.score || 0);
            setComment(res.data.review?.comment || '');
            setDecision(res.data.review?.decision !== 'pending' ? (res.data.review?.decision || 'accepted') : 'accepted');

            // Initialize scores if criteria exists
            if (res.data.criteria && res.data.criteria.length > 0) {
                const initialScores = {};
                res.data.criteria.forEach(c => initialScores[c.id] = 7);
                setScores(initialScores);
            }
        } catch (err) {
            toast.error("Gagal memuat detail usulan PKM.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleScoreChange = (criteriaId, value) => {
        const newScores = { ...scores, [criteriaId]: parseInt(value) };
        setScores(newScores);
        
        // Calculate average for global score if using criteria
        if (data.criteria && data.criteria.length > 0) {
            let total = 0;
            data.criteria.forEach(c => {
                total += (newScores[c.id] || 0) * (c.weight / 100);
            });
            setGlobalScore(Math.round(total * 10) / 10);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await axios.post(`/api/reviewer_pkm/${id}/review`, {
                score: globalScore,
                comment,
                decision,
                scores // In case we want to support details later
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Penilaian PKM berhasil disimpan!");
            navigate('/reviewer/pkm');
        } catch (err) {
            toast.error("Gagal menyimpan penilaian.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-20 text-center text-gray-400">Memuat data review PKM...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/reviewer/pkm')}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-green-700 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar Penugasan
                </button>
                <div className="flex space-x-3">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center shadow-sm">
                        <Star size={12} className="mr-1 text-yellow-500" /> Skor: {globalScore}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${decision === 'accepted' ? 'bg-green-100 text-green-700' : decision === 'revision' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        Rekomendasi: {decision}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Proposal Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Rocket size={100} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center uppercase tracking-tighter border-b pb-2">
                            <FileText size={20} className="mr-2 text-green-700" /> Profil Usulan PKM
                        </h2>
                        <div className="space-y-5 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Judul PKM</p>
                                <p className="text-sm font-bold text-gray-800 leading-snug">{data.proposal.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ketua Pengusul</p>
                                    <p className="text-xs font-bold text-gray-700">{data.proposal.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tahun Usulan</p>
                                    <p className="text-xs font-bold text-gray-700">{data.proposal.fiscal_year?.year}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kategori PKM</p>
                                <p className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 inline-block rounded-sm">{data.proposal.category || 'Program Kreativitas Mahasiswa'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center uppercase tracking-tighter">
                            <Users size={20} className="mr-2 text-green-700" /> Tim & Personalia
                        </h2>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-sm border border-gray-100">
                                <p className="text-[9px] font-black text-green-700 uppercase mb-1">Dosen Pendamping</p>
                                <p className="text-xs font-bold text-gray-800">{data.proposal.user.name}</p>
                                <p className="text-[9px] text-gray-400">NIDN: {data.proposal.user.nidn || '-'}</p>
                            </div>
                            {/* Assuming partners exists in PKM */}
                            {data.proposal.partners?.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Mitra Kerjasama</p>
                                    {data.proposal.partners.map((m, i) => (
                                        <div key={i} className="text-xs text-gray-700 flex items-center gap-2 mb-1">
                                            <div className="w-1 h-1 bg-green-500 rounded-full" /> {m.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
                         <div className="flex items-center text-indigo-800 mb-2">
                            <Target size={16} className="mr-2" />
                            <span className="text-xs font-bold uppercase">Dokumen Substansi</span>
                         </div>
                         <div className="space-y-2">
                             <a 
                                href={data.proposal.substansi ? `/storage/${data.proposal.substansi}` : "#"} 
                                target="_blank"
                                className="w-full py-2 bg-white text-indigo-600 border border-indigo-100 rounded-sm text-[10px] font-bold flex items-center justify-center hover:bg-indigo-50 transition-all shadow-sm"
                             >
                                <ExternalLink size={12} className="mr-2" /> Lihat Proposal PKM
                             </a>
                         </div>
                    </div>
                </div>

                {/* Review Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 border-l-4 border-green-700 pl-4 uppercase tracking-tight flex items-center justify-between">
                            Form Penilaian Kelayakan
                            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-400 font-normal">PKM-TYPE-A</span>
                        </h2>
                        
                        <div className="space-y-6">
                            {data.criteria && data.criteria.length > 0 ? (
                                data.criteria.map((c, idx) => (
                                    <div key={c.id} className="p-5 bg-white rounded-sm border border-gray-100 hover:border-green-200 transition-all shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 mr-4">
                                                <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{idx+1}. {c.criteria_name}</h4>
                                                <p className="text-[10px] text-gray-500 leading-normal">{c.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Bobot: {c.weight}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="flex-1 flex items-center space-x-4">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">1</span>
                                                <input 
                                                    type="range" 
                                                    min="1" 
                                                    max="10" 
                                                    step="1"
                                                    className="flex-1 accent-green-700 h-1.5 bg-gray-200 rounded-lg cursor-pointer hover:accent-green-600"
                                                    value={scores[c.id] || 0}
                                                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                                                />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">10</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-sm border-2 border-green-700 flex items-center justify-center font-black text-green-700 bg-white text-base">
                                                {scores[c.id] || 0}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 bg-gray-50 rounded-sm border border-dashed border-gray-300 text-center">
                                    <p className="text-xs font-bold text-gray-500 mb-4 uppercase">Penilaian Global (Tanpa Kriteria Digital)</p>
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="w-24 text-center text-3xl font-black text-green-700 border-2 border-green-700 rounded-sm p-2 focus:ring-0"
                                            value={globalScore}
                                            onChange={(e) => setGlobalScore(e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-400">Masukkan nilai akhir (0-100)</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 pt-10 border-t border-gray-100 space-y-8">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-tighter">Justifikasi & Catatan Reviewer</label>
                                    <textarea 
                                        className="w-full text-sm border-gray-200 rounded-sm p-4 focus:ring-2 focus:ring-green-500 focus:outline-none min-h-[180px] bg-gray-50/50"
                                        placeholder="Berikan alasan logis untuk pemberian nilai tersebut serta saran pengembangan untuk tim pengusul PKM..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">Keputusan Akhir</label>
                                        <select 
                                            className="w-full text-sm border-gray-200 rounded-sm p-3 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-bold text-gray-800"
                                            value={decision}
                                            onChange={(e) => setDecision(e.target.value)}
                                        >
                                            <option value="accepted">DISETUJUI / LOLOS PENDANAAN</option>
                                            <option value="revision">REVISI (PERLU PERBAIKAN)</option>
                                            <option value="rejected">TIDAK LOLOS / DITOLAK</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                    <div className="hidden md:flex space-x-6 text-[11px] font-bold text-gray-400 uppercase italic">
                        <span className="flex items-center"><CheckCircle size={14} className="mr-1 text-green-600" /> Form Valid</span>
                        <span>|</span>
                        <span>PKM Evaluator v1.0</span>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button 
                            disabled={isSaving}
                            onClick={handleSubmit}
                            className="w-full md:w-auto px-12 py-3 bg-green-700 text-white rounded-sm font-black text-sm shadow-xl hover:bg-green-800 transition-all flex items-center justify-center transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" /> {isSaving ? 'Menyimpan...' : 'KIRIM EVALUASI PKM'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
