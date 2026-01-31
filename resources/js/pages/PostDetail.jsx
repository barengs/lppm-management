import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import PublicSidebar from '../components/PublicSidebar';

export default function PostDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [sidebarData, setSidebarData] = useState({
        announcements: [],
        agendas: [],
        video: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
             try {
                // Fetch Post and Sidebar Data in parallel
                const [postRes, homeRes] = await Promise.all([
                    axios.get(`/api/posts/${slug}`),
                    axios.get('/api/home-data')
                ]);
                
                setPost(postRes.data);
                setSidebarData({
                    announcements: homeRes.data.announcements,
                    agendas: homeRes.data.agendas,
                    video: homeRes.data.video
                });
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError("Konten tidak ditemukan.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!post) return null;

    const isAnnouncement = post.category === 'announcement';
    const themeColor = isAnnouncement ? 'text-yellow-600' : 'text-green-600';
    const bgColor = isAnnouncement ? 'bg-yellow-500' : 'bg-green-600';
    const categoryLabel = isAnnouncement ? 'Pengumuman' : 'Berita';

    return (
        <div className="bg-gray-50 min-h-screen pb-12 font-sans">
            {/* Breadcrumb / Top Bar */}
            <div className={`bg-white border-b shadow-sm sticky top-0 z-20`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center text-sm text-gray-500">
                     <Link to="/" className="hover:text-green-600 flex items-center">
                        <ArrowLeft size={16} className="mr-1" /> Beranda
                    </Link>
                    <span className="mx-2">/</span>
                    <span className={`font-semibold ${themeColor}`}>{categoryLabel}</span>
                    <span className="mx-2">/</span>
                    <span className="truncate max-w-[200px] md:max-w-md">{post.title}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Content Column */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            
                            {/* Hero Image/Video */}
                            {post.video_url ? (
                                <div className="aspect-video bg-black">
                                    <iframe 
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${getYoutubeId(post.video_url)}`}
                                        title="Video Player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                post.thumbnail && (
                                    <div className="w-full h-64 md:h-[400px] bg-gray-200">
                                         <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                )
                            )}

                            <div className="p-6 md:p-10">
                                {/* Title & Meta */}
                                <div className="mb-8 border-b pb-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className={`${bgColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            {categoryLabel}
                                        </span>
                                        <span className="text-gray-400 text-sm flex items-center">
                                            <Calendar size={14} className="mr-1" />
                                            {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                                        {post.title}
                                    </h1>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <div className="flex items-center mr-6">
                                            <User size={16} className="mr-2" />
                                            <span className="font-medium">Admin LPPM</span>
                                        </div>
                                        {/* Could add views count here */}
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div 
                                    className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* Tags / Share */}
                                <div className="mt-10 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Tag size={16} className="mr-2" />
                                        <span>Tags: LPPM, {categoryLabel}, UIM</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-gray-500 text-sm font-medium">Bagikan:</span>
                                        <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"><Share2 size={18} /></button>
                                        {/* Add real share links later */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="w-full lg:w-1/3">
                         <div className="sticky top-24">
                            <PublicSidebar 
                                announcements={sidebarData.announcements} 
                                agendas={sidebarData.agendas} 
                                video={sidebarData.video}
                            />
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Helper for YouTube ID
const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
