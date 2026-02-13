import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { School, Plus, Trash2, Edit, Upload, Download } from 'lucide-react';
import DataTable from '../../../components/DataTable';

export default function StudyPrograms() {
    const { token } = useAuth();
    const [studyPrograms, setStudyPrograms] = useState([]);
    const [faculties, setFaculties] = useState([]);
    
    // Form State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ faculty_id: '', name: '', code: '', level: 'S1' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchData = async () => {
        try {
            const [prodiResponse, facultiesResponse] = await Promise.all([
                axios.get('/api/study-programs', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/faculties', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStudyPrograms(prodiResponse.data);
            setFaculties(facultiesResponse.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleEdit = (prodi) => {
        setFormData({ 
            faculty_id: prodi.faculty_id, 
            name: prodi.name, 
            code: prodi.code, 
            level: prodi.level 
        });
        setEditId(prodi.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ faculty_id: faculties[0]?.id || '', name: '', code: '', level: 'S1' });
        setEditId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editId) {
                await axios.put(`/api/study-programs/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/study-programs', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchData();
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Failed to save study program. Code must be unique.");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this study program?")) return;
        try {
            await axios.delete(`/api/study-programs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
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
            await axios.post('/api/study-programs/import', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            alert('Import successful');
            setShowImportModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Import failed. Please check the file format and ensure faculty_code is valid.');
        }
        setIsImporting(false);
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get('/api/study-programs/template', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'study_programs_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download template", error);
            alert("Failed to download template");
        }
    };

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'code',
            header: 'Kode',
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.code}</span>
        },
        {
            accessorKey: 'level',
            header: 'Jenjang',
            cell: ({ row }) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    row.original.level === 'S1' ? 'bg-blue-100 text-blue-800' : 
                    row.original.level === 'S2' ? 'bg-purple-100 text-purple-800' : 
                    'bg-gray-100 text-gray-800'
                }`}>
                    {row.original.level}
                </span>
            )
        },
        {
            accessorKey: 'name',
            header: 'Nama Program Studi',
            cell: ({ row }) => <span className="text-gray-700">{row.original.name}</span>
        },
        {
            accessorKey: 'faculty.name',
            header: 'Fakultas',
            cell: ({ row }) => <span className="text-gray-500">{row.original.faculty?.name || '-'}</span>
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(row.original)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.original.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <School className="mr-2 text-green-700" /> Master Data Program Studi
                </h1>
                <div className="flex space-x-2">
                    <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                        <Upload size={18} className="mr-2" /> Import Excel
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                        <Plus size={18} className="mr-2" /> Tambah Prodi
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={studyPrograms} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari program studi...',
                        emptyMessage: 'Tidak ada data program studi'
                    }} 
                />
            </div>

            {/* Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Prodi' : 'Tambah Prodi'}</h2>
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fakultas</label>
                                <select 
                                    className="w-full border p-2 rounded" 
                                    value={formData.faculty_id} 
                                    onChange={e => setFormData({...formData, faculty_id: e.target.value})}
                                    required
                                >
                                    <option value="">Pilih Fakultas</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex space-x-4">
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium text-gray-700">Kode</label>
                                    <input type="text" required className="w-full border p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                </div>
                                <div className="w-2/3">
                                    <label className="block text-sm font-medium text-gray-700">Jenjang</label>
                                    <select className="w-full border p-2 rounded" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                                        <option value="D3">D3</option>
                                        <option value="S1">S1</option>
                                        <option value="S2">S2</option>
                                        <option value="S3">S3</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Program Studi</label>
                                <input type="text" required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
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
                            <h2 className="text-xl font-bold">Import Prodi (Excel)</h2>
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
                                    Kolom wajib: <strong>code, name, level, faculty_code</strong>
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
