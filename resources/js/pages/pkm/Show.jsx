import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    FileText, Users, BookOpen, Calendar, DollarSign, Target,
    ArrowLeft, CheckCircle, Clock, Printer, AlertCircle,
    ChevronDown, ChevronUp, MapPin, Briefcase, Info, Award
} from 'lucide-react';
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
    const { token } = useAuth();

    const [proposal, setProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Collapsible section state
    const [openSections, setOpenSections] = useState({
        identity: true,
        partners: true,
        personnel: true,
        substance: true,
        budget: true,
        outputs: true,
        documents: true,
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                const res = await axios.get(`/api/pkm-proposals/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProposal(res.data);
            } catch (err) {
                setError('Gagal memuat data usulan PKM. Anda mungkin tidak memiliki akses.');
            } finally {
                setIsLoading(false);
            }
        };

        if (token && id) fetchProposal();
    }, [token, id]);

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
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bidang Fokus</p>
                                <p className="text-gray-700 font-medium">{proposal.focus_area || '-'}</p>
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-gray-50">
                                <tr className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    <th className="px-4 py-3 text-left">Grup Biaya</th>
                                    <th className="px-4 py-3 text-left">Item / Komponen</th>
                                    <th className="px-4 py-3 text-right">Vol</th>
                                    <th className="px-4 py-3 text-right">Satuan</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {proposal.budget_items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30">
                                        <td className="px-4 py-3">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{item.cost_group}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-800 font-medium">{item.item_name}</p>
                                            <p className="text-[10px] text-gray-400 italic">{item.component}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">{item.volume} {item.unit}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">Rp {item.unit_cost?.toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">Rp {item.total_cost?.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-900 text-white font-bold">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right text-xs text-gray-400 uppercase">Total Anggaran Diusulkan</td>
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

            <FullProposalPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                proposalId={id}
                type="pkm"
            />
        </div>
    );
}
