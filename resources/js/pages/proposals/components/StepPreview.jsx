import React, { useState } from 'react';
import axios from 'axios';
import { 
    CheckCircle, 
    AlertCircle, 
    FileText, 
    Users, 
    BookOpen, 
    Calendar, 
    DollarSign, 
    Target, 
    ExternalLink,
    Printer,
    Clock
} from 'lucide-react';

export default function StepPreview({ proposalId, token, onBack, initialData }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengirim proposal.");
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white ring-4 ring-green-50">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Usulan Berhasil Terkirim!</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">
                    Terima kasih. Proposal Anda telah berhasil dikirim ke LPPM dan akan segera diproses untuk tahap peninjauan oleh reviewer.
                </p>
                <div className="flex space-x-4">
                    <button 
                        onClick={() => window.location.href = '/proposals'}
                        className="px-8 py-3 bg-gray-900 text-white rounded-sm text-xs font-bold uppercase tracking-widest shadow-md hover:bg-black transition-all"
                    >
                        Dashboard Usulan
                    </button>
                    <button 
                        onClick={() => window.open(`/api/proposals/${proposalId}/endorsement?token=${token}`, '_blank')}
                        className="px-8 py-3 border border-gray-300 rounded-sm text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                        <Printer size={18} className="mr-2 text-green-700" /> Cetak Lembar Pengesahan
                    </button>
                </div>
            </div>
        );
    }

    const SectionHeader = ({ icon: Icon, title, step }) => (
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2 group">
            <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-tight">
                <Icon className="mr-3 text-green-700" size={20} />
                {title}
            </h3>
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Step-0{step}
            </span>
        </div>
    );

    return (
        <div className="space-y-10 pb-28">
            {/* Warning Info */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-sm flex items-start shadow-sm">
                <AlertCircle className="text-amber-500 mr-4 mt-1" size={24} />
                <div>
                    <h4 className="text-sm font-bold text-amber-900 mb-1">Pratinjau Akhir Usulan</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Mohon periksa kembali seluruh detail usulan Anda di bawah ini sebelum melakukan pengiriman (Submit). Anda hanya dapat mengubah data jika proposal dikembalikan oleh admin atau reviewer.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {/* 1. Identitas Section */}
                <section className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 -mr-16 -mt-16 rounded-full opacity-50" />
                    <SectionHeader icon={FileText} title="Ringkasan Identitas" step="1" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm relative z-10">
                        <div className="md:col-span-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Judul Usulan</p>
                            <p className="font-bold text-gray-800 leading-relaxed text-base">{initialData?.title}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Skema & Tahun</p>
                            <p className="text-gray-700 font-medium">{initialData?.scheme?.name} • TA {initialData?.fiscal_year?.year}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Lama Penelitian</p>
                            <p className="text-gray-700 font-medium">{initialData?.identity?.duration_years} Tahun pelaksanaan</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bidang Fokus</p>
                            <p className="text-gray-700 font-medium">{initialData?.identity?.focus_area || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Level TKT (Target)</p>
                            <p className="text-green-700 font-bold">Level {initialData?.identity?.tkt_target} <span className="text-gray-300 font-normal mx-2">|</span> <span className="text-gray-400 text-[11px] font-normal uppercase tracking-tight">Kesiapan Teknologi</span></p>
                        </div>
                    </div>
                </section>

                {/* 2. Anggota Section - Table Version */}
                <section className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <SectionHeader icon={Users} title="Manajemen Anggota" step="2" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                    <th className="px-4 py-3 border-b border-gray-100 w-12 text-center">No</th>
                                    <th className="px-4 py-3 border-b border-gray-100">Nama Lengkap & ID</th>
                                    <th className="px-4 py-3 border-b border-gray-100 w-32">Peran</th>
                                    <th className="px-4 py-3 border-b border-gray-100">Deskripsi Tugas</th>
                                    <th className="px-4 py-3 border-b border-gray-100 w-24 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {initialData?.personnel?.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 text-center text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-4">
                                            <p className="font-bold text-gray-800 uppercase tracking-tight">
                                                {p.type === 'mahasiswa' ? p.student_name : p.user?.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                                {p.type === 'mahasiswa' ? `NIM: ${p.student_nim || '-'}` : `NIDN/NIK: ${p.user?.dosen_profile?.nidn || '-'}`}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                                                p.role === 'ketua' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                p.type === 'mahasiswa' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {p.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 leading-relaxed italic">
                                            {p.task_description || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {p.is_confirmed ? (
                                                <div className="flex flex-col items-center text-green-600" title="Terkonfirmasi">
                                                    <CheckCircle size={16} />
                                                    <span className="text-[8px] font-black uppercase mt-1">Selesai</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-orange-500" title="Menunggu Konfirmasi">
                                                    <Clock size={16} className="animate-pulse" />
                                                    <span className="text-[8px] font-black uppercase mt-1">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 3. Substansi Section */}
                <section className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <SectionHeader icon={BookOpen} title="Substansi Usulan" step="3" />
                    <div className="space-y-8">

                        {/* Keywords */}
                        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kata Kunci</p>
                            <p className="text-xs font-medium text-green-700 italic">{initialData?.content?.keywords || '-'}</p>
                        </div>

                        {/* Abstract */}
                        {initialData?.content?.abstract && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Abstrak</p>
                                <div
                                    className="bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 border-green-200"
                                    dangerouslySetInnerHTML={{ __html: initialData.content.abstract }}
                                />
                            </div>
                        )}

                        {/* Background */}
                        {initialData?.content?.background && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Latar Belakang</p>
                                <div
                                    className="bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 border-blue-200"
                                    dangerouslySetInnerHTML={{ __html: initialData.content.background }}
                                />
                            </div>
                        )}

                        {/* Objectives */}
                        {initialData?.content?.objectives && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tujuan Penelitian</p>
                                <div
                                    className="bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 border-purple-200"
                                    dangerouslySetInnerHTML={{ __html: initialData.content.objectives }}
                                />
                            </div>
                        )}

                        {/* Methodology */}
                        {initialData?.content?.methodology && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Metodologi</p>
                                <div
                                    className="bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 border-orange-200"
                                    dangerouslySetInnerHTML={{ __html: initialData.content.methodology }}
                                />
                            </div>
                        )}

                        {/* References */}
                        {initialData?.content?.references && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Daftar Pustaka</p>
                                <div
                                    className="bg-gray-50 p-5 rounded-sm text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none border-l-4 border-gray-300"
                                    dangerouslySetInnerHTML={{ __html: initialData.content.references }}
                                />
                            </div>
                        )}

                    </div>
                </section>

                {/* 4. Jadwal Section */}
                <section className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm overflow-hidden">
                    <SectionHeader icon={Calendar} title="Timeline Kegiatan" step="4" />
                    <div className="overflow-x-auto -mx-2">
                        <table className="min-w-full text-[10px] table-fixed border-separate border-spacing-y-1">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-4 py-3 text-left text-gray-400 font-bold uppercase tracking-widest w-48 md:w-64">Aktivitas Utama</th>
                                    {[...Array(12)].map((_, i) => (
                                        <th key={i} className="px-0 py-3 text-center text-gray-400 font-bold w-7 md:w-9 border-b border-gray-100 uppercase tracking-tighter">
                                            Bln {i + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-transparent">
                                {initialData?.schedules?.map((s, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 bg-white group-hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center">
                                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 font-black rounded-sm text-[8px] mr-3 shrink-0 border border-green-100">Y{s.execution_year}</span>
                                                <span className="text-gray-700 font-bold leading-tight line-clamp-2">{s.activity}</span>
                                            </div>
                                        </td>
                                        {[...Array(12)].map((_, m) => {
                                            const monthNum = m + 1;
                                            const isChecked = s.months?.includes(monthNum);
                                            return (
                                                <td key={m} className={`p-1.5 relative ${m === 11 ? '' : 'border-r border-gray-50'}`}>
                                                    <div className={`w-full h-6 rounded-sm transition-all duration-300 ${
                                                        isChecked 
                                                            ? 'bg-green-600 shadow-sm shadow-green-200 border border-green-700 ring-2 ring-white z-10' 
                                                            : 'bg-gray-50/30 border border-transparent'
                                                    }`} />
                                                    {isChecked && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-1 h-1 bg-white/40 rounded-full" />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {(!initialData?.schedules || initialData.schedules.length === 0) && (
                                    <tr>
                                        <td colSpan={13} className="px-4 py-8 text-center text-gray-300 italic">Jadwal belum diisi</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 5. Budget (RAB) Section */}
                <section className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <SectionHeader icon={DollarSign} title="Rincian Anggaran (RAB)" step="5" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[11px]">
                            <thead className="bg-gray-50/50">
                                <tr className="text-gray-400 font-bold uppercase tracking-widest">
                                    <th className="px-4 py-3 text-left">Grup Biaya</th>
                                    <th className="px-4 py-3 text-left">Deskripsi Item</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {initialData?.budget_items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30">
                                        <td className="px-4 py-3 text-gray-400 uppercase font-bold text-[9px] tracking-tight">{item.cost_group}</td>
                                        <td className="px-4 py-3 text-gray-700 font-medium">{item.item_name}</td>
                                        <td className="px-4 py-3 text-right text-gray-800 font-bold">Rp {item.total_cost?.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-gray-100 bg-gray-900">
                                <tr className="text-white font-bold">
                                    <td colSpan={2} className="px-6 py-4 text-right text-xs uppercase tracking-widest text-gray-400">Total Anggaran</td>
                                    <td className="px-6 py-4 text-right text-base text-green-400">Rp {initialData?.budget?.toLocaleString('id-ID')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>

                {/* 6. Luaran Section */}
                <section className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm">
                    <SectionHeader icon={Target} title="Luaran Dijanjikan" step="6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialData?.outputs?.map((o, idx) => (
                            <div key={idx} className={`p-5 rounded-sm border ${o.category === 'mandatory' ? 'bg-green-50/30 border-green-100' : 'bg-blue-50/30 border-blue-100'} hover:shadow-md transition-shadow`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[9px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest ${o.category === 'mandatory' ? 'bg-green-700 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'}`}>
                                        {o.category}
                                    </span>
                                    <Target className={`${o.category === 'mandatory' ? 'text-green-700' : 'text-blue-600'} opacity-20`} size={24} />
                                </div>
                                <p className="text-xs font-bold text-gray-800 leading-snug">{o.type}</p>
                                <div className="mt-3 pt-3 border-t border-gray-100/50">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Target</p>
                                    <p className="text-[11px] text-gray-600 italic font-medium">{o.target_description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 text-xs font-bold rounded-sm border border-red-200 flex items-center shadow-lg animate-bounce">
                    <AlertCircle size={20} className="mr-3" /> {error}
                </div>
            )}

            {/* Float Command Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-8">
                    <div className="hidden md:flex flex-col">
                        <span className="text-[9px] text-gray-300 uppercase font-black tracking-widest mb-0.5">Draft Status</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Terakhir disimpan: {new Date(initialData?.updated_at).toLocaleTimeString('id-ID')} WITA</span>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button
                            onClick={onBack}
                            className="flex-1 md:flex-none px-10 py-3 border border-gray-300 rounded-sm text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 md:flex-none px-14 py-3 bg-green-700 text-white rounded-sm text-xs font-bold uppercase tracking-widest shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-green-800 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center active:scale-95"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">Memproses...</span>
                            ) : (
                                <>Kirim Usulan Akhir <ExternalLink size={14} className="ml-2" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
