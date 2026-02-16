import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Users, Link as LinkIcon, Download, BarChart2, BookOpen, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../store/slices/systemSlice';

export default function Home() {
    const settings = useSelector(selectSettings);
    const [homeData, setHomeData] = useState({
        news: [],
        announcements: [],
        agendas: [],
        video: null
    });
    const [stats, setStats] = useState({
        research: 0,
        citations: 0,
        hki: 0,
        publications: 0,
        infoCards: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dataRes, statsRes, cardsRes] = await Promise.all([
                    axios.get('/api/home-data'),
                    axios.get('/api/stats'),
                    axios.get('/api/info-cards')
                ]);
                setHomeData({
                    ...dataRes.data,
                    infoCards: cardsRes.data
                });
                setStats(statsRes.data);
            } catch (error) {
                console.error("Failed to fetch home data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getDay = (dateString) => new Date(dateString).getDate();
    const getMonth = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();

    // YouTube ID extractor helper
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'FileText': return <FileText className="h-6 w-6" />;
            case 'Users': return <Users className="h-6 w-6" />;
            case 'BookOpen': return <BookOpen className="h-6 w-6" />;
            case 'Download': return <Download className="h-6 w-6" />;
            case 'BarChart2': return <BarChart2 className="h-6 w-6" />;
            case 'AlertCircle': return <AlertCircle className="h-6 w-6" />;
            default: return <FileText className="h-6 w-6" />;
        }
    };


    return (
        <div className="bg-gray-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
                    <div className="w-full text-center max-w-4xl mx-auto">
                        <span className="bg-yellow-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full mb-6 inline-block tracking-wider">
                            PENGUMUMAN TERBARU
                        </span>
                        {homeData.announcements.length > 0 ? (
                            <>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                    {homeData.announcements[0].title}
                                </h2>
                                <div 
                                    className="text-green-100 mb-8 font-light text-lg line-clamp-2 max-w-2xl mx-auto"
                                    dangerouslySetInnerHTML={{ __html: homeData.announcements[0].content }}
                                />
                                <div className="flex justify-center gap-4">
                                    <Link 
                                        to={`/posts/${homeData.announcements[0].slug || homeData.announcements[0].id}`}
                                        className="inline-block bg-white text-green-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg"
                                    >
                                        Baca Selengkapnya
                                    </Link>
                                    <Link 
                                        to="/documents"
                                        className="inline-block bg-green-800 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition duration-300 border border-green-700"
                                    >
                                        Unduh Panduan
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                    Selamat Datang di LPPM UIM
                                </h2>
                                <p className="text-green-100 mb-8 font-light text-lg max-w-2xl mx-auto">
                                    Lembaga Penelitian dan Pengabdian kepada Masyarakat {settings.university_name}.
                                </p>
                            </>
                        )}
                    </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & Center Columns: Info Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {homeData.infoCards && homeData.infoCards.length > 0 ? (
                            homeData.infoCards.map((card) => (
                                <InfoCard 
                                    key={card.id}
                                    title={card.title} 
                                    desc={card.description}
                                    icon={getIcon(card.icon)}
                                    link={card.url}
                                    slug={card.slug}
                                />
                            ))
                        ) : (
                             // Fallback / Loading Skeleton if needed
                            <div className="col-span-2 text-center py-8 text-gray-400">
                                Memuat layanan...
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">
                        {/* Recent Announcements */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-yellow-400 inline-block">
                                PENGUMUMAN TERBARU
                            </h3>
                            {homeData.announcements.length > 0 ? (
                                <ul className="space-y-4">
                                    {homeData.announcements.map((post) => (
                                        <li key={post.id} className="group cursor-pointer">
                                            <span className="text-xs text-gray-500 font-semibold block mb-1">{formatDate(post.created_at)}</span>
                                            <h4 className="text-sm font-medium text-green-900 group-hover:text-green-600 transition-colors">
                                                <Link to={`/posts/${post.slug || post.id}`}>{post.title}</Link>
                                            </h4>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada pengumuman.</p>
                            )}
                            <a href="#" className="text-xs font-bold text-yellow-600 mt-4 inline-block hover:underline">LIHAT SEMUA &rarr;</a>
                        </div>

                         {/* Agenda */}
                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-yellow-400 inline-block">
                                AGENDA
                            </h3>
                             {homeData.agendas.length > 0 ? (
                                <ul className="space-y-4">
                                    {homeData.agendas.map((agenda) => (
                                        <AgendaItem 
                                            key={agenda.id}
                                            id={agenda.id}
                                            day={getDay(agenda.event_date)} 
                                            month={getMonth(agenda.event_date)} 
                                            title={agenda.title} 
                                        />
                                    ))}
                                </ul>
                             ) : (
                                <p className="text-gray-500 text-sm">Belum ada agenda agenda.</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section: News & Video */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Latest News (Berita) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                             <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="w-2 h-8 bg-green-600 mr-3 rounded-full"></span>
                                BERITA TERBARU
                            </h3>
                             <a href="#" className="text-green-700 hover:text-green-900 font-semibold text-sm">Lihat Semua Berita &rarr;</a>
                        </div>

                        {homeData.news.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {homeData.news.map((post, i) => (
                                    <div key={post.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group border border-gray-100 h-full flex flex-col">
                                        <div className="h-48 bg-gray-200 relative overflow-hidden flex-shrink-0">
                                            <img src={post.thumbnail || `https://source.unsplash.com/random/400x300?university&sig=${i}`} alt="News Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                BERITA
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                                <Calendar size={14} />
                                                <span>{formatDate(post.created_at)}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                                                <Link to={`/posts/${post.slug || post.id}`}>{post.title}</Link>
                                            </h4>
                                            <div className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1" dangerouslySetInnerHTML={{__html: post.content.substring(0, 150) + '...'}}></div>
                                            <Link to={`/posts/${post.slug || post.id}`} className="text-green-600 font-bold text-sm hover:underline mt-auto">Baca Selengkapnya</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">Belum ada berita terbaru.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Announcements & Video */}
                    <div className="space-y-8">
                        
                        {/* Announcements (moved from top) - Optional Redundancy or Distinct List can be here if needed, keeping similar to original design */}
                        {/* If redundant, we can remove or show different set. The original code had announcements in Sidebar top right as well. */}
                        
                        {/* Video Kegiatan */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="bg-red-500 w-1.5 h-6 mr-3"></span>
                                VIDEO KEGIATAN
                            </h3>
                            {homeData.video ? (
                                <div className="space-y-4">
                                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer">
                                        {getYoutubeId(homeData.video.video_url) ? (
                                             <iframe 
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${getYoutubeId(homeData.video.video_url)}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <>
                                                <img src={homeData.video.thumbnail || "https://source.unsplash.com/random/400x225?conference"} alt="Video Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-1">{homeData.video.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{__html:homeData.video.content}}></p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Tidak ada video kegiatan.</p>
                            )}
                         </div>

                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-green-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                         <h3 className="text-2xl font-bold uppercase tracking-widest text-yellow-400">Data Kinerja Institut</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatItem value={stats.research.toLocaleString()} label="Judul Penelitian" />
                        <StatItem value={stats.citations.toLocaleString()} label="Sitasi" />
                        <StatItem value={stats.hki.toLocaleString()} label="HKI / Paten" />
                        <StatItem value={stats.publications.toLocaleString()} label="Dokumen Publikasi" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ title, desc, icon, link, slug }) {
    // Priority:
    // 1. link (if external or specific functional module link like /login)
    // 2. /info/{slug} (if no specific link, use generic detail page)
    
    const targetLink = link || (slug ? `/pages/${slug}` : '#');
    const isInternal = targetLink.startsWith('/');
    
    if (isInternal) {
        return (
            <Link to={targetLink} className="bg-yellow-500 hover:bg-yellow-400 transition-colors p-6 rounded-lg text-white shadow-md flex items-start space-x-4 group min-h-[140px]">
                <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight mb-2">{title}</h3>
                    <p className="text-yellow-100 text-sm">{desc}</p>
                </div>
            </Link>
        );
    }

    return (
        <a href={targetLink} className="bg-yellow-500 hover:bg-yellow-400 transition-colors p-6 rounded-lg text-white shadow-md flex items-start space-x-4 group min-h-[140px]">
            <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight mb-2">{title}</h3>
                <p className="text-yellow-100 text-sm">{desc}</p>
            </div>
        </a>
    );
}

function StatItem({ value, label }) {
    return (
        <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">{value}</div>
            <div className="text-green-100 font-medium uppercase text-sm tracking-wide">{label}</div>
        </div>
    );
}

function AgendaItem({ day, month, title, id }) {
    return (
        <li className="flex items-center space-x-4">
            <div className="text-center bg-gray-100 rounded p-2 min-w-[60px]">
                <div className="text-xl font-bold text-gray-800">{day}</div>
                <div className="text-xs font-bold text-gray-500">{month}</div>
            </div>
            <h4 className="text-sm font-medium text-gray-700">
                <Link to={`/agendas/${id}`}>{title}</Link>
            </h4>
        </li>
    );
}
