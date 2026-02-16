import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../../../utils/api';

export default function PageForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        hero_title: '',
        hero_desc: '',
        body: '',
        meta_title: '',
        meta_description: '',
        is_published: false
    });

    useEffect(() => {
        if (isEditing) {
            fetchPage();
        }
    }, [id]);

    const fetchPage = async () => {
        try {
            const response = await api.get(`/admin/pages/${id}`);
            const page = response.data;
            setFormData({
                title: page.title,
                slug: page.slug,
                hero_title: page.content?.hero_title || '',
                hero_desc: page.content?.hero_desc || '',
                body: page.content?.body || '',
                meta_title: page.meta_title || '',
                meta_description: page.meta_description || '',
                is_published: !!page.is_published
            });
        } catch (error) {
            console.error('Failed to fetch page:', error);
            toast.error('Gagal mengambil data halaman');
            navigate('/admin/pages');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBodyChange = (value) => {
        setFormData(prev => ({ ...prev, body: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                ...formData,
                // Ensure content body is passed as 'content' field for the simpler controller logic if needed?
                // Our controller expects 'body', 'hero_title', etc in root of request to validate and then merge.
                // Re-check controller: yes, it validates 'body', 'hero_title' from request root.
            };

            if (isEditing) {
                await api.put(`/admin/pages/${id}`, payload);
                toast.success('Halaman berhasil diperbarui');
            } else {
                await api.post('/admin/pages', payload);
                toast.success('Halaman berhasil dibuat');
            }
            navigate('/admin/pages');
        } catch (error) {
            console.error('Failed to save page:', error);
            const msg = error.response?.data?.message || 'Gagal menyimpan halaman';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center">Memuat data...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link to="/admin/pages" className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Halaman' : 'Buat Halaman Baru'}
                        </h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Informasi Utama</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Halaman <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                                placeholder="Contoh: Visi dan Misi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) <span className="text-gray-400 text-xs">(Opsional - Auto generate)</span></label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                                placeholder="visi-dan-misi"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                            className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                        />
                        <label htmlFor="is_published" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                            Publikasikan Halaman ini?
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Konten Header (Hero)</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Header (Hero Title)</label>
                        <input
                            type="text"
                            name="hero_title"
                            value={formData.hero_title}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                            placeholder="Sama dengan judul halaman jika kosong"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat (Hero Description)</label>
                        <textarea
                            name="hero_desc"
                            rows="2"
                            value={formData.hero_desc}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                            placeholder="Deskripsi singkat yang muncul di bagian atas halaman (hijau)"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Konten Halaman</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Isi Konten</label>
                        <div className="h-96 pb-12">
                            <ReactQuill 
                                theme="snow" 
                                value={formData.body} 
                                onChange={handleBodyChange}
                                className="h-full"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">SEO (Search Engine Optimization)</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                        <input
                            type="text"
                            name="meta_title"
                            value={formData.meta_title}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                            placeholder="Judul yang muncul di hasil pencarian Google"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                        <textarea
                            name="meta_description"
                            rows="2"
                            value={formData.meta_description}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border"
                            placeholder="Deskripsi yang muncul di hasil pencarian Google"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Link to="/admin/pages" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium transition-colors flex items-center disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                        Simpan Halaman
                    </button>
                </div>
            </form>
        </div>
    );
}
