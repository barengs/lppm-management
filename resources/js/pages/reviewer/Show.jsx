import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
    FileText, Star, Save, ArrowLeft, Info, AlertCircle, CheckCircle, 
    ExternalLink, Users, BookOpen, Calendar, DollarSign, Target,
    ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

const SectionHeader = ({ icon: Icon, title, isOpen, onToggle }) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-4 border-b border-gray-100 pb-3 group text-left"
    >
        <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-tight text-center lg:text-left">
            <Icon className="mr-3 text-green-700" size={18} />
            {title}
        </h3>
        {isOpen ? (
            <ChevronUp size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
        ) : (
            <ChevronDown size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
        )}
    </button>
);

const ContentBlock = ({ label, html, borderColor = 'border-gray-200' }) => {
    if (!html) return null;
    return (
        <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <div
                className={`bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 ${borderColor}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
};

export default function ProposalReviewForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('draft'); // 'draft' or 'review'
    
    const [scores, setScores] = useState({});
    const [comment, setComment] = useState('');
    const [decision, setDecision] = useState('accepted');

    // Collapsible sections for proposal draft
    const [openSections, setOpenSections] = useState({
        identity: true,
        personnel: true,
        substance: true,
        schedule: true,
        budget: true,
        outputs: true,
    });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/reviewer_proposals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            
            if (res.data.review?.details && res.data.review.details.length > 0) {
                const initialScores = {};
                res.data.review.details.forEach(d => {
                    initialScores[d.criteria_id] = d.score;
                });
                setScores(initialScores);
                setComment(res.data.review.comment || '');
                setDecision(res.data.review.decision && res.data.review.decision !== 'pending' ? res.data.review.decision : 'accepted');
            } else if (res.data.criteria) {
                const initialScores = {};
                res.data.criteria.forEach(c => initialScores[c.id] = 7);
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

    const calculateTotal = () => {
        if (!data || !data.criteria) return 0;
        let total = 0;
        data.criteria.forEach(c => {
            total += (scores[c.id] || 0) * (c.weight / 100);
        });
        return total.toFixed(2);
    };

    if (isLoading) return <div className="p-20 text-center text-gray-400">Memuat data review...</div>;
    
    if (!data) return (
        <div className="p-20 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Gagal Memuat Data</h2>
            <p className="text-gray-500 mt-2">Terjadi kesalahan saat mengambil detail usulan dari server.</p>
            <button onClick={() => navigate('/reviewer/dashboard')} className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Kembali ke Dashboard
            </button>
        </div>
    );

    const proposal = data.proposal;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-24">
            {/* Header Sticky */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button onClick={() => navigate('/reviewer/dashboard')} className="flex items-center text-[10px] font-bold text-gray-400 hover:text-green-700 uppercase tracking-widest mb-3 transition-colors">
                            <ArrowLeft size={14} className="mr-1" /> Kembali ke Dashboard
                        </button>
                        <h1 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter">{proposal.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-sm">{proposal.scheme?.name}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pengusul: {proposal.user?.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skor Saat Ini</p>
                            <p className="text-2xl font-black text-green-700 tracking-tighter">{calculateTotal()}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-sm border ${decision === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : decision === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-0.5">Rekomendasi Reviewer</p>
                            <p className="text-[10px] font-bold uppercase">{decision === 'accepted' ? 'DISETUJUI' : decision === 'rejected' ? 'DITOLAK' : 'REVISI'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mt-6 mb-10 overflow-x-auto no-scrollbar">
                <div className="flex space-x-12 min-w-max">
                    <button 
                        onClick={() => setActiveTab('draft')}
                        className={`pb-5 px-1 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center relative group ${activeTab === 'draft' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
                    >
                        <FileText size={18} className={`mr-2.5 transition-transform ${activeTab === 'draft' ? 'scale-110' : 'group-hover:scale-110'}`} /> 
                        Draf Usulan
                        {activeTab === 'draft' && <span className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-green-700 shadow-[0_0_8px_rgba(21,128,61,0.5)]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('review')}
                        className={`pb-5 px-1 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center relative group ${activeTab === 'review' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
                    >
                        <Star size={18} className={`mr-2.5 transition-transform ${activeTab === 'review' ? 'scale-110' : 'group-hover:scale-110'}`} /> 
                        Berikan Penilaian
                        {activeTab === 'review' && <span className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-green-700 shadow-[0_0_8px_rgba(21,128,61,0.5)]" />}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'draft' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Summary and Team (Persistent feel) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                            <SectionHeader icon={Users} title="Tim Pengusul" isOpen={openSections.personnel} onToggle={() => toggleSection('personnel')} />
                            {openSections.personnel && (
                                <div className="space-y-4">
                                    {proposal.personnel?.map((p, idx) => (
                                        <div key={idx} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                                                {p.type === 'mahasiswa' ? p.student_name : p.user?.name}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded-sm">{p.role}</span>
                                                <span className="text-[9px] font-medium text-gray-500">
                                                    {p.type === 'mahasiswa' ? `NIM: ${p.student_nim || '-'}` : `NIDN: ${p.user?.dosen_profile?.nidn || p.nidn_nik || '-'}`}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-sm">
                            <div className="flex items-center text-blue-800 mb-2 font-bold uppercase text-[10px]">
                                <Info size={16} className="mr-2" /> Reviewer Note
                            </div>
                            <p className="text-[10px] text-blue-700 leading-relaxed italic">
                                Selesaikan membaca draf usulan di bawah ini sebelum pindah ke tab "Berikan Penilaian" untuk memasukkan skor Anda.
                            </p>
                        </div>
                    </div>

                    {/* Right: Full Draft Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Identitas */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <SectionHeader icon={FileText} title="Identitas Usulan" isOpen={openSections.identity} onToggle={() => toggleSection('identity')} />
                            {openSections.identity && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-xs">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Sinta Score (3 Thn)</p>
                                        <p className="text-gray-800 font-bold">{proposal.personnel?.find(p => p.role === 'ketua')?.sinta_score_3_years || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Status Peneliti</p>
                                        <p className="text-gray-800 font-bold uppercase tracking-tighter">Ketua Pengusul</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Bidang Fokus</p>
                                        <p className="text-gray-800 font-bold">{proposal.identity?.focus_area?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Lama Penelitian</p>
                                        <p className="text-gray-800 font-bold">{proposal.identity?.duration_years} Tahun</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">TKT Awal / Target</p>
                                        <p className="text-gray-800 font-bold">Level {proposal.identity?.tkt_initial} / Level {proposal.identity?.tkt_target}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Topik Riset</p>
                                        <p className="text-gray-800 font-bold">{proposal.identity?.research_topic?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Rumpun Ilmu</p>
                                        <p className="text-gray-800 font-bold">{proposal.identity?.science_cluster?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Tema Penelitian</p>
                                        <p className="text-gray-800 font-bold">{proposal.identity?.research_theme?.name || '-'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Substansi */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <SectionHeader icon={BookOpen} title="Substansi Usulan" isOpen={openSections.substance} onToggle={() => toggleSection('substance')} />
                            {openSections.substance && (
                                <div className="space-y-8 mt-4">
                                    <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 mb-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kata Kunci</p>
                                        <p className="text-xs font-bold text-green-700 italic bg-green-50 px-3 py-1 rounded-sm">{proposal.content?.keywords || '-'}</p>
                                    </div>
                                    <ContentBlock label="Abstrak" html={proposal.content?.abstract} borderColor="border-green-200" />
                                    <ContentBlock label="Latar Belakang" html={proposal.content?.background} borderColor="border-blue-200" />
                                    <ContentBlock label="Tujuan Penelitian" html={proposal.content?.objectives} borderColor="border-purple-200" />
                                    <ContentBlock label="Metodologi" html={proposal.content?.methodology} borderColor="border-orange-200" />
                                    <ContentBlock label="Daftar Pustaka" html={proposal.content?.references} borderColor="border-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* 3. Anggaran */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6 text-xs">
                            <SectionHeader icon={DollarSign} title="Rincian Anggaran" isOpen={openSections.budget} onToggle={() => toggleSection('budget')} />
                            {openSections.budget && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 tracking-widest">
                                            <tr>
                                                <th className="px-4 py-3">Item</th>
                                                <th className="px-4 py-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {proposal.budget_items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-gray-800 text-[11px]">{item.item_name}</p>
                                                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">{item.cost_group}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-gray-800 tracking-tighter">
                                                        Rp {item.total_cost?.toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-green-700 text-white font-black uppercase text-[10px]">
                                            <tr>
                                                <td className="px-4 py-3 tracking-widest">Total Anggaran yang Diajukan</td>
                                                <td className="px-4 py-3 text-right text-sm tracking-tighter">
                                                    Rp {proposal.budget_items?.reduce((sum, item) => sum + (item.total_cost || 0), 0).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* 4. Luaran */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <SectionHeader icon={Target} title="Luaran yang Dijanjikan" isOpen={openSections.outputs} onToggle={() => toggleSection('outputs')} />
                            {openSections.outputs && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {proposal.outputs?.map((o, idx) => (
                                        <div key={idx} className={`p-4 rounded-sm border ${o.category === 'mandatory' ? 'bg-green-50/30 border-green-100' : 'bg-blue-50/30 border-blue-100'}`}>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest ${o.category === 'mandatory' ? 'bg-green-700 text-white' : 'bg-blue-600 text-white'}`}>
                                                {o.category}
                                            </span>
                                            <p className="text-xs font-black text-gray-900 mt-3 leading-snug uppercase tracking-tight">{o.type}</p>
                                            <p className="text-[10px] text-gray-500 mt-2 italic leading-relaxed">{o.target_description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Tab: Review Form */
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-sm shadow-xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-green-700" />
                        
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Evaluasi Substansi</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Instrument Penilaian Reviewer</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 whitespace-nowrap">Status Penilaian</p>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse">In Progress</span>
                            </div>
                        </div>
                        
                        <div className="space-y-12">
                            {data.criteria.map((c, idx) => (
                                <div key={c.id} className="relative group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1 mr-8">
                                            <div className="flex items-center mb-2">
                                                <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold mr-3">{idx+1}</span>
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{c.criteria_name}</h4>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium pl-9 italic opacity-80">{c.description}</p>
                                        </div>
                                        <div className="text-right pt-1">
                                            <span className="text-[10px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-sm border border-green-100 whitespace-nowrap uppercase tracking-widest">Bobot: {c.weight}%</span>
                                        </div>
                                    </div>
                                    <div className="pl-9 flex items-center space-x-6">
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="10" 
                                            step="1"
                                            className="flex-1 accent-green-700 h-1.5 bg-gray-100 rounded-full cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-green-300"
                                            value={scores[c.id] || 0}
                                            onChange={(e) => handleScoreChange(c.id, e.target.value)}
                                        />
                                        <div className="w-14 h-14 rounded-full border-4 border-gray-50 flex flex-col items-center justify-center font-black text-green-700 bg-white shadow-xl transform transition-transform group-hover:scale-110">
                                            <span className="text-lg leading-none">{scores[c.id] || 0}</span>
                                            <span className="text-[7px] text-gray-400 uppercase leading-none mt-0.5">Score</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 pt-10 border-t border-gray-100 space-y-10">
                            <div>
                                <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                    <Info size={14} className="mr-2 text-green-700" /> Komentar & Saran Strategis
                                </label>
                                <textarea 
                                    className="w-full text-sm border-2 border-gray-50 bg-gray-50/50 rounded-sm p-6 focus:ring-0 focus:border-green-500 min-h-[180px] transition-all placeholder:italic placeholder:text-gray-300 font-medium"
                                    placeholder="Tuliskan alasan penilaian dan masukan kritis untuk pengusul..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Rekomendasi Akhir Usulan</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full appearance-none text-xs font-black text-gray-800 border-2 border-gray-50 bg-gray-50/50 rounded-sm p-4 pr-10 focus:ring-0 focus:border-green-500 uppercase tracking-widest transition-all cursor-pointer"
                                            value={decision}
                                            onChange={(e) => setDecision(e.target.value)}
                                        >
                                            <option value="accepted">DISETUJUI / LAYAK</option>
                                            <option value="revision">REVISI SUBSTANSI</option>
                                            <option value="rejected">TIDAK LAYAK / DITOLAK</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 grayscale opacity-70">Rata-rata Terbobot</p>
                                    <div className="text-4xl font-black text-green-700 tracking-tighter tabular-nums">{calculateTotal()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Floating bar for Save - Enhanced Visibility */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
                    <div className="flex items-center space-x-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-sm border border-green-100">
                            <CheckCircle size={14} className="mr-2" /> All Metrics Computed
                        </span>
                        <span className="hidden md:inline text-gray-200">|</span>
                        <div className="flex items-center">
                            <Clock size={14} className="mr-2 text-gray-300" /> Last Auto-sync: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button 
                            disabled={isSaving}
                            onClick={handleSubmit}
                            className="w-full md:w-auto px-12 py-3.5 bg-gray-900 text-white rounded-sm font-black text-xs tracking-[0.2em] shadow-2xl hover:bg-green-700 transition-all flex items-center justify-center transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase"
                        >
                            {isSaving ? (
                                <span className="animate-pulse">Memproses...</span>
                            ) : (
                                <>
                                    <Save size={18} className="mr-3" /> Simpan & Selesaikan Review
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

