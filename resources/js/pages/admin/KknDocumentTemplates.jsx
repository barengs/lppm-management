import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function KknDocumentTemplates() {
    const [templates, setTemplates] = useState([]);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [selectedFy, setSelectedFy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        is_required: true,
        description: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchFiscalYears();
    }, []);

    useEffect(() => {
        if (selectedFy) {
            fetchTemplates();
        }
    }, [selectedFy]);

    const fetchFiscalYears = async () => {
        try {
            const response = await api.get('/fiscal-years');
            setFiscalYears(response.data);
            
            // Auto-select active fiscal year
            const active = response.data.find(fy => fy.is_active);
            if (active) {
                setSelectedFy(active.id);
            }
        } catch (error) {
            toast.error('Gagal memuat tahun akademik');
        }
    };

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/kkn-document-templates?fiscal_year_id=${selectedFy}`);
            setTemplates(response.data);
        } catch (error) {
            toast.error('Gagal memuat template dokumen');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const payload = {
                ...formData,
                fiscal_year_id: selectedFy
            };

            if (editingId) {
                await api.put(`/admin/kkn-document-templates/${editingId}`, payload);
                toast.success('Template berhasil diupdate');
            } else {
                await api.post('/admin/kkn-document-templates', payload);
                toast.success('Template berhasil ditambahkan');
            }

            resetForm();
            fetchTemplates();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan template');
        }
    };

    const handleEdit = (template) => {
        setEditingId(template.id);
        setFormData({
            name: template.name,
            is_required: template.is_required,
            description: template.description || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus template ini?')) return;

        try {
            await api.delete(`/admin/kkn-document-templates/${id}`);
            toast.success('Template berhasil dihapus');
            fetchTemplates();
        } catch (error) {
            toast.error('Gagal menghapus template');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', is_required: true, description: '' });
        setEditingId(null);
        setShowAddForm(false);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Template Dokumen KKN</h1>
                <p className="text-gray-600 mt-1">Kelola dokumen yang dibutuhkan untuk pendaftaran KKN</p>
            </div>

            {/* Fiscal Year Filter */}
            <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Tahun Akademik:</label>
                <select
                    value={selectedFy}
                    onChange={(e) => setSelectedFy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="">Pilih Tahun Akademik</option>
                    {fiscalYears.map(fy => (
                        <option key={fy.id} value={fy.id}>
                            {fy.year} {fy.is_active && '(Aktif)'}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus size={18} />
                    Tambah Template
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingId ? 'Edit Template' : 'Tambah Template Baru'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Dokumen <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Contoh: Surat Izin Orang Tua"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                rows="2"
                                placeholder="Deskripsi dokumen (opsional)"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_required"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="is_required" className="text-sm font-medium text-gray-700">
                                Dokumen Wajib
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Save size={18} />
                                {editingId ? 'Update' : 'Simpan'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                <X size={18} />
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Templates List */}
            {selectedFy && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Dokumen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Deskripsi
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : templates.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        Belum ada template dokumen untuk tahun akademik ini
                                    </td>
                                </tr>
                            ) : (
                                templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                            <div className="text-xs text-gray-500">{template.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                template.is_required 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {template.is_required ? 'Wajib' : 'Opsional'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {template.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
