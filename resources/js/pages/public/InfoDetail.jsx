import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Info } from 'lucide-react';
import PublicSidebar from '../../components/PublicSidebar';

export default function InfoDetail() {
    const { slug } = useParams();
    const [info, setInfo] = useState(null);
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
                // Fetch info card detail
                // We need to query by slug. The API is /api/info-cards/{slug} which maps to show method
                const infoRes = await axios.get(`/api/info-cards/${slug}`);
                setInfo(infoRes.data);

                // Fetch sidebar data
                const homeRes = await axios.get('/api/home-data');
                setSidebarData(homeRes.data);

            } catch (error) {
                console.error("Failed to fetch info detail", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
         return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
            </div>
         );
    }

    if (!info) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
                 <div className="text-gray-400 mb-4">
                    <Info size={48} />
                 </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Informasi Tidak Ditemukan</h2>
                <Link to="/" className="text-green-600 hover:text-green-800 font-semibold">Kembali ke Beranda</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             {/* Header */}
             <div className="bg-yellow-500 text-green-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <Link to="/" className="inline-flex items-center text-green-900/70 hover:text-green-900 mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold">{info.title}</h1>
                    <p className="text-green-900/80 mt-2 text-lg">{info.description}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                            {info.image && (
                                <img 
                                    src={info.image} 
                                    alt={info.title} 
                                    className="w-full h-64 object-cover rounded-lg mb-8"
                                />
                            )}
                            
                            <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4 border-b pb-4">
                                <span className="flex items-center">
                                    <Calendar size={16} className="mr-2" />
                                    {new Date(info.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center">
                                    <User size={16} className="mr-2" />
                                    Admin LPPM
                                </span>
                            </div>

                            <div className="prose prose-green max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: info.content || '<p>Belum ada rincian konten untuk informasi ini.</p>' }} />
                            </div>
                        </div>
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
