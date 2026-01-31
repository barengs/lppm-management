import React, { useState } from 'react';
import { FileText, Download, X, ZoomIn, ZoomOut, Eye } from 'lucide-react';

export default function DocumentPreview({ document, title, onClose }) {
    const [zoom, setZoom] = useState(100);
    
    if (!document) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-2 opacity-50" />
                <p>Dokumen tidak tersedia</p>
            </div>
        );
    }

    const fileUrl = `/storage/${document}`;
    const fileExtension = document.split('.').pop().toLowerCase();
    const isPDF = fileExtension === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = document.split('/').pop();
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                        <FileText className="text-blue-600" size={24} />
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isImage && (
                            <>
                                <button
                                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={20} />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                    {zoom}%
                                </span>
                                <button
                                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={20} />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleDownload}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download size={18} />
                            <span>Download</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    {isPDF ? (
                        <iframe
                            src={fileUrl}
                            className="w-full h-full border-0 rounded-lg bg-white"
                            title={title}
                        />
                    ) : isImage ? (
                        <div className="flex items-center justify-center h-full">
                            <img
                                src={fileUrl}
                                alt={title}
                                style={{ 
                                    maxWidth: `${zoom}%`,
                                    maxHeight: `${zoom}%`,
                                    objectFit: 'contain'
                                }}
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FileText size={64} className="mb-4 opacity-50" />
                            <p className="text-lg mb-2">Preview tidak tersedia untuk tipe file ini</p>
                            <p className="text-sm mb-4">Silakan download untuk melihat file</p>
                            <button
                                onClick={handleDownload}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Download size={18} />
                                <span>Download File</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Compact Document Card with Preview Button
export function DocumentCard({ document, title, icon: Icon = FileText, onPreview }) {
    if (!document) {
        return (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <Icon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Tidak ada {title}</p>
            </div>
        );
    }

    const fileExtension = document.split('.').pop().toLowerCase();
    const isPDF = fileExtension === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

    return (
        <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Icon className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-gray-900">{title}</span>
                </div>
                {(isPDF || isImage) && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        {isPDF ? 'PDF' : 'Image'}
                    </span>
                )}
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={onPreview}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                >
                    <Eye size={16} />
                    <span>Preview</span>
                </button>
                <a
                    href={`/storage/${document}`}
                    download
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    title="Download"
                >
                    <Download size={16} />
                </a>
            </div>
        </div>
    );
}
