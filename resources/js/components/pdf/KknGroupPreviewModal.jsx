import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import KknGroupDocument from './KknGroupDocument';

export default function KknGroupPreviewModal({ isOpen, onClose, posto, members }) {
    const [systemSettings, setSystemSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchSystemSettings();
        }
    }, [isOpen]);

    const fetchSystemSettings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/system-settings');
            setSystemSettings(data);
        } catch (err) {
            console.error("Failed to fetch system settings for PDF preview", err);
            setError("Gagal memuat pengaturan sistem. Dokumen akan dicetak dengan format standar.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white w-full h-full max-w-5xl rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            Cetak Laporan Kelompok KKN (PDF)
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Format dokumen resmi LPPM
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-sm transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-green-600" size={40} />
                            <p className="text-sm font-medium text-gray-600">Menyiapkan cetakan PDF...</p>
                        </div>
                    ) : (
                        <div className="w-full h-full">
                            {error && (
                                <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
                                <KknGroupDocument posto={posto} members={members} systemSettings={systemSettings} />
                            </PDFViewer>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="bg-white px-6 py-3 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center shrink-0">
                    <span>* Gunakan tombol unduh/cetak pada panel kontrol PDF di atas.</span>
                    <span className="font-bold text-gray-400 uppercase">Sistem KKN LPPM</span>
                </div>
            </div>
        </div>
    );
}
