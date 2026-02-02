import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { FileText, Calendar, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function StudentKknReports() {
    const { token } = useAuthStore();
    const [posto, setPosto] = useState(null);
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('weekly'); // weekly | final
    
    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [week, setWeek] = useState(1);
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Fetch Posto
    useEffect(() => {
        const fetchPosto = async () => {
             // ... Similar to Guidance, assume we have a helper or just call API
             try {
                const response = await axios.get('/api/dashboard/kkn/my-posto', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosto(response.data.posto);
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || 'Gagal memuat informasi posko.');
            }
        };
        fetchPosto();
    }, [token]);

    // 2. Fetch Reports
    useEffect(() => {
        if (posto) {
            fetchReports();
        }
    }, [posto, activeTab]);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/kkn-reports', {
                params: {
                    kkn_posto_id: posto.id,
                    type: activeTab,
                    // If weekly, maybe filter by week? No, list all.
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('kkn_posto_id', posto.id);
            formData.append('type', activeTab);
            formData.append('title', title);
            formData.append('description', description);
            if (activeTab === 'weekly') {
                formData.append('week', week);
            }
            // Attachments
            for (let i = 0; i < files.length; i++) {
                formData.append('attachments[]', files[i]);
            }

            await axios.post('/api/kkn-reports', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsModalOpen(false);
            resetForm();
            fetchReports();
            alert("Laporan berhasil dikirim!");
        } catch (error) {
            console.error(error);
            alert("Gagal mengirim laporan.");
        }
        setIsSubmitting(false);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setWeek(1);
        setFiles([]);
    };

    // Detail State
    const [selectedReport, setSelectedReport] = useState(null);

    // Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'created_at',
            header: 'Tanggal Submit',
            cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        },
        {
            accessorKey: 'title',
            header: 'Judul Laporan',
            cell: ({ row }) => (
                <div>
                     <div className="font-medium text-gray-900">{row.original.title}</div>
                     {activeTab === 'weekly' && <div className="text-xs text-gray-500">Minggu ke-{row.original.week}</div>}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => {
                const status = getValue();
                let color = 'bg-gray-100 text-gray-600';
                if (status === 'approved') color = 'bg-green-100 text-green-700';
                if (status === 'rejected') color = 'bg-red-100 text-red-700';
                if (status === 'revised') color = 'bg-yellow-100 text-yellow-700';
                
                return <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>{status}</span>
            }
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <button 
                    onClick={() => setSelectedReport(row.original)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Lihat Detail
                </button>
            )
        }
    ], [activeTab]);

    if (!posto) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Data Laporan Belum Tersedia</p>
                <p className="text-sm text-gray-400 mt-1">{error || "Memuat data kelompok..."}</p>
            </div>
        );
    }

    return (
         <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                <button 
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'weekly' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    <Calendar className="inline-block mr-2 h-4 w-4" /> Laporan Mingguan
                </button>
                <button 
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'final' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('final')}
                >
                    <FileText className="inline-block mr-2 h-4 w-4" /> Laporan Akhir
                </button>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    {activeTab === 'weekly' ? 'Daftar Laporan Mingguan' : 'Laporan Akhir KKN'}
                </h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center shadow-sm"
                >
                    <Upload size={18} className="mr-2" /> 
                    {activeTab === 'weekly' ? 'Buat Laporan Mingguan' : 'Upload Laporan Akhir'}
                </button>
            </div>

            {/* List */}
            <div className="bg-white shadow rounded-lg p-4">
                 <DataTable 
                    data={reports} 
                    columns={columns}
                    options={{
                        enablePagination: true,
                        searchPlaceholder: 'Cari laporan...',
                        emptyMessage: 'Belum ada laporan yang dikirim.'
                    }}
                 />
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4 capitalize">
                            {activeTab === 'weekly' ? 'Input Laporan Mingguan' : 'Submit Laporan Akhir'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'weekly' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Minggu Ke-</label>
                                    <input 
                                        type="number" min="1" max="20"
                                        className="w-full border rounded p-2"
                                        value={week} onChange={(e) => setWeek(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">Judul Kegiatan / Laporan</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded p-2"
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder={activeTab === 'weekly' ? "Contoh: Sosialisasi Hidup Sehat..." : "Laporan Akhir KKN Kelompok XX"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Deskripsi & Hasil</label>
                                <textarea 
                                    className="w-full border rounded p-2 h-32"
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Jelaskan detail kegiatan, hambatan, dan hasil..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Dokumen / Foto Bukti</label>
                                <input 
                                    type="file" multiple
                                    className="w-full border rounded p-2 text-sm"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Dapat upload multiple file (Foto/PDF). Max 10MB.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Batal</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b flex justify-between items-start">
                            <div>
                                <div className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">
                                    {selectedReport.type === 'weekly' ? `Laporan Minggu ke-${selectedReport.week}` : 'Laporan Akhir'}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedReport.title}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    Diajukan: {new Date(selectedReport.created_at).toLocaleString('id-ID')}
                                </div>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                            {/* Status Section */}
                            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Status Review</div>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize 
                                            ${selectedReport.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                              selectedReport.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                              selectedReport.status === 'revised' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {selectedReport.status}
                                        </span>
                                    </div>
                                </div>
                                {selectedReport.notes && (
                                    <div className="flex-grow border-l pl-4">
                                        <div className="text-sm font-medium text-gray-500">Catatan Reviewer</div>
                                        <p className="text-sm text-gray-800 mt-1">{selectedReport.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Deskripsi & Hasil Kegiatan</h4>
                                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                    {selectedReport.description}
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Lampiran / Bukti ({selectedReport.attachments?.length || 0})</h4>
                                {selectedReport.attachments && selectedReport.attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedReport.attachments.map(att => (
                                            <a 
                                                key={att.id} 
                                                href={`/storage/${att.file_path}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center p-3 border rounded hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="bg-gray-100 p-2 rounded mr-3">
                                                    <FileText size={20} className="text-gray-500" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-medium text-blue-600 truncate group-hover:underline">{att.file_name}</div>
                                                    <div className="text-xs text-gray-400 uppercase">{att.file_type?.split('/')[1] || 'FILE'}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Tidak ada lampiran.</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
         </div>
    );
}
