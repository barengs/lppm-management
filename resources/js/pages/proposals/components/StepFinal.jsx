import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, AlertTriangle, FileText, Users, DollarSign, Target } from 'lucide-react';

export default function StepFinal({ proposalId, token, onBack, initialData }) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

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
            <div className="bg-gray-900 p-8 rounded-sm text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Send size={150} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Konfirmasi Akhir Usulan</h2>
                    <p className="text-gray-400 text-sm max-w-xl">
                        Seluruh data usulan telah terisi. Harap tinjau kembali ringkasan di bawah ini sebelum mengirimkan usulan ke LPPM. 
                        Setelah dikirim, usulan tidak dapat diubah lagi kecuali dikembalikan oleh admin.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-gray-100 rounded-sm bg-gray-50 flex items-center">
                    <div className="p-2 bg-green-100 text-green-700 rounded-full mr-3"><FileText size={20} /></div>
                    <div>
                        <p className="font-bold text-gray-500 uppercase tracking-tighter">Judul Usulan</p>
                        <p className="font-bold text-gray-900">{initialData?.title}</p>
                    </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-sm bg-gray-50 flex items-center">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-full mr-3"><Users size={20} /></div>
                    <div>
                        <p className="font-bold text-gray-500 uppercase tracking-tighter">Personil</p>
                        <p className="font-bold text-gray-900">Ketua + {initialData?.personnel?.length - 1} Anggota</p>
                    </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-sm bg-gray-50 flex items-center">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full mr-3"><DollarSign size={20} /></div>
                    <div>
                        <p className="font-bold text-gray-500 uppercase tracking-tighter">Total Anggaran</p>
                        <p className="font-bold text-gray-900">Rp {parseInt(initialData?.budget || 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-sm bg-gray-50 flex items-center">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-full mr-3"><Target size={20} /></div>
                    <div>
                        <p className="font-bold text-gray-500 uppercase tracking-tighter">Luaran</p>
                        <p className="font-bold text-gray-900">{initialData?.outputs?.length} Target Luaran</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-sm flex items-start border border-red-200">
                    <AlertTriangle className="mr-3 mt-0.5" size={20} />
                    <div>
                        <p className="font-bold text-sm">Gagal Mengirim Proposal</p>
                        <p className="text-xs">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="px-8 py-3 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Kembali Ke Substansi
                </button>
                <button
                    onClick={handleSubmitProposal}
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-green-700 text-white rounded-sm text-base font-bold shadow-2xl hover:bg-green-800 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center"
                >
                    {isSubmitting ? 'Mengirim...' : (
                        <>
                            <Send size={20} className="mr-2" /> KIRIM PROPOSAL SEKARANG
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
