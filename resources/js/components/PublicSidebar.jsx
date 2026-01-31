import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function PublicSidebar({ announcements = [], agendas = [], video = null }) {
    
    // Helpers
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getDay = (dateString) => new Date(dateString).getDate();
    const getMonth = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
    
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="space-y-8">
            {/* Recent Announcements */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-yellow-400 inline-block">
                    PENGUMUMAN TERBARU
                </h3>
                {announcements.length > 0 ? (
                    <ul className="space-y-4">
                        {announcements.map((post) => (
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
            </div>

            {/* Agenda */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-yellow-400 inline-block">
                    AGENDA
                </h3>
                {agendas.length > 0 ? (
                    <ul className="space-y-4">
                        {agendas.map((agenda) => (
                            <li key={agenda.id} className="flex items-center space-x-4">
                                <div className="text-center bg-gray-100 rounded p-2 min-w-[60px]">
                                    <div className="text-xl font-bold text-gray-800">{getDay(agenda.event_date)}</div>
                                    <div className="text-xs font-bold text-gray-500">{getMonth(agenda.event_date)}</div>
                                </div>
                                <h4 className="text-sm font-medium text-gray-700 hover:text-green-600">
                                    <Link to={`/agendas/${agenda.id}`}>{agenda.title}</Link>
                                </h4>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">Belum ada agenda.</p>
                )}
            </div>

            {/* Video Kegiatan */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-red-500 w-1.5 h-6 mr-3"></span>
                    VIDEO KEGIATAN
                </h3>
                {video ? (
                    <div className="space-y-4">
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer">
                            {getYoutubeId(video.video_url) ? (
                                <iframe 
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(video.video_url)}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <>
                                    <img src={video.thumbnail || "https://source.unsplash.com/random/400x225?conference"} alt="Video Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">{video.title}</h4>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Tidak ada video kegiatan.</p>
                )}
           </div>
        </div>
    );
}
