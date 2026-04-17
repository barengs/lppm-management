import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
    FileText, Star, Save, ArrowLeft, Info, CheckCircle, 
    ExternalLink, Users, Target, Rocket, DollarSign, 
    BookOpen, ChevronDown, ChevronUp, Clock, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const SectionHeader = ({ icon: Icon, title, isOpen, onToggle }) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-4 border-b border-gray-100 pb-3 group text-left"
    >
        <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-tight">
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

export default function ReviewerPkmShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('draft'); // 'draft' or 'review'
    
    const [scores, setScores] = useState({});
    const [globalScore, setGlobalScore] = useState(0);
    const [comment, setComment] = useState('');
    const [decision, setDecision] = useState('accepted');

    // Collapsible sections for PKM proposal draft
    const [openSections, setOpenSections] = useState({
        identity: true,
        personnel: true,
        partners: true,
        substance: true,
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
            const res = await axios.get(`/api/reviewer_pkm/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            
            setGlobalScore(res.data.review?.score || 0);
            setComment(res.data.review?.comment || '');
            setDecision(res.data.review?.decision !== 'pending' ? (res.data.review?.decision || 'accepted') : 'accepted');

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
                scores
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

    if (!data) return (
        <div className="p-20 text-center">
            <Rocket size={48} className="mx-auto text-red-500 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-gray-800">Gagal Memuat Data PKM</h2>
            <p className="text-gray-500 mt-2">Terjadi kesalahan saat mengambil detail usulan PKM dari server.</p>
            <button onClick={() => navigate('/reviewer/pkm')} className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Kembali ke Daftar
            </button>
        </div>
    );

    const proposal = data.proposal;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-24">
            {/* Header Sticky */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Rocket size={120} />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <button onClick={() => navigate('/reviewer/pkm')} className="flex items-center text-[10px] font-bold text-gray-400 hover:text-green-700 uppercase tracking-widest mb-3 transition-colors">
                            <ArrowLeft size={14} className="mr-1" /> Kembali ke Daftar Penugasan
                        </button>
                        <h1 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter max-w-2xl">{proposal.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-sm">PKM-{proposal.category || 'REGULER'}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ketua: {proposal.user?.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skor PKM</p>
                            <p className="text-2xl font-black text-green-700 tracking-tighter tabular-nums">{globalScore}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-sm border ${decision === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : decision === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-0.5">Status Kelayakan</p>
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
                        <BookOpen size={18} className={`mr-2.5 transition-transform ${activeTab === 'draft' ? 'scale-110' : 'group-hover:scale-110'}`} /> 
                        Draf Usulan PKM
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
                    {/* Left Sidebar: Team & Partners */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                            <SectionHeader icon={Info} title="Identitas Usulan" isOpen={openSections.identity} onToggle={() => toggleSection('identity')} />
                            {openSections.identity && (
                                <div className="space-y-4 text-xs">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 grayscale opacity-70">Bidang Fokus</p>
                                        <p className="text-gray-800 font-bold">{proposal.focus_area?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 grayscale opacity-70">Lama Kegiatan</p>
                                        <p className="text-gray-800 font-bold">{proposal.duration_years} Tahun</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 grayscale opacity-70">Tahun Usulan</p>
                                        <p className="text-gray-800 font-bold">{proposal.fiscal_year?.fiscal_year_name || '-'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                            <SectionHeader icon={Users} title="Tim Mahasiswa" isOpen={openSections.personnel} onToggle={() => toggleSection('personnel')} />
                            {openSections.personnel && (
                                <div className="space-y-4">
                                    <div className="pb-3 border-b border-dashed border-gray-100 mb-2">
                                        <p className="text-[8px] font-black text-green-700 uppercase mb-1">Dosen Pendamping</p>
                                        <p className="text-xs font-bold text-gray-800">{proposal.user?.name}</p>
                                        <p className="text-[9px] text-gray-400">NIDN: {proposal.user?.nidn || '-'}</p>
                                    </div>
                                    {proposal.personnel?.map((p, idx) => (
                                        <div key={idx} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">{p.student_name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded-sm">{p.role}</span>
                                                <span className="text-[9px] font-medium text-gray-500">NIM: {p.student_nim || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!proposal.personnel || proposal.personnel.length === 0) && (
                                        <p className="text-[10px] text-gray-400 italic">Belum ada anggota mahasiswa.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
                            <SectionHeader icon={ShieldCheck} title="Mitra Kerjasama" isOpen={openSections.partners} onToggle={() => toggleSection('partners')} />
                            {openSections.partners && (
                                <div className="space-y-4 text-xs font-medium text-gray-700">
                                    {proposal.partners?.length > 0 ? (
                                        proposal.partners.map((m, i) => (
                                            <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 rounded-sm">
                                                <div className="shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{m.name}</p>
                                                    <p className="text-[10px] text-gray-500 italic">{m.address || 'Alamat tidak tersedia'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic">Tidak ada mitra pengabdian/kerjasama.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Substance & Financials */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Substance Content */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <SectionHeader icon={FileText} title="Substansi PKM" isOpen={openSections.substance} onToggle={() => toggleSection('substance')} />
                            {openSections.substance && (
                                <div className="space-y-8 mt-4">
                                    {/* Proposal Summary / Substance Summary */}
                                    {(proposal.substance_summary || proposal.summary) && (
                                        <div className="mb-8">
                                            <ContentBlock 
                                                label="Ringkasan Substansi" 
                                                html={proposal.substance_summary || proposal.summary} 
                                                borderColor="border-green-700"
                                            />
                                            {proposal.keywords && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Keywords:</span>
                                                    {proposal.keywords.split(',').map((kw, i) => (
                                                        <span key={i} className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                            {kw.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {data.proposal.substance && (
                                        <div className="space-y-8">
                                            <div className="p-5 bg-green-50/30 border-l-4 border-green-700 rounded-sm">
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Indikator Asta Cita</p>
                                                <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-tighter leading-tight">{proposal.substance.asta_cita_indicator}</p>
                                                <p className="text-xs text-gray-600 leading-relaxed italic">{proposal.substance.asta_cita_description}</p>
                                            </div>

                                            {proposal.substance.sdg_goals && (
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">SDGs Goals</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {proposal.substance.sdg_goals.map((g, i) => (
                                                            <div key={i} className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
                                                                <p className="text-[10px] font-black text-gray-800 uppercase leading-snug mb-1">{g.goal}</p>
                                                                <p className="text-[9px] text-gray-500 leading-normal">{g.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {proposal.substance.strategic_fields && (
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">8 Bidang Strategis</p>
                                                    <div className="space-y-4">
                                                        {proposal.substance.strategic_fields.map((f, i) => (
                                                            <div key={i} className="bg-white p-4 border-l-4 border-gray-200 rounded-sm shadow-sm">
                                                                <p className="text-xs font-black text-gray-800 uppercase mb-2">{f.field}</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                                                    <div>
                                                                        <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Problem Statement</span>
                                                                        <p className="text-[10px] text-gray-600 leading-relaxed italic">{f.problem_statement}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Description</span>
                                                                        <p className="text-[10px] text-gray-600 leading-relaxed">{f.description}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!data.proposal.substance && !proposal.substance_summary && !proposal.summary && (
                                        <p className="text-[10px] text-gray-400 italic mt-4">Konten substansi belum diisi oleh pengusul.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. Budget */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6 text-xs">
                            <SectionHeader icon={DollarSign} title="Rincian Anggaran (RAB)" isOpen={openSections.budget} onToggle={() => toggleSection('budget')} />
                            {openSections.budget && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 tracking-widest">
                                            <tr>
                                                <th className="px-4 py-3">Deskripsi Item</th>
                                                <th className="px-4 py-3 text-center">Vol</th>
                                                <th className="px-4 py-3 text-right">Harga Satuan</th>
                                                <th className="px-4 py-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {proposal.budget_items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-gray-800 text-[11px]">{item.item_name}</p>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-tight">{item.cost_group} - {item.component}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600 font-bold">{item.volume} {item.unit}</td>
                                                    <td className="px-4 py-3 text-right text-gray-500">Rp {Number(item.unit_cost || 0).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 text-right font-black text-gray-800 tracking-tighter">
                                                        Rp {Number(item.total_cost || 0).toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!proposal.budget_items || proposal.budget_items.length === 0) && (
                                                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-300 italic">RAB belum disusun.</td></tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-900 text-white font-black uppercase text-[10px]">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 tracking-widest text-right">Total Anggaran PKM yang Diajukan</td>
                                                <td className="px-4 py-3 text-right text-sm tracking-tighter text-green-400">
                                                    Rp {proposal.budget_items?.reduce((sum, item) => sum + Number(item.total_cost || 0), 0).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* 3. Outputs */}
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                            <SectionHeader icon={Target} title="Luaran yang Dijanjikan" isOpen={openSections.outputs} onToggle={() => toggleSection('outputs')} />
                            {openSections.outputs && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {proposal.outputs?.length > 0 ? proposal.outputs.map((o, idx) => (
                                        <div key={idx} className="p-4 rounded-sm border bg-gray-50/50 border-gray-100 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-700 transform rotate-45 translate-x-12 -translate-y-12 opacity-5" />
                                            <p className="text-[9px] font-black text-green-700 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-sm inline-block mb-3">{o.output_group}</p>
                                            <p className="text-xs font-black text-gray-900 leading-snug uppercase tracking-tight">{o.output_type}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Target Status: <span className="text-gray-600">{o.target_status}</span></p>
                                            {o.notes && <p className="text-[10px] text-gray-500 mt-3 italic leading-relaxed border-t border-gray-100 pt-2 opacity-80">{o.notes}</p>}
                                        </div>
                                    )) : (
                                        <p className="col-span-2 text-[10px] text-gray-400 italic">Luaran belum didefinisikan.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Tab: Review Form */
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-white rounded-sm shadow-2xl border border-gray-100 p-8 md:p-14 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-3 h-full bg-green-700" />
                        
                        <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Evaluasi PKM</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-1.5 opacity-60 font-mono">Assigned Evaluator Toolkit</p>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-full pr-4 border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-green-700 font-black text-xs tabular-nums border border-green-700/10">{globalScore}</div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Multi-Factor Score</span>
                            </div>
                        </div>
                        
                        <div className="space-y-12">
                            {data.criteria && data.criteria.length > 0 ? (
                                data.criteria.map((c, idx) => (
                                    <div key={c.id} className="relative group transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex-1 mr-10 relative">
                                                <span className="absolute -left-10 top-0 text-3xl font-black text-gray-50 opacity-10 select-none italic pointer-events-none">0{idx+1}</span>
                                                <div className="flex items-center mb-2.5">
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-green-700 transition-colors">{c.criteria_name}</h4>
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed font-bold opacity-70 italic">{c.description}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="text-[8px] font-black text-green-700 bg-green-50 px-3 py-1.5 rounded-sm border border-green-200 uppercase tracking-[0.2em] shadow-sm">WEIGHT: {c.weight}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 pl-1">
                                            <div className="flex-1 relative flex items-center h-8">
                                                {/* Labels */}
                                                <span className="absolute -top-3 left-0 text-[8px] font-black text-gray-300 uppercase letter tracking-widest">1 (Deficient)</span>
                                                <span className="absolute -top-3 right-0 text-[8px] font-black text-gray-300 uppercase letter tracking-widest">10 (Exemplary)</span>
                                                
                                                <input 
                                                    type="range" 
                                                    min="1" 
                                                    max="10" 
                                                    step="1"
                                                    className="w-full accent-green-700 h-1.5 bg-gray-100 rounded-full cursor-pointer appearance-none outline-none focus:ring-4 focus:ring-green-700/10 transition-all"
                                                    value={scores[c.id] || 0}
                                                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                                                />
                                            </div>
                                            <div className="w-16 h-16 rounded-sm border-4 border-gray-900/5 flex flex-col items-center justify-center font-black text-green-700 bg-white shadow-2xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                                                <span className="text-xl leading-none tabular-nums">{scores[c.id] || 0}</span>
                                                <div className="w-6 h-0.5 bg-green-700/20 mt-1 mb-0.5" />
                                                <span className="text-[7px] text-gray-400 uppercase leading-none opacity-50 tracking-tighter">LEVEL</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 bg-gray-50 border-4 border-dashed border-gray-100 rounded-sm text-center">
                                    <p className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">Manual Global Score Entry</p>
                                    <div className="inline-flex flex-col items-center justify-center p-8 bg-white shadow-2xl rounded-sm border border-gray-100">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            className="w-32 text-center text-5xl font-black text-green-700 border-none p-0 focus:ring-0 tabular-nums bg-transparent tracking-tighter"
                                            value={globalScore}
                                            onChange={(e) => setGlobalScore(e.target.value)}
                                        />
                                        <div className="w-full h-1 bg-green-700 my-4" />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Integrated Score Percentage (0-100)</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-20 pt-12 border-t border-gray-100 space-y-12">
                                <div>
                                    <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-5 font-mono">
                                        <Info size={14} className="mr-3 text-green-700" /> Professional Appraisal Summary
                                    </label>
                                    <textarea 
                                        className="w-full text-sm font-medium border-2 border-transparent bg-gray-50/70 p-8 rounded-sm focus:bg-white focus:border-green-700 min-h-[220px] transition-all placeholder:italic placeholder:text-gray-300 focus:shadow-2xl focus:outline-none"
                                        placeholder="Outline the logical synthesis for this score. Highlight strengths, fatal flaws, and constructive pivot points for the PKM team..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-5 block font-mono">Binding Executive Recommendation</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full appearance-none text-xs font-black text-gray-900 border-2 border-gray-50 bg-gray-50 p-5 pr-12 rounded-sm focus:ring-4 focus:ring-green-700/10 focus:border-green-700 uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                                                value={decision}
                                                onChange={(e) => setDecision(e.target.value)}
                                            >
                                                <option value="accepted">✓ DISETUJUI / ELIGIBLE</option>
                                                <option value="revision">⚡ REVISI SUBSTANTIF</option>
                                                <option value="rejected">✕ TIDAK LAYAK / INELIGIBLE</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-active:text-green-700" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 font-mono">Weighted Final Index</p>
                                        <div className="text-6xl font-black text-green-700 tracking-tighter tabular-nums leading-none select-none">{globalScore}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Bar Floating Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-6">
                    <div className="flex items-center space-x-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] font-mono">
                        <div className="flex items-center text-green-700 bg-green-50 px-3 py-1.5 rounded-sm border border-green-200/50">
                            <CheckCircle size={14} className="mr-2" /> Data Consistency Valid
                        </div>
                        <div className="hidden lg:flex items-center opacity-40">
                            <Clock size={14} className="mr-2" /> Autosave Session: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="flex space-x-4 w-full md:w-auto">
                        <button 
                            disabled={isSaving}
                            onClick={handleSubmit}
                            className="w-full md:w-auto px-16 py-4 bg-gray-950 text-white rounded-sm font-black text-xs tracking-[0.4em] shadow-2xl hover:bg-green-700 transition-all flex items-center justify-center transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase group"
                        >
                            {isSaving ? (
                                <span className="animate-pulse">Finalizing Evaluation...</span>
                            ) : (
                                <>
                                    <Save size={18} className="mr-4 group-hover:rotate-12 transition-transform" /> Commit & Finalize Review
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

