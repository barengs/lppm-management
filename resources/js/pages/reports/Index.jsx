import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';
import { FileText, Calendar, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Download, Search, ChevronRight, User, Home, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReportsIndex() {
    const { token, user } = useAuthStore();
    
    // UI State
    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'final'
    const [isLoadingPostos, setIsLoadingPostos] = useState(false);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    
    // Data State
    const [postos, setPostos] = useState([]);
    const [filteredPostos, setFilteredPostos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosto, setSelectedPosto] = useState(null);
    const [reports, setReports] = useState([]);

    // Review Modal State
    const [selectedReport, setSelectedReport] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewStatus, setReviewStatus] = useState('approved');
    const [reviewNotes, setReviewNotes] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Initial Load: Fetch Postos
    useEffect(() => {
        fetchPostos();
    }, [token]);

    // Search Filter for Postos
    useEffect(() => {
        if (!searchTerm) {
            setFilteredPostos(postos);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredPostos(postos.filter(p => 
                p.name.toLowerCase().includes(lower) || 
                p.village?.toLowerCase().includes(lower)
            ));
        }
    }, [searchTerm, postos]);

    // Fetch Reports when Posto or Tab changes
    useEffect(() => {
        if (selectedPosto) {
            fetchReports();
        } else {
            setReports([]);
        }
    }, [selectedPosto, activeTab]);

    const fetchPostos = async () => {
        setIsLoadingPostos(true);
        try {
            // Fetch all posts (or first page - scalable solution would use server-side search)
            // For now assuming reasonable number of postos or paginated. 
            // Using existing endpoint.
            const response = await axios.get('/api/kkn/postos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both pagination and raw array
            const data = response.data.data || response.data;
            setPostos(data);
            setFilteredPostos(data);
            
            // Auto-select first posto if available
            if (data.length > 0 && !selectedPosto) {
                setSelectedPosto(data[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data Posko.");
        }
        setIsLoadingPostos(false);
    };

    const fetchReports = async () => {
        if (!selectedPosto) return;
        setIsLoadingReports(true);
        try {
            const response = await axios.get('/api/kkn-reports', {
                params: {
                    kkn_posto_id: selectedPosto.id,
                    type: activeTab
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat laporan.");
        }
        setIsLoadingReports(false);
    };

    const handleOpenReview = (report) => {
        setSelectedReport(report);
        setReviewStatus(report.status === 'draft' || report.status === 'submitted' ? 'approved' : report.status);
        setReviewNotes(report.notes || '');
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            await axios.put(`/api/kkn-reports/${selectedReport.id}/status`, {
                status: reviewStatus,
                notes: reviewNotes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success("Status laporan berhasil diperbarui!");
            setIsReviewModalOpen(false);
            fetchReports();
        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui status laporan.");
        }
        setIsSubmittingReview(false);
    };

    // Components
    const StatusBadge = ({ status }) => {
        let color = 'bg-gray-100 text-gray-600';
        if (status === 'approved') color = 'bg-green-100 text-green-700';
        if (status === 'rejected') color = 'bg-red-100 text-red-700';
        if (status === 'revised') color = 'bg-yellow-100 text-yellow-700';
        if (status === 'submitted') color = 'bg-blue-100 text-blue-700';
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>{status}</span>;
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.32))] gap-6 overflow-hidden">
            {/* Left Sidebar: Posto List */}
            <div className="w-80 bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 mb-3">Daftar Kelompok</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Cari Posko..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoadingPostos ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Memuat posko...</div>
                    ) : filteredPostos.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Tidak ada posko ditemukan.</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredPostos.map(posto => (
                                <button
                                    key={posto.id}
                                    onClick={() => setSelectedPosto(posto)}
                                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center group ${
                                        selectedPosto?.id === posto.id ? 'bg-green-50 text-green-700 border-green-200 border shadow-sm' : 'text-gray-700 border border-transparent'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className={`font-semibold text-sm truncate ${selectedPosto?.id === posto.id ? 'text-green-800' : 'text-gray-800'}`}>
                                            {posto.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center truncate">
                                            <Home size={10} className="mr-1" />
                                            {posto.village || 'Belum ada lokasi'}
                                        </div>
                                    </div>
                                    {selectedPosto?.id === posto.id && (
                                        <ChevronRight size={16} className="text-green-600 flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: Reports */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
                {selectedPosto ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{selectedPosto.name}</h1>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <User size={14} className="mr-1" />
                                    <span>DPL: {selectedPosto.dpl?.name || 'Belum ditentukan'}</span>
                                    <span className="mx-2">•</span>
                                    <span>Desa: {selectedPosto.village}</span>
                                </div>
                            </div>
                            
                            {/* Tabs */}
                            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                                <button
                                    onClick={() => setActiveTab('weekly')}
                                    className={`px-4 py-2 rounded-md transition-all ${
                                        activeTab === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Logbook Mingguan
                                </button>
                                <button
                                    onClick={() => setActiveTab('final')}
                                    className={`px-4 py-2 rounded-md transition-all ${
                                        activeTab === 'final' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Laporan Akhir
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-gray-50">
                            {isLoadingReports ? (
                                <div className="flex items-center justify-center h-40 text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-2"></div>
                                    Memuat data laporan...
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-lg border border-gray-200 border-dashed">
                                    <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                                    <p className="text-gray-500 font-medium">Belum ada {activeTab === 'weekly' ? 'laporan mingguan' : 'laporan akhir'} yang dikumpulkan.</p>
                                </div>
                            ) : activeTab === 'weekly' ? (
                                // Weekly Reports - Expanded Timeline Style
                                <div className="space-y-8 max-w-5xl mx-auto">
                                    {reports.map((report) => (
                                        <div key={report.id} className="relative pl-8 sm:pl-12 group">
                                            {/* Timeline Line */}
                                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 group-last:bottom-auto group-last:h-full"></div>
                                            
                                            {/* Timeline Dot */}
                                            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-white ring-2 ring-gray-100 z-10 font-bold text-xs">
                                                {report.week}
                                            </div>

                                            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                                <div className="p-5 border-b bg-gray-50/50 flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{report.title}</h3>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <User size={14} className="mr-1" /> 
                                                            <span className="font-medium text-gray-700 mr-1">{report.user?.name}</span>
                                                            <span className="mx-2">•</span>
                                                            <Clock size={14} className="mr-1" /> {new Date(report.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={report.status} />
                                                </div>
                                                
                                                <div className="p-6">
                                                    {/* Full Description */}
                                                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                                                        {report.description}
                                                    </div>
                                                    
                                                    {/* Attachments - Displayed Inline */}
                                                    {report.attachments?.length > 0 && (
                                                        <div className="mb-6">
                                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lampiran</h5>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {report.attachments.map(att => (
                                                                    <a 
                                                                        key={att.id} 
                                                                        href={`/storage/${att.file_path}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center p-3 border rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group bg-gray-50 hover:bg-white"
                                                                    >
                                                                        <div className="bg-white p-2 rounded border mr-3 text-blue-600 group-hover:text-blue-700">
                                                                            <FileText size={18} />
                                                                        </div>
                                                                        <div className="overflow-hidden">
                                                                            <div className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">{att.file_name}</div>
                                                                            <div className="text-xs text-gray-400 uppercase">{att.file_type?.split('/')[1] || 'FILE'}</div>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* DPL Notes / Feedback */}
                                                    {report.notes && (
                                                        <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                                            <div className="flex items-start">
                                                                <MessageSquare size={16} className="text-yellow-600 mt-0.5 mr-2" />
                                                                <div>
                                                                    <h5 className="text-xs font-bold text-yellow-800 uppercase mb-1">Catatan Pembimbing</h5>
                                                                    <p className="text-sm text-yellow-800 italic">"{report.notes}"</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Review Action (Only for Dosen) */}
                                                    {user?.role === 'dosen' && (
                                                        <div className="mt-6 pt-4 border-t flex justify-end">
                                                            <button 
                                                                onClick={() => handleOpenReview(report)}
                                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm font-medium"
                                                            >
                                                                <MessageSquare size={16} className="mr-2" />
                                                                Evaluasi Laporan
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Final Reports - Inline Expanded Style (Same as Weekly)
                                <div className="space-y-8 max-w-5xl mx-auto">
                                    {reports.map((report) => (
                                        <div key={report.id} className="">
                                            {/* Header */}
                                            <div className="py-4 border-b border-gray-200 mb-6 flex justify-between items-start">
                                                <div className="flex items-start">
                                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4 border border-green-100">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Laporan Akhir</span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 text-xl">{report.title}</h3>
                                                        <div className="text-sm text-gray-500 flex items-center mt-2">
                                                            <User size={14} className="mr-1" /> 
                                                            <span className="font-medium text-gray-700 mr-1">{report.user?.name}</span>
                                                            <span className="mx-2">•</span>
                                                            <Clock size={14} className="mr-1" /> {new Date(report.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={report.status} />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="">
                                                {/* Full Description */}
                                                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">
                                                    {report.description}
                                                </div>
                                                
                                                {/* Attachments */}
                                                <div className="mb-8">
                                                    <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                                        <Download size={16} className="mr-2" />
                                                        Dokumen Lampiran
                                                    </h5>
                                                    {report.attachments?.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {report.attachments.map(att => (
                                                                <a 
                                                                    key={att.id} 
                                                                    href={`/storage/${att.file_path}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center p-4 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all group bg-gray-50 hover:bg-white"
                                                                >
                                                                    <div className="bg-white p-3 rounded-lg border mr-4 text-blue-600 group-hover:text-blue-700 shadow-sm">
                                                                        <FileText size={20} />
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <div className="text-base font-medium text-gray-900 truncate group-hover:text-blue-700">{att.file_name}</div>
                                                                        <div className="text-xs text-gray-500 uppercase mt-1">{att.file_type?.split('/')[1] || 'FILE'}</div>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-lg border border-dashed text-center">
                                                            Tidak ada dokumen lampiran.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Revision History Timeline */}
                                                {report.histories?.length > 0 && (
                                                    <div className="mt-8 border-t pt-8">
                                                        <h5 className="font-bold text-gray-900 mb-6 flex items-center">
                                                            <Clock size={18} className="mr-2 text-gray-400" />
                                                            Riwayat Evaluasi
                                                        </h5>
                                                        <div className="space-y-6 relative pl-2">
                                                            {/* Vertical Line */}
                                                            <div className="absolute left-2.5 top-2 bottom-4 w-0.5 bg-gray-200"></div>

                                                            {report.histories.map((history, index) => (
                                                                <div key={history.id} className="relative pl-8 group">
                                                                    {/* Dot */}
                                                                    <div className={`
                                                                        absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 border-white ring-2 z-10 
                                                                        flex items-center justify-center
                                                                        ${history.status === 'approved' ? 'bg-green-100 ring-green-100' : ''}
                                                                        ${history.status === 'revised' ? 'bg-yellow-100 ring-yellow-100' : ''}
                                                                        ${history.status === 'rejected' ? 'bg-red-100 ring-red-100' : ''}
                                                                        ${history.status === 'submitted' ? 'bg-blue-100 ring-blue-100' : ''}
                                                                    `}>
                                                                        <div className={`w-2 h-2 rounded-full 
                                                                            ${history.status === 'approved' ? 'bg-green-500' : ''}
                                                                            ${history.status === 'revised' ? 'bg-yellow-500' : ''}
                                                                            ${history.status === 'rejected' ? 'bg-red-500' : ''}
                                                                            ${history.status === 'submitted' ? 'bg-blue-500' : ''}
                                                                        `}></div>
                                                                    </div>

                                                                    <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 transition-all hover:bg-green-50 hover:border-green-200">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <div>
                                                                                <span className={`inline-flex items-center px-0 py-0 rounded text-xs font-bold uppercase mb-0.5
                                                                                    ${history.status === 'approved' ? 'text-green-600' : ''}
                                                                                    ${history.status === 'revised' ? 'text-yellow-600' : ''}
                                                                                    ${history.status === 'rejected' ? 'text-red-600' : ''}
                                                                                    ${history.status === 'submitted' ? 'text-blue-600' : ''}
                                                                                `}>
                                                                                    {history.status}
                                                                                </span>
                                                                                <div className="text-xs text-gray-500">
                                                                                    <span className="font-medium text-gray-900">{history.user?.name}</span>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-xs text-gray-400">
                                                                                {new Date(history.created_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                        {history.note && (
                                                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-2 border-t border-green-100 pt-2">
                                                                                "{history.note}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                {user?.role === 'dosen' && (
                                                    <div className="mt-8 pt-6 border-t flex justify-end">
                                                        <button 
                                                            onClick={() => handleOpenReview(report)}
                                                            className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all font-medium"
                                                        >
                                                            <CheckCircle size={18} className="mr-2" />
                                                            Berikan Evaluasi / Validasi
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Home size={64} className="mb-4 text-gray-200" />
                        <h3 className="text-lg font-medium text-gray-900">Pilih Kelompok (Posko)</h3>
                        <p className="max-w-xs text-center mt-2">
                            Pilih salah satu kelompok dari daftar di sebelah kiri untuk memantau laporan kegiatan mereka.
                        </p>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-start sticky top-0 bg-white z-10">
                            <div>
                                <div className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">
                                    {selectedReport.type === 'weekly' ? 'Laporan Mingguan' : 'Laporan Akhir'}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedReport.title}</h3>
                                <div className="text-sm text-gray-500">
                                    Oleh: {selectedReport.user?.name}
                                </div>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 flex-grow">
                            {/* Report Content */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Isi Laporan</h4>
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap text-sm border leading-relaxed">
                                    {selectedReport.description}
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Lampiran Bukti ({selectedReport.attachments?.length || 0})</h4>
                                {selectedReport.attachments?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedReport.attachments.map(att => (
                                            <a 
                                                key={att.id} 
                                                href={`/storage/${att.file_path}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center p-3 border rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group bg-white"
                                            >
                                                <div className="bg-blue-50 p-2 rounded mr-3 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">{att.file_name}</div>
                                                    <div className="text-xs text-gray-400 uppercase">{att.file_type?.split('/')[1] || 'FILE'}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded text-center">Tidak ada lampiran.</div>
                                )}
                            </div>

                            <hr />

                            {/* Review Form - Only for Dosen */}
                            {user?.role === 'dosen' ? (
                                <form id="review-form" onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
                                        <h4 className="font-semibold text-yellow-800 flex items-center text-sm mb-2">
                                            <MessageSquare size={16} className="mr-2" /> 
                                            Evaluasi Dosen Pembimbing
                                        </h4>
                                        <p className="text-xs text-yellow-700 mb-4">
                                            Berikan penilaian dan masukan untuk mahasiswa. Mahasiswa dapat merevisi laporan berdasarkan masukan Anda.
                                        </p>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-yellow-800 mb-2">Keputusan Validasi</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { value: 'approved', label: 'Valid / Diterima', color: 'green' },
                                                        { value: 'revised', label: 'Perlu Revisi', color: 'yellow' },
                                                        { value: 'rejected', label: 'Ditolak', color: 'red' }
                                                    ].map(option => (
                                                        <label key={option.value} className={`
                                                            flex-1 cursor-pointer border rounded-lg p-2 text-center text-sm transition-all
                                                            ${reviewStatus === option.value 
                                                                ? `bg-${option.color}-50 border-${option.color}-500 text-${option.color}-700 ring-1 ring-${option.color}-500` 
                                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            }
                                                        `}>
                                                            <input 
                                                                type="radio" 
                                                                name="status" 
                                                                value={option.value} 
                                                                checked={reviewStatus === option.value}
                                                                onChange={(e) => setReviewStatus(e.target.value)}
                                                                className="sr-only"
                                                            />
                                                            <span className="font-medium">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-yellow-800 mb-1">Catatan / Masukan</label>
                                                <textarea 
                                                    className="w-full border border-yellow-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                                    rows="3"
                                                    placeholder="Tuliskan masukan untuk perbaikan..."
                                                    value={reviewNotes}
                                                    onChange={(e) => setReviewNotes(e.target.value)}
                                                    required={reviewStatus !== 'approved'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-lg flex items-start border border-blue-100">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 text-sm">Status Validasi</h4>
                                        <div className="mt-2 text-sm">
                                            <div className="flex items-center mb-2">
                                                <span className="text-gray-500 w-24">Status:</span>
                                                <StatusBadge status={selectedReport.status} />
                                            </div>
                                            {selectedReport.notes && (
                                                <div>
                                                    <span className="text-gray-500 block mb-1">Catatan DPL:</span>
                                                    <div className="bg-white p-3 rounded border text-gray-700 italic">
                                                        "{selectedReport.notes}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 sticky bottom-0">
                            <button 
                                type="button"
                                onClick={() => setIsReviewModalOpen(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-white text-sm font-medium transition-colors"
                            >
                                Tutup
                            </button>
                            {user?.role === 'dosen' && (
                                <button 
                                    type="submit"
                                    form="review-form"
                                    disabled={isSubmittingReview}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-all"
                                >
                                    {isSubmittingReview ? 'Menyimpan...' : 'Simpan Evaluasi'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
