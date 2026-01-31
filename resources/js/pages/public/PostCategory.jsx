import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Folder } from 'lucide-react';
import PublicSidebar from '../../components/PublicSidebar';

export default function PostCategory() {
    const { category } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarData, setSidebarData] = useState({
        announcements: [],
        agendas: [],
        video: null
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch posts by category
                const postsRes = await axios.get(`/api/posts?category=${category}`);
                setPosts(postsRes.data.data || postsRes.data); // Handle pagination or simple list

                // Fetch sidebar data
                const homeRes = await axios.get('/api/home-data');
                setSidebarData(homeRes.data);

            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [category]);

    const getCategoryTitle = (cat) => {
        switch(cat) {
            case 'research': return 'Info Penelitian & Proposal';
            case 'pkm': return 'Info PKM & Pengabdian';
            case 'publication': return 'Info Publikasi & Jurnal';
            case 'news': return 'Berita Terkini';
            case 'announcement': return 'Pengumuman';
            default: return cat.replace('-', ' ').toUpperCase();
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             {/* Header */}
             <div className="bg-green-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <Link to="/" className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center space-x-3">
                        <Folder className="text-yellow-400 w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold capitalize">{getCategoryTitle(category)}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        {loading ? (
                             <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                                <p className="text-gray-500">Memuat artikel...</p>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="grid gap-8">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="md:flex">
                                            <div className="md:w-1/3">
                                                <img 
                                                    src={post.thumbnail || `https://source.unsplash.com/random/400x300?${category}`} 
                                                    alt={post.title} 
                                                    className="h-48 w-full object-cover md:h-full"
                                                />
                                            </div>
                                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center text-xs text-gray-500 mb-2 space-x-4">
                                                        <span className="flex items-center">
                                                            <Calendar size={14} className="mr-1" />
                                                            {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <User size={14} className="mr-1" />
                                                            Admin
                                                        </span>
                                                    </div>
                                                    <Link to={`/posts/${post.slug || post.id}`}>
                                                        <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-green-700 transition-colors line-clamp-2">
                                                            {post.title}
                                                        </h2>
                                                    </Link>
                                                    <p className="text-gray-600 line-clamp-2 text-sm mb-4" dangerouslySetInnerHTML={{ __html: post.content }}></p>
                                                </div>
                                                <Link 
                                                    to={`/posts/${post.slug || post.id}`}
                                                    className="inline-block text-green-700 font-semibold hover:text-green-900 text-sm"
                                                >
                                                    Baca Selengkapnya &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <Folder className="text-gray-400 w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Belum ada artikel</h3>
                                <p className="text-gray-500 mt-2">Belum ada informasi untuk kategori ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <PublicSidebar 
                            announcements={sidebarData.announcements} 
                            agendas={sidebarData.agendas} 
                            video={sidebarData.video} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
