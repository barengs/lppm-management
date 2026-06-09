import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    FileText, Users, BookOpen, Calendar, DollarSign, Target,
    ArrowLeft, CheckCircle, Clock, Printer, AlertCircle,
    ChevronDown, ChevronUp, ShieldCheck, XCircle, MessageSquare
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

const ContentBlock = ({ label, html, borderColor = 'border-gray-200' }) => {
    if (!html) return null;
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <div
                className={`bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 ${borderColor}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
};

export default function ProposalShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user, hasAnyRole } = useAuth();

    const [proposal, setProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalNote, setApprovalNote] = useState('');

    // Role check
    const isKetuaLppm = hasAnyRole(['ketua_lppm', 'admin']);

    // Collapsible section state
    const [openSections, setOpenSections] = useState({
        identity: true,
        personnel: true,
        substance: true,
        schedule: true,
        budget: true,
        outputs: true,
        history: true,
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchProposal = async () => {
        try {
            const res = await axios.get(`/api/proposals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposal(res.data);
            setApprovalNote(res.data.lppm_approval_note || '');
        } catch (err) {
            setError('Gagal memuat data usulan. Anda mungkin tidak memiliki akses.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token && id) fetchProposal();
    }, [token, id]);

    const handleLppmApproval = async (status) => {
        if (!confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} usulan ini?`)) return;
        setIsApproving(true);
        try {
            await axios.post(`/api/admin_proposals/${id}/approve-lppm`, {
                status,
                note: approvalNote
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Berhasil memproses keputusan LPPM.`);
            fetchProposal();
        } catch (err) {
            toast.error("Gagal memproses keputusan LPPM.");
        } finally {
            setIsApproving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
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
                            <span className="text-xs text-gray-500">{proposal.scheme?.name}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">TA {proposal.fiscal_year?.year}</span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-sm tracking-widest ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                                {proposal.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.open(`/api/proposals/${id}/download-endorsement?token=${token}`, '_blank')}
                            className="flex items-center text-xs font-bold text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-300 rounded-sm px-4 py-2 transition-all shadow-sm"
                        >
                            <Printer size={14} className="mr-2" /> Lembar Pengesahan
                        </button>
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
                            <ShieldCheck size={18} /> Panel Persetujuan Ketua LPPM
                        </h3>
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-sm">ADMINISTRATIVE ACTION</span>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-500 mb-4 font-medium italic">
                            Silakan periksa kelengkapan administrasi usulan sebelum memberikan persetujuan untuk dilanjutkan ke tahap review.
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
                <SectionHeader icon={FileText} title="Identitas Usulan" isOpen={openSections.identity} onToggle={() => toggleSection('identity')} />
                {openSections.identity && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 text-sm">
                        <div className="md:col-span-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Judul Usulan</p>
                            <p className="font-bold text-gray-800">{proposal.title}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skema</p>
                            <p className="text-gray-700 font-medium">{proposal.scheme?.name} — {proposal.scheme?.type}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tahun Anggaran</p>
                            <p className="text-gray-700 font-medium">{proposal.fiscal_year?.year}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lama Penelitian</p>
                            <p className="text-gray-700 font-medium">{proposal.identity?.duration_years} Tahun</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TKT Awal / Target</p>
                            <p className="text-gray-700 font-medium">Level {proposal.identity?.tkt_initial} / Level {proposal.identity?.tkt_target}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Topik Riset</p>
                            <p className="text-gray-700 font-medium">{proposal.identity?.research_topic || '-'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Tim Pengusul */}
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
                                                p.type === 'mahasiswa' ? 'bg-blue-100 text-blue-700 border-blue-200' :
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
                                                <div className="flex flex-col items-center text-green-600">
                                                    <CheckCircle size={15} />
                                                    <span className="text-[8px] font-black uppercase mt-1">Selesai</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-orange-500">
                                                    <Clock size={15} className="animate-pulse" />
                                                    <span className="text-[8px] font-black uppercase mt-1">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 3. Substansi */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={BookOpen} title="Substansi Usulan" isOpen={openSections.substance} onToggle={() => toggleSection('substance')} />
                {openSections.substance && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kata Kunci</p>
                            <p className="text-xs font-medium text-green-700 italic">{proposal.content?.keywords || '-'}</p>
                        </div>
                        <ContentBlock label="Abstrak" html={proposal.content?.abstract} borderColor="border-green-200" />
                        <ContentBlock label="Latar Belakang" html={proposal.content?.background} borderColor="border-blue-200" />
                        <ContentBlock label="Tujuan Penelitian" html={proposal.content?.objectives} borderColor="border-purple-200" />
                        <ContentBlock label="Metodologi" html={proposal.content?.methodology} borderColor="border-orange-200" />
                        <ContentBlock label="Daftar Pustaka" html={proposal.content?.references} borderColor="border-gray-300" />
                    </div>
                )}
            </div>

            {/* 4. Jadwal */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={Calendar} title="Timeline Kegiatan" isOpen={openSections.schedule} onToggle={() => toggleSection('schedule')} />
                {openSections.schedule && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[10px] table-fixed border-separate border-spacing-y-1">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-4 py-3 text-left text-gray-400 font-bold uppercase tracking-widest w-48 md:w-64">Aktivitas</th>
                                    {[...Array(12)].map((_, i) => (
                                        <th key={i} className="px-0 py-3 text-center text-gray-400 font-bold w-7 md:w-9 uppercase tracking-tighter">
                                            {i + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {proposal.schedules?.length === 0 && (
                                    <tr><td colSpan={13} className="py-6 text-center text-gray-300 italic text-xs">Jadwal belum diisi.</td></tr>
                                )}
                                {proposal.schedules?.map((s, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-2 text-gray-700 font-medium text-xs">
                                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 font-black rounded-sm text-[8px] mr-2 border border-green-100">Y{s.execution_year}</span>
                                            {s.activity}
                                        </td>
                                        {[...Array(12)].map((_, m) => {
                                            const isChecked = s.months?.includes(m + 1);
                                            return (
                                                <td key={m} className="p-1">
                                                    <div className={`w-full h-5 rounded-sm transition-all ${isChecked ? 'bg-green-600 border border-green-700' : 'bg-gray-100'}`} />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 5. Anggaran */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={DollarSign} title="Rincian Anggaran (RAB)" isOpen={openSections.budget} onToggle={() => toggleSection('budget')} />
                {openSections.budget && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-gray-50">
                                <tr className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    <th className="px-4 py-3 text-left">Grup Biaya</th>
                                    <th className="px-4 py-3 text-left">Item</th>
                                    <th className="px-4 py-3 text-right">Vol</th>
                                    <th className="px-4 py-3 text-right">Satuan</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {proposal.budget_items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30">
                                        <td className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">{item.cost_group}</td>
                                        <td className="px-4 py-3 text-gray-700">{item.item_name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">Rp {item.unit_cost?.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">Rp {item.total_cost?.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-900 text-white font-bold">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right text-xs text-gray-400 uppercase">Total Anggaran</td>
                                    <td className="px-4 py-3 text-right text-green-400 text-sm">Rp {proposal.budget?.toLocaleString('id-ID')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* 6. Luaran */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={Target} title="Luaran yang Dijanjikan" isOpen={openSections.outputs} onToggle={() => toggleSection('outputs')} />
                {openSections.outputs && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proposal.outputs?.map((o, idx) => (
                            <div key={idx} className={`p-4 rounded-sm border ${o.category === 'mandatory' ? 'bg-green-50/30 border-green-100' : 'bg-blue-50/30 border-blue-100'}`}>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest ${o.category === 'mandatory' ? 'bg-green-700 text-white' : 'bg-blue-600 text-white'}`}>
                                    {o.category}
                                </span>
                                <p className="text-xs font-bold text-gray-800 mt-3 leading-snug">{o.type}</p>
                                <p className="text-[10px] text-gray-500 mt-2 italic">{o.target_description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 7. Riwayat Keputusan & Review */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <SectionHeader icon={MessageSquare} title="Riwayat Keputusan & Review" isOpen={openSections.history} onToggle={() => toggleSection('history')} />
                {openSections.history && (
                    <div className="space-y-6">
                        {/* LPPM Approval History */}
                        <div className="relative pl-8 border-l-2 border-gray-100 space-y-4">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-green-700 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-700" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Verifikasi Awal LPPM</p>
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
                            {proposal.reviews?.length > 0 && proposal.reviews.map((rev, i) => (
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
                type="research"
            />
        </div>
    );
}
