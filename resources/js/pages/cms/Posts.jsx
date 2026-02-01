import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import useAuthStore from '../../store/useAuthStore';
import { Newspaper, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import DataTable from '../../components/DataTable';

export default function PostsIndex() {
    const { token } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', category: 'news', content: '', is_published: true 
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileError, setFileError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/posts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('content', formData.content);
        data.append('is_published', formData.is_published ? '1' : '0'); 
        if (thumbnailFile) {
            data.append('thumbnail', thumbnailFile);
        }

        try {
            if (isEditing) {
                data.append('_method', 'PUT');
                await axios.post(`/api/posts/${selectedId}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post('/api/posts', data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setShowModal(false);
            fetchPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to save post");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if(!confirm("Delete this post?")) return;
        try {
            await axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchPosts();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const modules = {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline','strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'image'],
          ['clean']
        ],
    };

    // DataTable Columns
    const columns = React.useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Judul',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{row.original.title}</div>
                    <div className="text-xs text-gray-400">{new Date(row.original.created_at).toLocaleDateString()}</div>
                </div>
            )
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => <span className="text-gray-500 capitalize">{row.original.category}</span>
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) => (
                row.original.is_published ? (
                    <span className="flex items-center text-green-600 text-xs font-semibold"><CheckCircle size={14} className="mr-1"/> Published</span>
                ) : (
                    <span className="flex items-center text-gray-500 text-xs font-semibold"><XCircle size={14} className="mr-1"/> Draft</span>
                )
            )
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => {
                        setFormData({ 
                            title: row.original.title, 
                            category: row.original.category, 
                            content: row.original.content, 
                            is_published: row.original.is_published, 
                            thumbnail: row.original.thumbnail || '' 
                        });
                        setThumbnailFile(null);
                        setPreviewUrl(null);
                        setSelectedId(row.original.id);
                        setIsEditing(true);
                        setShowModal(true);
                    }} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Edit size={16} />
                    </button>
                    
                    <Link to={`/cms/posts/${row.original.id}`} className="text-gray-600 hover:text-green-600 inline-block" title="View">
                        <Eye size={16} />
                    </Link>
                    <button onClick={() => handleDelete(row.original.id)} className="text-red-600 hover:text-red-800" title="Delete">
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
                    <Newspaper className="mr-2 text-green-700" /> Berita & Artikel
                </h1>
                <button 
                    onClick={() => {
                        setFormData({ title: '', category: 'news', content: '', is_published: true });
                        setThumbnailFile(null);
                        setPreviewUrl(null);
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <Plus size={18} className="mr-2" /> Tambah Post
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable 
                    data={posts} 
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari berita...',
                        emptyMessage: 'Tidak ada berita'
                    }} 
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Post' : 'Buat Post Baru'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Title Section */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Artikel</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Masukkan judul berita atau artikel..."
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-3 border text-lg"
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                    <select 
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5 border bg-white"
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="news">Berita (News)</option>
                                        <option value="announcement">Pengumuman</option>
                                        <option value="policy">Kebijakan</option>
                                    </select>
                                </div>

                                {/* Thumbnail Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gambar / Thumbnail</label>
                                    <div className="flex items-start space-x-6">
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setFileError('');
                                                    if (file) {
                                                        if (file.size > 2 * 1024 * 1024) { // 2MB
                                                            setFileError('Ukuran file terlalu besar. Maksimal 2MB.');
                                                            setThumbnailFile(null);
                                                            setPreviewUrl(null);
                                                            e.target.value = null;
                                                            return;
                                                        }
                                                        setThumbnailFile(file);
                                                        const url = URL.createObjectURL(file);
                                                        setPreviewUrl(url);
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-green-50 file:text-green-700
                                                    hover:file:bg-green-100
                                                    cursor-pointer border rounded-lg p-1
                                                "
                                            />
                                            {fileError && (
                                                <p className="text-red-500 text-xs mt-1 font-medium">{fileError}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG. Max: 2MB.</p>
                                        </div>
                                        
                                        {/* Preview Area */}
                                        {(previewUrl || (isEditing && formData.thumbnail)) && (
                                            <div className="flex-shrink-0">
                                                <p className="text-xs text-gray-500 mb-1 text-center">Preview</p>
                                                <div className="h-24 w-24 border rounded-lg overflow-hidden bg-gray-100 shadow-sm relative group">
                                                    <img 
                                                        src={previewUrl || formData.thumbnail} 
                                                        alt="Thumbnail Preview" 
                                                        className="h-full w-full object-cover" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Konten</label>
                                <div className="h-[400px] border rounded-lg overflow-hidden flex flex-col">
                                     <ReactQuill 
                                        theme="snow" 
                                        value={formData.content} 
                                        onChange={(content) => setFormData(prev => ({ ...prev, content }))} 
                                        modules={modules}
                                        className="h-full flex flex-col"
                                     />
                                </div>
                            </div>
                            
                            {/* Status Toggle */}
                            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center h-5">
                                    <input 
                                        id="published" 
                                        type="checkbox" 
                                        className="focus:ring-green-500 h-5 w-5 text-green-600 border-gray-300 rounded"
                                        checked={formData.is_published} 
                                        onChange={e => setFormData({...formData, is_published: e.target.checked})} 
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="published" className="font-medium text-gray-700">Publikasikan Langsung</label>
                                    <p className="text-gray-500">Jika tidak dicentang, akan disimpan sebagai Draft.</p>
                                </div>
                            </div>

                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)} 
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting} 
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Post'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
