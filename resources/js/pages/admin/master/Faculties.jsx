import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/useAuthStore';
import { Building, Plus, Trash2, Edit, Upload, Download } from 'lucide-react';

export default function Faculties() {
    const { token } = useAuthStore();
    const [faculties, setFaculties] = useState([]);
    
    // Form State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchFaculties = async () => {
        try {
            const response = await axios.get('/api/faculties', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFaculties(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchFaculties(); }, [token]);

    const handleEdit = (faculty) => {
        setFormData({ name: faculty.name, code: faculty.code, description: faculty.description || '' });
        setEditId(faculty.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', description: '' });
        setEditId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editId) {
                await axios.put(`/api/faculties/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/faculties', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchFaculties();
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Failed to save faculty. Code must be unique.");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this faculty? This will also delete all associated study programs.")) return;
        try {
            await axios.delete(`/api/faculties/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchFaculties();
        } catch (error) {
            console.error(error);
        }
    };

    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);

        setIsImporting(true);
        try {
            await axios.post('/api/faculties/import', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            alert('Import successful');
            setShowImportModal(false);
            fetchFaculties();
        } catch (error) {
            console.error(error);
            alert('Import failed. Please check the file format.');
        }
        setIsImporting(false);
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get('/api/faculties/template', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'faculties_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download template", error);
            alert("Failed to download template");
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Building className="mr-2 text-green-700" /> Master Data Fakultas
                </h1>
                <div className="flex space-x-2">
                    <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                        <Upload size={18} className="mr-2" /> Import Excel
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                        <Plus size={18} className="mr-2" /> Tambah Fakultas
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Fakultas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {faculties.map(faculty => (
                            <tr key={faculty.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{faculty.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{faculty.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{faculty.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => handleEdit(faculty)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(faculty.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Fakultas' : 'Tambah Fakultas'}</h2>
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kode Fakultas</label>
                                <input type="text" required className="w-full border p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Fakultas</label>
                                <input type="text" required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
                                <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded">{isSubmitting ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}</button>
                            </div>
                         </form>
                    </div>
                 </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Import Fakultas (Excel)</h2>
                            <button onClick={handleDownloadTemplate} className="text-sm text-blue-600 hover:underline flex items-center">
                                <Download size={16} className="mr-1" /> Template
                            </button>
                        </div>
                        <form onSubmit={handleImport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel (.xlsx, .xls, .csv)</label>
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    className="w-full border p-2 rounded"
                                    required 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Unduh template atau pastikan kolom: <strong>code, name, description</strong>
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded">Batal</button>
                                <button type="submit" disabled={isImporting} className="px-4 py-2 bg-blue-600 text-white rounded">{isImporting ? 'Importing...' : 'Import'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
