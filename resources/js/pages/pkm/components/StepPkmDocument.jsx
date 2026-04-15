import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DOCUMENT_TYPES = [
    { key: 'surat_orisinalitas', label: 'Surat Pernyataan Orisinalitas', required: true },
    { key: 'mou_mitra',          label: 'Surat MoU / Perjanjian Kerjasama Mitra', required: true },
    { key: 'surat_pernyataan',   label: 'Surat Pernyataan Ketua Pengusul', required: false },
    { key: 'dokumen_lainnya',    label: 'Dokumen Pendukung Lainnya', required: false },
];

export default function StepPkmDocument({ proposalId, token, onNext, onBack, initialData }) {
    const [docs,     setDocs]     = useState({});
    const [uploading, setUploading] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error,    setError]    = useState(null);

    useEffect(() => {
        if (initialData?.documents) {
            const docMap = {};
            initialData.documents.forEach(d => { docMap[d.document_type] = d; });
            setDocs(docMap);
        }
    }, [initialData]);

    const handleUpload = async (docType, file) => {
        if (!file) return;
        setUploading(u => ({ ...u, [docType]: true }));
        const formData = new FormData();
        formData.append('document_type', docType);
        formData.append('file', file);
        try {
            const res = await axios.post(
                `/api/pkm-proposals/${proposalId}/upload-document`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            setDocs(d => ({ ...d, [docType]: res.data }));
            toast.success(`Dokumen "${DOCUMENT_TYPES.find(dt => dt.key === docType)?.label}" berhasil diunggah.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengunggah dokumen.');
        } finally {
            setUploading(u => ({ ...u, [docType]: false }));
        }
    };

    const handleSubmit = async () => {
        // Check required docs
        const missing = DOCUMENT_TYPES.filter(dt => dt.required && !docs[dt.key]);
        if (missing.length > 0) {
            setError(`Dokumen wajib belum diunggah: ${missing.map(m => m.label).join(', ')}`);
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            // Advance step 7
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 7 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
            )}

            <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <strong className="text-yellow-700">📎 Dokumen Pendukung:</strong> Unggah dokumen yang diperlukan sebelum menyelesaikan pengisian. Format yang diterima: PDF, DOC, DOCX (maks. 10 MB).
            </div>

            <div className="space-y-4">
                {DOCUMENT_TYPES.map(dt => {
                    const uploaded = docs[dt.key];
                    const isUploading = uploading[dt.key];
                    return (
                        <div key={dt.key} className={`border rounded-xl p-5 flex items-center gap-4 ${uploaded ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {uploaded ? <CheckCircle size={20} className="text-green-600" /> : <FileText size={20} className="text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-gray-800">
                                    {dt.label}
                                    {dt.required && <span className="ml-1.5 text-xs text-red-500 font-semibold">(Wajib)</span>}
                                </div>
                                {uploaded && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-green-700 font-medium truncate max-w-xs">{uploaded.original_name || 'Berhasil diunggah'}</span>
                                        <a href={`/storage/${uploaded.file_path}`} target="_blank" rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                                            <ExternalLink size={11} /> Lihat
                                        </a>
                                    </div>
                                )}
                            </div>
                            <label className={`cursor-pointer shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                isUploading ? 'bg-gray-100 text-gray-400' : uploaded ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}>
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                                    onChange={e => handleUpload(dt.key, e.target.files[0])}
                                    disabled={isUploading} />
                                {isUploading ? 'Mengunggah...' : uploaded ? '🔄 Ganti' : <span className="flex items-center gap-1"><Upload size={12} /> Unggah</span>}
                            </label>
                        </div>
                    );
                })}
            </div>

            {/* Summary Data */}
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <h4 className="font-bold text-gray-700 text-sm mb-3">📋 Ringkasan Proposal PKM</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-gray-500 text-xs">Judul</span>
                        <p className="font-medium text-gray-800 mt-0.5">{initialData?.title || '-'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Tahun Anggaran</span>
                        <p className="font-medium text-gray-800 mt-0.5">{initialData?.fiscal_year?.year || '-'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Total Anggaran</span>
                        <p className="font-bold text-emerald-700 mt-0.5">
                            Rp {(initialData?.budget || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Tim Pengusul</span>
                        <p className="font-medium text-gray-800 mt-0.5">
                            {initialData?.personnel?.length || 0} anggota
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Jumlah Mitra</span>
                        <p className="font-medium text-gray-800 mt-0.5">
                            {initialData?.partners?.length || 0} mitra
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Luaran Dijanjikan</span>
                        <p className="font-medium text-gray-800 mt-0.5">
                            {initialData?.outputs?.length || 0} luaran
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-2">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold">
                    ← Kembali
                </button>
                <button type="button" onClick={handleSubmit} disabled={submitting}
                    className="px-8 py-2.5 bg-emerald-700 text-white rounded-lg font-bold shadow hover:bg-emerald-800 transition-all disabled:opacity-50 text-sm">
                    {submitting ? 'Memproses...' : 'Selesai & Lihat Preview →'}
                </button>
            </div>
        </div>
    );
}
