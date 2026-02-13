import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { Award, Download, DownloadCloud, AlertCircle } from 'lucide-react';

export default function StudentKknAssessment() {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrade = async () => {
            try {
                const response = await axios.get('/api/kkn-grades/my-grade', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                if (error.response?.status === 404) {
                    setError("Data penilaian belum tersedia atau KKN Anda belum dinyatakan selesai (ACC).");
                } else {
                    setError("Gagal memuat data penilaian.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchGrade();
    }, [token]);

    const handleDownload = () => {
        // Direct download link
        window.open(`/api/kkn-grades/certificate/download?token=${token}`, '_blank');
        // Note: For API auth with token in header, we usually need blob handling. 
        // But for simplicity in PDF stream, we can pass token in query if API allows, 
        // OR better: use axios with blob type.
    };
    
    // Improved Download Handler using Axios Blob
    const downloadBlob = async () => {
        try {
            const response = await axios.get('/api/kkn-grades/certificate/download', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Sertifikat-KKN-${data.student_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Gagal mengunduh sertifikat.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (error || !data) {
        return (
            <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Nilai</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    const { kkn_grade } = data;

    return (
        <div className="max-w-4xl mx-auto mt-8 space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
                <div className="bg-green-600 h-24"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 flex justify-between items-end mb-6">
                        <div className="bg-white p-2 rounded-full shadow-lg">
                            <div className="bg-green-100 p-4 rounded-full">
                                <Award className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        {kkn_grade && (
                            <button 
                                onClick={downloadBlob}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow"
                            >
                                <DownloadCloud size={20} /> Download Sertifikat
                            </button>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Hasil Penilaian KKN</h1>
                    <p className="text-gray-500 mb-6">Tahun Akademik {data.fiscal_year_id}</p>

                    {kkn_grade ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-gray-50 p-6 rounded-lg text-center border">
                                <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Nilai Angka</p>
                                <p className="text-4xl font-bold text-gray-800">{kkn_grade.numeric_score}</p>
                             </div>
                             <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
                                <p className="text-sm text-green-600 uppercase tracking-wide mb-1">Predikat / Nilai Huruf</p>
                                <p className="text-4xl font-bold text-green-700">{kkn_grade.grade}</p>
                             </div>
                             <div className="md:col-span-2 text-center text-sm text-gray-400 mt-2">
                                 Sertifikat No: {kkn_grade.certificate_number}
                             </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-100 rounded p-4 text-yellow-700 text-center">
                            Nilai Anda belum diinput oleh panitia.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
