import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';
import { FileText, Plus, Trash2, Download, Edit } from 'lucide-react';

export default function DocumentsIndex() {
    const { token } = useAuthStore();
    const [documents, setDocuments] = useState([]);
    
    // Upload/Edit State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: 'guide', description: '' });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('/api/documents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchDocuments(); }, [token]);

    const handleEdit = (doc) => {
        setFormData({ title: doc.title, type: doc.type, description: doc.description || '' });
        setEditId(doc.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ title: '', type: 'guide', description: '' });
        setFile(null);
        setEditId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editId && !file) { alert("Please select a file"); return; }
        
        setIsSubmitting(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description || '');
        data.append('type', formData.type);
        if (file) {
             data.append('file_path', file); 
        }

        try {
            if (editId) {
                data.append('_method', 'PUT'); // Method spoofing for file update
                await axios.post(`/api/documents/${editId}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post('/api/documents', data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchDocuments();
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Upload/Update failed");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this document?")) return;
        try {
            await axios.delete(`/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchDocuments();
        } catch (error) {
            console.error(error);
        }
    };

    // Preview State
    const [previewDoc, setPreviewDoc] = useState(null);

    const handlePreview = (doc) => {
        setPreviewDoc(doc);
    };

    const isPdf = (path) => path?.toLowerCase().endsWith('.pdf');
    const isImage = (path) => /\.(jpg|jpeg|png|webp)$/i.test(path);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FileText className="mr-2 text-green-700" /> Dokumen & Arsip
                </h1>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <Plus size={18} className="mr-2" /> Upload Dokumen
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Dokumen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                    <div className="flex items-center space-x-3 mt-1">
                                        {doc.file_path && (
                                            <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                                                <Download size={12} className="mr-1" /> Download
                                            </a>
                                        )}
                                        <button onClick={() => handlePreview(doc)} className="text-xs text-gray-500 hover:text-green-600 flex items-center">
                                            <FileText size={12} className="mr-1" /> Preview
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{doc.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{doc.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex justify-end">
                                    <button onClick={() => handleEdit(doc)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Upload/Edit Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Dokumen' : 'Upload Dokumen'}</h2>
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul</label>
                                <input type="text" required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
                                <textarea className="w-full border p-2 rounded" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe</label>
                                <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="guide">Panduan</option>
                                    <option value="template">Template</option>
                                    <option value="sk">SK / Legal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">File {editId && '(Opsional, biarkan kosong jika tidak diganti)'}</label>
                                <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full border p-2 rounded" {...(!editId && { required: true })} />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded">{isSubmitting ? 'Menyimpan...' : (editId ? 'Update' : 'Upload')}</button>
                            </div>
                         </form>
                    </div>
                 </div>
            )}

            {/* Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg w-full max-w-4xl h-[85vh] flex flex-col relative">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg">{previewDoc.title}</h3>
                            <button onClick={() => setPreviewDoc(null)} className="text-gray-500 hover:text-red-500">Close</button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-4 overflow-hidden flex items-center justify-center">
                            {isPdf(previewDoc.file_path) ? (
                                <iframe src={previewDoc.file_path} className="w-full h-full border-none rounded" title="Preview"></iframe>
                            ) : isImage(previewDoc.file_path) ? (
                                <img src={previewDoc.file_path} alt="Preview" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="text-center p-10">
                                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 mb-4">Pratinjau tidak tersedia untuk format file ini.</p>
                                    <a href={previewDoc.file_path} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        <Download size={16} className="mr-2" /> Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
