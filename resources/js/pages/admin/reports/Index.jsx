import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { FileText, Search, Filter, CheckCircle, AlertTriangle, Download, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminReportDashboard() {
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Review Modal State
    const [selectedReport, setSelectedReport] = useState(null);
    const [reviewStatus, setReviewStatus] = useState('approved');
    const [reviewComments, setReviewComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/admin_reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data);
        } catch (err) {
            toast.error("Gagal memuat data laporan.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = async () => {
        setIsSubmitting(true);
        try {
            await axios.put(`/api/admin_reports/${selectedReport.id}`, {
                status: reviewStatus,
                comments: reviewComments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Penilaian laporan berhasil disimpan.");
            setSelectedReport(null);
            fetchReports();
        } catch (err) {
            toast.error("Gagal menyimpan penilaian.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredReports = reports.filter(r => {
        const title = (r.proposal?.title || r.pkm_proposal?.title || '').toLowerCase();
        const user = (r.proposal?.user?.name || r.pkm_proposal?.user?.name || '').toLowerCase();
        const matchesSearch = title.includes(searchQuery.toLowerCase()) || user.includes(searchQuery.toLowerCase());
        const matchesType = !filterType || r.type === filterType;
        const matchesStatus = !filterStatus || r.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FileText className="mr-3 text-green-700" size={32} />
                    Monitoring Laporan Kemajuan & Akhir
                </h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari judul usulan atau pengusul..."
                        className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 rounded-sm focus:ring-green-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                    <select 
                        className="text-sm border-gray-200 rounded-sm py-2 px-3 focus:ring-green-500 w-full"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">Semua Jenis</option>
                        <option value="progress">Kemajuan</option>
                        <option value="final">Akhir</option>
                        <option value="monev">Monev</option>
                        <option value="logbook">Logbook</option>
                    </select>
                    <select 
                        className="text-sm border-gray-200 rounded-sm py-2 px-3 focus:ring-green-500 w-full"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="revision">Revision</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Usulan / Pengusul</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Tipe Laporan</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">File</th>
                                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Memuat data...</td></tr>
                            ) : filteredReports.length === 0 ? (
                                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Tidak ada laporan ditemukan.</td></tr>
                            ) : filteredReports.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{r.proposal?.title || r.pkm_proposal?.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-medium">
                                            {r.proposal?.user?.name || r.pkm_proposal?.user?.name} 
                                            <span className="mx-1">&bull;</span>
                                            {r.proposal ? 'Penelitian' : 'PKM'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            r.type === 'progress' ? 'bg-blue-100 text-blue-700' : 
                                            r.type === 'final' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {r.type}
                                        </span>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a 
                                            href={`/api/reports/${r.id}/download?token=${token}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-green-700 hover:underline flex items-center"
                                        >
                                            <Download size={14} className="mr-1" /> PDF
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            r.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                            r.status === 'revision' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setSelectedReport(r);
                                                setReviewStatus(r.status === 'submitted' ? 'approved' : r.status);
                                                setReviewComments(r.comments || '');
                                            }}
                                            className="p-2 text-green-700 hover:bg-green-50 rounded-sm transition-all"
                                            title="Beri Penilaian"
                                        >
                                            <MessageSquare size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border-t-4 border-green-700">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Review Laporan</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase line-clamp-1">{selectedReport.proposal?.title || selectedReport.pkm_proposal?.title}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Status Penilaian</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setReviewStatus('approved')}
                                        className={`py-3 rounded-sm border-2 font-bold text-xs transition-all ${reviewStatus === 'approved' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <CheckCircle className="mx-auto mb-1" size={20} />
                                        SETUJUI
                                    </button>
                                    <button 
                                        onClick={() => setReviewStatus('revision')}
                                        className={`py-3 rounded-sm border-2 font-bold text-xs transition-all ${reviewStatus === 'revision' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <AlertTriangle className="mx-auto mb-1" size={20} />
                                        REVISI
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Catatan / Komentar</label>
                                <textarea 
                                    className="w-full border-gray-300 rounded-sm text-sm focus:ring-green-500"
                                    rows={4}
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    placeholder="Tuliskan catatan revisi atau alasan penolakan..."
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleReview}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-green-700 text-white rounded-sm font-bold text-xs uppercase tracking-widest shadow-md hover:bg-green-800 disabled:opacity-50"
                            >
                                {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
