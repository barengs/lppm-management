import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StepUpload({ proposalId, token, onBack, initialData }) {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Pilih file PDF terlebih dahulu.");
            return;
        }

        setIsSaving(true);
        setError(null);
        const formData = new FormData();
        formData.append('step', 5);
        formData.append('file_proposal', file);

        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsSaving(false);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengunggah dokumen.");
            setIsSaving(false);
        }
    };

    const handleSubmitProposal = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Proposal berhasil dikirim ke LPPM!");
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengirim proposal.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-green-50 p-6 rounded-sm border border-green-100 flex items-start">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                    <FileText className="text-green-700" size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900 border-b pb-1 mb-2">Unggah Substansi Proposal</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Silakan unggah dokumen substansi utuh dalam format <strong>PDF</strong> (Maksimal 5MB). 
                        Pastikan isi dokumen sesuai dengan template yang disediakan oleh LPPM.
                    </p>
                </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-sm p-8 bg-gray-50 hover:bg-white transition-colors">
                <div className="flex flex-col items-center justify-center">
                    <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Klik untuk unggah</span> atau drag and drop</p>
                        <p className="text-xs text-gray-400">PDF ONLY (MAX. 5MB)</p>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                        />
                    </label>
                    {file && (
                        <div className="mt-4 p-3 bg-white border border-green-200 rounded-sm flex items-center shadow-sm">
                            <FileText size={20} className="text-green-600 mr-2" />
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">{file.name}</p>
                                <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!success ? (
                <div className="flex justify-center">
                    <button
                        onClick={handleUpload}
                        disabled={isSaving || !file}
                        className="px-10 py-3 bg-green-700 text-white rounded-sm text-sm font-bold shadow-lg hover:bg-green-800 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Mengunggah...' : 'Upload Dokumen Sekarang'}
                    </button>
                </div>
            ) : (
                <div className="bg-green-700 p-6 rounded-sm text-white flex items-center justify-between shadow-xl">
                    <div className="flex items-center">
                        <CheckCircle size={32} className="mr-4 text-green-300" />
                        <div>
                            <p className="font-bold text-lg">Dokumen Berhasil Diunggah!</p>
                            <p className="text-xs text-green-100">Semua tahapan pengajuan telah lengkap.</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-sm flex items-start">
                    <AlertTriangle className="mr-2 mt-0.5" size={18} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Kembali
                </button>
                <div className="space-x-4">
                    <button
                        onClick={handleSubmitProposal}
                        disabled={!success || isSubmitting}
                        className={`px-10 py-3 rounded-sm text-sm font-bold shadow-xl transition-all ${success ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? 'Mengirim...' : 'SUBMIT PROPOSAL KE LPPM'}
                    </button>
                </div>
            </div>
        </div>
    );
}
