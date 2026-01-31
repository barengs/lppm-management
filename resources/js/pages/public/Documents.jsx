import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get('/api/documents/public');
                setDocuments(response.data);
            } catch (error) {
                console.error("Failed to fetch documents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const filteredDocs = documents.filter(doc => {
        const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || doc.type === filterType;
        return matchSearch && matchType;
    });

    const getIcon = (type) => {
        switch(type) {
            case 'guide': return <FileText className="text-blue-500" />;
            case 'template': return <FileText className="text-green-500" />;
            case 'sk': return <FileText className="text-purple-500" />;
            default: return <FileText className="text-gray-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'guide': return 'Panduan';
            case 'template': return 'Template';
            case 'sk': return 'SK / Legal';
            default: return type.toUpperCase();
        }
    };

    // Detail & Preview State
    const [selectedDoc, setSelectedDoc] = useState(null);

    const openDetail = (doc) => setSelectedDoc(doc);
    const closeDetail = () => setSelectedDoc(null);

    const isPdf = (path) => path?.toLowerCase().endsWith('.pdf');
    const isImage = (path) => /\.(jpg|jpeg|png|webp)$/i.test(path);

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800">
             {/* Header Section */}
             <div className="bg-green-900 text-white pt-12 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <Link to="/" className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors text-sm uppercase tracking-wider font-semibold">
                        <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-light mb-2 tracking-tight">Berkas Unduhan</h1>
                    <p className="text-green-100 max-w-2xl font-light text-lg opacity-80">
                        Pusat unduhan dokumen resmi, panduan, template, dan SK LPPM UIM.
                    </p>
                </div>
            </div>

            {/* Search & Filter Strip */}
            <div className="border-b border-gray-200 sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row">
                        {/* Search */}
                        <div className="relative flex-grow md:max-w-md border-r border-gray-100">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 pl-2">
                                <Search size={20} />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Cari dokumen..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-800"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex overflow-x-auto">
                            {['all', 'guide', 'template', 'sk'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-6 py-4 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                                        filterType === type 
                                            ? 'border-yellow-500 text-gray-900 bg-yellow-50' 
                                            : 'border-transparent text-gray-500 hover:text-green-800 hover:bg-gray-50'
                                    }`}
                                >
                                    {type === 'all' ? 'Semua' : getTypeLabel(type)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin h-8 w-8 border-2 border-green-900 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 uppercase tracking-widest text-xs">Memuat data...</p>
                    </div>
                ) : filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map((doc) => (
                            <div key={doc.id} className="group bg-white p-6 border rounded-xl hover:shadow-lg hover:border-green-600 transition-all relative flex flex-col h-full cursor-pointer" onClick={() => openDetail(doc)}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-full ${
                                         doc.type === 'guide' ? 'bg-blue-50 text-blue-600' :
                                         doc.type === 'template' ? 'bg-green-50 text-green-600' :
                                         'bg-purple-50 text-purple-600'
                                    }`}>
                                        <FileText size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                        doc.type === 'guide' ? 'border-blue-100 text-blue-800 bg-blue-50' :
                                        doc.type === 'template' ? 'border-green-100 text-green-800 bg-green-50' :
                                        'border-purple-100 text-purple-800 bg-purple-50'
                                    }`}>
                                        {getTypeLabel(doc.type)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight group-hover:text-green-700 transition-colors line-clamp-2">
                                    {doc.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                    {doc.description || 'Tidak ada deskripsi.'}
                                </p>
                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {new Date(doc.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                    </span>
                                    <span className="text-green-600 text-xs font-bold uppercase tracking-widest flex items-center group-hover:underline">
                                        Lihat Detail
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-gray-300 rounded-xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                            <AlertCircle className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Tidak ada dokumen</h3>
                        <p className="text-gray-500">Hasil pencarian tidak ditemukan.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={closeDetail}>
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-100">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                        selectedDoc.type === 'guide' ? 'border-blue-100 text-blue-800 bg-blue-50' :
                                        selectedDoc.type === 'template' ? 'border-green-100 text-green-800 bg-green-50' :
                                        'border-purple-100 text-purple-800 bg-purple-50'
                                    }`}>
                                        {getTypeLabel(selectedDoc.type)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(selectedDoc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedDoc.title}</h2>
                            </div>
                            <button onClick={closeDetail} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Left: Description */}
                            <div className="w-full lg:w-1/3 p-6 overflow-y-auto border-r border-gray-100 bg-gray-50">
                                <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-4">Deskripsi Dokumen</h3>
                                <p className="text-gray-700 leading-relaxed mb-8">
                                    {selectedDoc.description || 'Tidak ada deskripsi tersedia.'}
                                </p>
                                
                                <div className="space-y-3">
                                    <a 
                                        href={selectedDoc.file_path} 
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        <Download size={18} className="mr-2" /> Download File
                                    </a>
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div className="w-full lg:w-2/3 bg-gray-100 flex items-center justify-center p-4 relative">
                                {isPdf(selectedDoc.file_path) ? (
                                    <iframe src={selectedDoc.file_path} className="w-full h-full border-none rounded shadow-sm bg-white" title="Preview"></iframe>
                                ) : isImage(selectedDoc.file_path) ? (
                                    <img src={selectedDoc.file_path} alt="Preview" className="max-w-full max-h-full object-contain shadow-sm" />
                                ) : (
                                    <div className="text-center p-12">
                                        <div className="bg-white p-6 rounded-full inline-block shadow-sm mb-4">
                                            <FileText size={48} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Pratinjau Tidak Tersedia</h3>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Format file ini tidak dapat ditampilkan langsung. Silakan unduh file untuk melihat isinya.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
