import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function JournalCreate() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        target_publisher: '',
        file: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title) return toast.error('Judul wajib diisi');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('abstract', formData.abstract);
        data.append('target_publisher', formData.target_publisher);
        if (formData.file) {
            data.append('initial_file', formData.file);
        }

        setIsLoading(true);
        try {
            await api.post('/journals', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Draft jurnal berhasil dikirim!');
            navigate('/journals');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim draft.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Ajukan Konsultasi Jurnal Baru</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Jurnal</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5 border"
                            placeholder="Masukkan judul artikel ilmiah..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Publisher</label>
                            <input 
                                type="text" 
                                name="target_publisher" 
                                value={formData.target_publisher} 
                                onChange={handleChange}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5 border"
                                placeholder="Contoh: Elsevier, SINTA 2, Jurnal Teknologi..."
                            />
                            <p className="mt-1 text-xs text-gray-500">Opsional, tapi membantu reviewer.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Draft Awal</label>
                            <div className="border border-gray-300 rounded-lg p-2.5 flex items-center bg-gray-50">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Format PDF/Word (Max 10MB)</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abstrak</label>
                        <textarea 
                            name="abstract" 
                            rows="6"
                            value={formData.abstract} 
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-3 border"
                            placeholder="Ringkasan abstrak..."
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex items-center bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-sm disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {isLoading ? 'Mengirim...' : 'Kirim Konsultasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
