import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    FileText, Users, BookOpen, Calendar, DollarSign, Target,
    ArrowLeft, CheckCircle, Clock, Printer, AlertCircle,
    ChevronDown, ChevronUp, MapPin, Briefcase, Info, Award, ShieldCheck, XCircle, MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import FullProposalPreviewModal from '../../components/pdf/FullProposalPreviewModal';

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

const ContentBlock = ({ label, html, text, borderColor = 'border-gray-200' }) => {
    if (!html && !text) return null;
    return (
        <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            {html ? (
                <div
                    className={`bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 ${borderColor}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            ) : (
                <div className={`bg-gray-50 p-4 rounded-sm text-xs text-gray-700 leading-relaxed border-l-4 ${borderColor}`}>
                    {text}
                </div>
            )}
        </div>
    );
};

export default function PkmShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [proposal, setProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalNote, setApprovalNote] = useState('');

    // Role check
    const isKetuaLppm = user?.roles?.some(r => r.name === 'ketua_lppm' || r.name === 'admin');

    // Collapsible section state
    const [openSections, setOpenSections] = useState({
        identity: true,
        partners: true,
        personnel: true,
        substance: true,
        budget: true,
        outputs: true,
        documents: true,
        history: true,
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchProposal = async () => {
        try {
            const res = await axios.get(`/api/pkm-proposals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposal(res.data);
            setApprovalNote(res.data.lppm_approval_note || '');
        } catch (err) {
            setError('Gagal memuat data usulan PKM. Anda mungkin tidak memiliki akses.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token && id) fetchProposal();
    }, [token, id]);

    const handleLppmApproval = async (status) => {
        if (!confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} usulan PKM ini?`)) return;
        setIsApproving(true);
        try {
            await axios.post(`/api/admin_pkm/${id}/approve-lppm`, {
                status,
                note: approvalNote
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Berhasil memproses keputusan LPPM untuk PKM.`);
            fetchProposal();
        } catch (err) {
            toast.error("Gagal memproses keputusan LPPM.");
        } finally {
            setIsApproving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <div className="p-10 text-center">
                <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
                <p className="text-gray-600">{error || 'Data tidak ditemukan.'}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-sm text-green-700 font-bold hover:underline">
                    &larr; Kembali
                </button>
            </div>
        );
    }

    const statusColors = {
        draft: 'bg-gray-100 text-gray-700',
        submitted: 'bg-blue-100 text-blue-700',
        review: 'bg-yellow-100 text-yellow-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-xs text-gray-400 hover:text-green-700 font-bold mb-3 transition-colors"
                        >
                            <ArrowLeft size={14} className="mr-1" /> Kembali
                        </button>
                        <h1 className="text-lg font-black text-gray-900 leading-tight">{proposal.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{proposal.scheme_group}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">TA {proposal.fiscal_year?.year}</span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-sm tracking-widest ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                                {proposal.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex items-center text-xs font-bold text-white bg-green-700 hover:bg-green-800 rounded-sm px-4 py-2 transition-all shadow-sm"
                        >
                            <FileText size={14} className="mr-2" /> Full PDF Preview
                        </button>
                    </div>
                </div>
            </div>

            {/* Ketua LPPM Action Card */}
            {isKetuaLppm && proposal.status === 'submitted' && (
                <div className="bg-white border-2 border-green-700 rounded-sm shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-green-700 p-4 flex items-center justify-between text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={18} /> Panel Persetujuan Ketua LPPM (PKM)
                        </h3>
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-sm">ADMINISTRATIVE ACTION</span>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-500 mb-4 font-medium italic">
                            Silakan periksa kelengkapan administrasi usulan PKM sebelum memberikan persetujuan untuk dilanjutkan ke tahap review.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-wider">Catatan / Feedback LPPM</label>
                                <textarea 
                                    rows={3}
                                    className="w-full border-gray-200 rounded-sm text-xs focus:ring-green-500 bg-gray-50/50"
                                    placeholder="Berikan catatan jika diperlukan..."
                                    value={approvalNote}
                                    onChange={(e) => setApprovalNote(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleLppmApproval('approved')}
                                    disabled={isApproving}
                                    className="flex-1 bg-green-700 text-white py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} /> {isApproving ? 'Memproses...' : 'Setujui Usulan'}
                                </button>
                                <button 
                                    onClick={() => handleLppmApproval('rejected')}
                                    disabled={isApproving}
                                    className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Tolak Usulan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Identitas */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={Info} title="Ringkasan Usulan" isOpen={openSections.identity} onToggle={() => toggleSection('identity')} />
                {openSections.identity && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 text-sm">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ruang Lingkup</p>
                                <p className="text-gray-700 font-medium">{proposal.scope || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lama Kegiatan</p>
                                <p className="text-gray-700 font-medium">{proposal.duration_years} Tahun (Mulai {proposal.first_year})</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Keywords</p>
                                <p className="text-gray-700 font-medium">{proposal.keywords || '-'}</p>
                            </div>
                        </div>
                        <ContentBlock label="Ringkasan" html={proposal.summary} borderColor="border-green-200" />
                        <ContentBlock label="Ringkasan Substansi" html={proposal.substance_summary} borderColor="border-blue-200" />
                    </div>
                )}
            </div>

            {/* 2. Mitra Kerjasama */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={Briefcase} title="Mitra Kerjasama" isOpen={openSections.partners} onToggle={() => toggleSection('partners')} />
                {openSections.partners && (
                    <div className="space-y-8">
                        {proposal.partners?.length === 0 && <p className="text-xs text-gray-400 italic">Tidak ada data mitra.</p>}
                        {proposal.partners?.map((m, idx) => (
                            <div key={idx} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-tight">{m.partner_name}</h4>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-sm text-[9px] font-bold uppercase tracking-widest">{m.partner_category}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pimpinan / Ketua</p>
                                            <p className="text-gray-700">{m.leader_name || '-'} ({m.group_name || '-'})</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alamat Mitra</p>
                                            <p className="text-gray-700 leading-relaxed">{m.address}, {m.village}, {m.district}, {m.city}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Masalah yang Dihadapi (Bidang 1)</p>
                                            <p className="text-gray-700 italic">"{m.problem_scope_1}"</p>
                                        </div>
                                        {m.problem_scope_2 && (
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Masalah yang Dihadapi (Bidang 2)</p>
                                                <p className="text-gray-700 italic">"{m.problem_scope_2}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Tim Pengusul */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={Users} title="Tim Pengusul" isOpen={openSections.personnel} onToggle={() => toggleSection('personnel')} />
                {openSections.personnel && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                    <th className="px-4 py-3 border-b border-gray-100 w-10 text-center">No</th>
                                    <th className="px-4 py-3 border-b border-gray-100">Nama & Identitas</th>
                                    <th className="px-4 py-3 border-b border-gray-100 w-28">Peran</th>
                                    <th className="px-4 py-3 border-b border-gray-100">Deskripsi Tugas</th>
                                    <th className="px-4 py-3 border-b border-gray-100 w-24 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {proposal.personnel?.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-center text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-gray-800 uppercase tracking-tight">
                                                {p.type === 'mahasiswa' ? p.student_name : p.user?.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                {p.type === 'mahasiswa'
                                                    ? `NIM: ${p.student_nim || '-'}`
                                                    : `NIDN: ${p.user?.dosen_profile?.nidn || '-'}`}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                                                p.role === 'ketua' ? 'bg-green-100 text-green-700 border-green-200' :
                                                p.role === 'mahasiswa' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {p.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 italic leading-relaxed">
                                            {p.task_description || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.is_confirmed ? (
                                                <CheckCircle size={15} className="text-green-600 mx-auto" title="Terkonfirmasi" />
                                            ) : (
                                                <Clock size={15} className="text-orange-500 mx-auto" title="Menunggu Konfirmasi" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 4. Substansi (SDGs & Bidang Strategis) */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={BookOpen} title="Substansi PKM" isOpen={openSections.substance} onToggle={() => toggleSection('substance')} />
                {openSections.substance && (
                    <div className="space-y-8">
                        {/* SDGs */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                <Target size={12} className="mr-2" /> Target SDG Goals
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {proposal.substance?.sdg_goals?.map((s, i) => (
                                    <div key={i} className="p-4 bg-green-50/50 rounded-sm border border-green-100">
                                        <p className="text-xs font-bold text-green-800 mb-1">{s.goal}</p>
                                        <p className="text-[10px] text-gray-500 font-medium mb-2">Indikator: {s.indicator}</p>
                                        <p className="text-xs text-gray-600 italic leading-relaxed">"{s.description}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strategic Fields */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                <Award size={12} className="mr-2" /> Bidang Strategis & Masalah
                            </p>
                            <div className="space-y-4">
                                {proposal.substance?.strategic_fields?.map((f, i) => (
                                    <div key={i} className="p-4 bg-blue-50/50 rounded-sm border border-blue-100">
                                        <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
                                            <span className="text-xs font-bold text-blue-800 uppercase tracking-tighter">{f.field}</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Problem Statement</p>
                                                <p className="text-xs text-gray-700 font-medium italic">"{f.problem_statement}"</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Deskripsi Solusi</p>
                                                <p className="text-xs text-gray-700 leading-relaxed">{f.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Anggaran */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={DollarSign} title="Rencana Anggaran (RAB)" isOpen={openSections.budget} onToggle={() => toggleSection('budget')} />
                {openSections.budget && (
                    <div className="space-y-8">
                        {/* Grouped Tables */}
                        {(() => {
                            const groups = [...new Set(proposal.budget_items?.map(it => it.cost_group))];
                            const grandTotal = proposal.budget || 0;

                            return groups.map((gName, idx) => {
                                const groupItems = proposal.budget_items?.filter(it => it.cost_group === gName);
                                const groupTotal = groupItems.reduce((sum, it) => sum + (it.total_cost || 0), 0);
                                const percentage = grandTotal > 0 ? (groupTotal / grandTotal) * 100 : 0;

                                return (
                                    <div key={idx} className="border border-gray-100 rounded-sm overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{gName}</span>
                                            <span className="text-[10px] font-black text-green-700">{percentage.toFixed(1)}% dari Total</span>
                                        </div>
                                        <table className="min-w-full text-[11px]">
                                            <thead className="bg-white">
                                                <tr className="text-gray-400 uppercase tracking-tighter border-b border-gray-50">
                                                    <th className="px-4 py-2 text-left font-bold">Komponen / Item</th>
                                                    <th className="px-4 py-2 text-right font-bold w-20">Vol</th>
                                                    <th className="px-4 py-2 text-right font-bold w-32">Harga Satuan</th>
                                                    <th className="px-4 py-2 text-right font-bold w-32">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {groupItems.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2">
                                                            <p className="font-bold text-gray-700">{item.item_name}</p>
                                                            <p className="text-[9px] text-gray-400 italic">{item.component}</p>
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-gray-500">{item.volume} {item.unit}</td>
                                                        <td className="px-4 py-2 text-right text-gray-500">Rp {item.unit_cost?.toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-2 text-right font-bold text-gray-700">Rp {item.total_cost?.toLocaleString('id-ID')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50/50 font-bold border-t border-gray-100">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-2 text-right text-[10px] text-gray-400 uppercase">Subtotal {gName}</td>
                                                    <td className="px-4 py-2 text-right text-gray-900">Rp {groupTotal.toLocaleString('id-ID')}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                );
                            });
                        })()}

                        {/* Grand Total Footer */}
                        <div className="bg-green-700 text-white p-5 rounded-sm flex items-center justify-between shadow-md">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Anggaran Diusulkan</p>
                                <h4 className="text-2xl font-black mt-1">Rp {proposal.budget?.toLocaleString('id-ID')}</h4>
                            </div>
                            <Calculator size={32} className="opacity-30" />
                        </div>
                    </div>
                )}
            </div>

            {/* 6. Luaran */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={Target} title="Luaran yang Dijanjikan" isOpen={openSections.outputs} onToggle={() => toggleSection('outputs')} />
                {openSections.outputs && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proposal.outputs?.map((o, idx) => (
                            <div key={idx} className="p-4 rounded-sm border bg-green-50/30 border-green-100">
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest bg-green-700 text-white leading-none inline-block mb-3">
                                    {o.output_group}
                                </span>
                                <p className="text-xs font-bold text-gray-800 leading-snug">{o.output_type}</p>
                                <div className="mt-3 pt-3 border-t border-green-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Status Target</p>
                                    <p className="text-[10px] text-gray-600 font-medium italic">"{o.target_status}"</p>
                                </div>
                                {o.notes && <p className="text-[9px] text-gray-400 mt-2 line-clamp-2 italic">{o.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 7. Dokumen */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={FileText} title="Dokumen Pendukung" isOpen={openSections.documents} onToggle={() => toggleSection('documents')} />
                {openSections.documents && (
                    <div className="space-y-3">
                         {proposal.documents?.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada dokumen diunggah.</p>}
                        {proposal.documents?.map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-sm bg-gray-50/50 hover:bg-white transition-colors">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-sm bg-red-100 text-red-600 flex items-center justify-center mr-4">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{d.document_type}</p>
                                        <a 
                                            href={`/storage/${d.file_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs font-bold text-gray-700 hover:text-green-700 line-clamp-1"
                                        >
                                            {d.original_name}
                                        </a>
                                    </div>
                                </div>
                                <a 
                                    href={`/storage/${d.file_path}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-green-700 transition-colors"
                                >
                                    <ArrowLeft size={16} className="rotate-180" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 8. Riwayat Keputusan & Review PKM */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={MessageSquare} title="Riwayat Keputusan & Review (PKM)" isOpen={openSections.history} onToggle={() => toggleSection('history')} />
                {openSections.history && (
                    <div className="space-y-6">
                        {/* LPPM Approval History */}
                        <div className="relative pl-8 border-l-2 border-gray-100 space-y-4">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-green-700 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-700" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Verifikasi Awal LPPM (PKM)</p>
                                {proposal.lppm_approval_status ? (
                                    <div className={`p-4 rounded-sm border ${proposal.lppm_approval_status === 'approved' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest ${proposal.lppm_approval_status === 'approved' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                                                {proposal.lppm_approval_status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium italic">{proposal.lppm_approval_date ? new Date(proposal.lppm_approval_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed font-medium">"{proposal.lppm_approval_note || 'Tidak ada catatan.'}"</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 text-xs text-gray-400 italic">
                                        Menunggu verifikasi administrasi oleh Ketua LPPM.
                                    </div>
                                )}
                            </div>

                            {/* Reviewer History */}
                            {proposal.pkm_reviews?.length > 0 && proposal.pkm_reviews.map((rev, i) => (
                                <div key={i} className="relative pt-4">
                                    <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Hasil Reviewer {i + 1}</p>
                                    <div className="p-4 bg-orange-50/30 border border-orange-100 rounded-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 uppercase tracking-tighter">{rev.reviewer?.name || 'Reviewer'}</p>
                                                <p className="text-[10px] text-orange-600 font-bold">Skor: {rev.score || 0}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest ${
                                                rev.decision === 'accepted' ? 'bg-green-600 text-white' : 
                                                rev.decision === 'rejected' ? 'bg-red-600 text-white' : 
                                                'bg-yellow-500 text-white'
                                            }`}>
                                                {rev.decision}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed italic">"{rev.comment || 'Tidak ada komentar.'}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <FullProposalPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                proposalId={id}
                type="pkm"
            />
        </div>
    );
}
