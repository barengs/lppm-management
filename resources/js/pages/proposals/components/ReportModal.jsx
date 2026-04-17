import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, FileText, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';

export default function ReportModal({ isOpen, onClose, proposalId, title, type = 'research' }) {
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Form State
    const [reportType, setReportType] = useState('progress');
    const [file, setFile] = useState(null);
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (isOpen && proposalId) {
            fetchReports();
        }
    }, [isOpen, proposalId]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const params = type === 'research' ? { proposal_id: proposalId } : { pkm_proposal_id: proposalId };
            const res = await axios.get('/api/reports', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Pilih file PDF laporan terlebih dahulu.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        if (type === 'research') {
            formData.append('proposal_id', proposalId);
        } else {
            formData.append('pkm_proposal_id', proposalId);
        }
        formData.append('type', reportType);
        formData.append('file', file);
        formData.append('comments', comments);

        try {
            await axios.post('/api/reports', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Laporan berhasil diunggah!");
            setFile(null);
            setComments('');
            fetchReports();
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal mengunggah laporan.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-green-700 p-4 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-bold">Laporan Kemajuan & Akhir</h3>
                        <p className="text-[10px] text-green-100 mt-1 uppercase line-clamp-1">{title}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-green-800 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[500px]">
                    {/* Left Side: Upload Form */}
                    <div className="w-full md:w-1/2 p-6 border-r border-gray-100 overflow-y-auto">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Unggah Laporan Baru</h4>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Laporan</label>
                                <select 
                                    className="w-full border-gray-300 rounded-sm text-sm focus:ring-green-500"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="progress">Laporan Kemajuan</option>
                                    <option value="final">Laporan Akhir</option>
                                    <option value="monev">Laporan Monev</option>
                                    <option value="logbook">Logbook / Catatan Harian</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">File Laporan (PDF, Max 10MB)</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-sm p-4 text-center hover:border-green-400 transition-colors">
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        className="hidden" 
                                        id="report-file" 
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                    <label htmlFor="report-file" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="text-gray-300 mb-2" size={32} />
                                        <span className="text-xs text-gray-500">{file ? file.name : "Klik untuk pilih file PDF"}</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Keterangan / Catatan</label>
                                <textarea 
                                    className="w-full border-gray-300 rounded-sm text-sm focus:ring-green-500"
                                    rows={3}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Opsional: Tambahkan catatan untuk reviewer..."
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-2 bg-green-700 text-white rounded-sm font-bold text-sm shadow-md hover:bg-green-800 disabled:opacity-50 flex justify-center items-center"
                            >
                                {isUploading ? "Mengunggah..." : "Unggah Laporan"}
                            </button>
                        </form>
                    </div>

                    {/* Right Side: History List */}
                    <div className="w-full md:w-1/2 p-6 bg-gray-50 overflow-y-auto">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Riwayat Laporan</h4>
                        {isLoading ? (
                            <div className="py-10 text-center text-xs text-gray-400">Memuat riwayat...</div>
                        ) : reports.length === 0 ? (
                            <div className="py-10 text-center">
                                <FileText className="mx-auto text-gray-200 mb-2" size={32} />
                                <p className="text-xs text-gray-400 italic text-center px-4">Belum ada laporan yang diunggah untuk usulan ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map(rep => (
                                    <div key={rep.id} className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                                                rep.type === 'progress' ? 'bg-blue-100 text-blue-700' : 
                                                rep.type === 'final' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {rep.type}
                                            </span>
                                            <span className={`text-[9px] font-bold uppercase ${
                                                rep.status === 'approved' ? 'text-green-600' : 
                                                rep.status === 'revision' ? 'text-red-600' : 'text-yellow-600'
                                            }`}>
                                                {rep.status === 'approved' ? 'Disetujui' : 
                                                 rep.status === 'revision' ? 'Perlu Revisi' : 'Menunggu Review'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-800 truncate pr-6" title={rep.original_name}>
                                            {rep.original_name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">Diunggah: {new Date(rep.created_at).toLocaleDateString()}</p>
                                        
                                        {rep.comments && (
                                            <div className="mt-2 p-1.5 bg-yellow-50 border-l-2 border-yellow-400 text-[10px] text-yellow-700 italic">
                                                "{rep.comments}"
                                            </div>
                                        )}

                                        <a 
                                            href={`/api/reports/${rep.id}/download?token=${token}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-3 right-3 text-gray-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Download PDF"
                                        >
                                            <Download size={14} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
