import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFViewer } from '@react-pdf/renderer';
import { X, Loader2, AlertCircle } from 'lucide-react';
import ProposalDocument from './ProposalDocument';
import { useAuth } from '../../hooks/useAuth';

export default function FullProposalPreviewModal({ isOpen, onClose, proposalId, type = 'research' }) {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && proposalId) {
            fetchData();
        }
    }, [isOpen, proposalId]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch Proposal Data
            const endpoint = type === 'research' ? `/api/proposals/${proposalId}` : `/api/pkm-proposals/${proposalId}`;
            const [proposalRes, settingsRes] = await Promise.all([
                axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/proposal-cover-settings', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setData(proposalRes.data);
            setSettings(settingsRes.data);
        } catch (err) {
            console.error("Failed to fetch data for PDF preview", err);
            setError("Gagal memuat data usulan. Pastikan Anda memiliki koneksi internet dan izin akses.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full h-full max-w-6xl rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gray-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Pratinjau Proposal Berbasis PDF
                        </h3>
                        {data && (
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 truncate max-w-xl">
                                {data.title}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-green-600" size={48} />
                            <p className="text-sm font-medium text-gray-500">Mempersiapkan dokumen PDF...</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-sm border border-red-100">
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                            <p className="text-gray-800 font-bold mb-2">Kesalahan Terjadi</p>
                            <p className="text-sm text-gray-500">{error}</p>
                            <button 
                                onClick={fetchData}
                                className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-bold"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full">
                            <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
                                <ProposalDocument data={data} settings={settings} type={type} />
                            </PDFViewer>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="bg-white px-6 py-2 border-t border-gray-200 text-[10px] text-gray-400 flex justify-between items-center">
                    <span>* Gunakan toolbar di atas untuk zoom, putar, atau mengunduh file.</span>
                    <span className="font-bold text-gray-300 uppercase">LPPM Digital System</span>
                </div>
            </div>
        </div>
    );
}
