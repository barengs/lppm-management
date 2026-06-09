import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
    Camera, 
    FileText, 
    Search, 
    Home, 
    User, 
    Clock, 
    ChevronRight, 
    Plus, 
    X, 
    Image as ImageIcon,
    MapPin,
    Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    useGetPostosQuery,
    useGetFieldMonitoringsQuery,
    useCreateFieldMonitoringMutation,
    useDeleteFieldMonitoringMutation,
} from '../../store/api/kknApi';

export default function FieldMonitoring() {
    const { user, hasRole } = useAuth();
    
    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosto, setSelectedPosto] = useState(null);
    
    // Form State
    const [description, setDescription] = useState('');
    const [monitoredAt, setMonitoredAt] = useState(new Date().toISOString().slice(0, 16));
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // RTK Query hooks
    const { data: postosData, isFetching: isPostosLoading } = useGetPostosQuery();
    const { data: monitoringsData, isFetching: isMonitoringsLoading } = useGetFieldMonitoringsQuery(
        selectedPosto ? { kkn_posto_id: selectedPosto.id } : {},
        { skip: !selectedPosto }
    );
    const [createFieldMonitoring, { isLoading: isSubmitting }] = useCreateFieldMonitoringMutation();
    const [deleteFieldMonitoring] = useDeleteFieldMonitoringMutation();

    const postos = useMemo(() => {
        return postosData?.data || postosData || [];
    }, [postosData]);

    const monitorings = useMemo(() => {
        return monitoringsData?.data || monitoringsData || [];
    }, [monitoringsData]);

    // Set initial selected posto
    useEffect(() => {
        if (postos.length > 0 && !selectedPosto) {
            setSelectedPosto(postos[0]);
        }
    }, [postos, selectedPosto]);

    // Filter postos
    const filteredPostos = useMemo(() => {
        if (!searchTerm) return postos;
        const lower = searchTerm.toLowerCase();
        return postos.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            p.location?.name?.toLowerCase().includes(lower) ||
            p.location?.village?.toLowerCase().includes(lower)
        );
    }, [searchTerm, postos]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPosto) return;
        
        const formData = new FormData();
        formData.append('kkn_posto_id', selectedPosto.id);
        formData.append('description', description);
        formData.append('monitored_at', monitoredAt);
        
        selectedImages.forEach((image) => {
            formData.append('images[]', image);
        });

        try {
            await createFieldMonitoring(formData).unwrap();
            toast.success("Laporan monitoring berhasil disimpan");
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.data?.message || error.message || "Gagal menyimpan laporan");
        }
    };

    const resetForm = () => {
        setDescription('');
        setMonitoredAt(new Date().toISOString().slice(0, 16));
        setSelectedImages([]);
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setImagePreviews([]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus laporan monitoring ini?")) return;
        try {
            await deleteFieldMonitoring(id).unwrap();
            toast.success("Laporan berhasil dihapus");
        } catch (error) {
            toast.error(error.data?.message || error.message || "Gagal menghapus laporan");
        }
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.32))] gap-6 overflow-hidden">
            {/* Sidebar: Posto List */}
            <div className="w-80 bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-800 mb-3">Daftar Kelompok</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Cari Posko..."
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {isPostosLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500 animate-pulse">Memuat...</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredPostos.map(posto => (
                                <button
                                    key={posto.id}
                                    onClick={() => setSelectedPosto(posto)}
                                    className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-all ${
                                        selectedPosto?.id === posto.id ? 'bg-green-50 text-green-700 border-green-200 border' : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="font-semibold text-sm truncate">{posto.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center mt-0.5 truncate">
                                            <Home size={10} className="mr-1" />
                                            {posto.location?.village || posto.village || 'Tanpa lokasi'}
                                        </div>
                                    </div>
                                    {selectedPosto?.id === posto.id && <ChevronRight size={16} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
                {selectedPosto ? (
                    <>
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{selectedPosto.name}</h1>
                                <p className="text-sm text-gray-500 mt-1 flex items-center">
                                    <MapPin size={14} className="mr-1" /> {selectedPosto.village || 'Lokasi belum ditentukan'}
                                </p>
                            </div>
                            {(hasRole('admin') || hasRole('tendik') || hasRole('staff_kkn')) && (
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-all"
                                >
                                    <Plus size={18} className="mr-2" />
                                    Tambah Monitoring
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 scrollbar-thin">
                            {isLoadingMonitorings ? (
                                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>
                            ) : monitorings.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
                                    <Camera size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">Belum ada laporan monitoring lapangan independen.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {monitorings.map(item => (
                                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.user?.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                            <Clock size={12} className="mr-1" />
                                                            {new Date(item.monitored_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                {(item.user_id === user.id || hasRole('admin')) && (
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                                                    {item.description}
                                                </div>
                                                {item.images?.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                        {item.images.map(img => (
                                                            <a 
                                                                key={img.id} 
                                                                href={`/storage/${img.file_path}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="aspect-square rounded-lg overflow-hidden border group relative"
                                                            >
                                                                <img 
                                                                    src={`/storage/${img.file_path}`} 
                                                                    alt="Monitoring" 
                                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <ImageIcon className="text-white" />
                                                                </div>
                                                            </a>
                                                        ))}
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
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Home size={64} className="mb-4 text-gray-100" />
                        <h3 className="text-lg font-medium text-gray-900">Pilih Kelompok</h3>
                        <p className="text-sm mt-2">Pilih kelompok di samping untuk melihat monitoring lapangan.</p>
                    </div>
                )}
            </div>

            {/* Add Monitoring Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Tambah Laporan Lapangan</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Posko</label>
                                <input type="text" disabled className="w-full bg-gray-50 border rounded-md p-2.5 text-sm font-medium" value={selectedPosto?.name} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Monitoring</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                    value={monitoredAt}
                                    onChange={(e) => setMonitoredAt(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Temuan & Deskripsi</label>
                                <textarea 
                                    rows="4" 
                                    className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-green-500"
                                    placeholder="Tuliskan temuan di lapangan secara detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Lapangan</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-md border overflow-hidden group">
                                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 cursor-pointer transition-all">
                                        <Camera size={24} />
                                        <span className="text-[10px] font-bold mt-1 uppercase">Ambil</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            capture="environment" 
                                            multiple 
                                            className="hidden" 
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <label className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all">
                                        <Plus size={24} />
                                        <span className="text-[10px] font-bold mt-1 uppercase">File</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            className="hidden" 
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Maksimal 5MB per foto. Gunakan tombol kamera di smartphone untuk memotret langsung.</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex-[2] px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-200 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
