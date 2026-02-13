import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

export default function PublicKknRegister() {
    const { token, user } = useAuth();
    const [pageContent, setPageContent] = React.useState(null);

    React.useEffect(() => {
        // Fetch dynamic content
        api.get('/pages/kkn')
            .then(res => setPageContent(res.data.content))
            .catch(err => console.error("Failed to fetch KKN content", err));
    }, []);

    const content = pageContent || {
        hero_title: 'Kuliah Kerja Nyata (KKN)',
        hero_desc: 'Program pengabdian mahasiswa kepada masyarakat sebagai wujud implementasi Tri Dharma Perguruan Tinggi.',
        info_cards: []
    };

    // Redirect logged-in students to dashboard
    if (token && user?.role === 'mahasiswa') {
        return <Navigate to="/dashboard/kkn" replace />;
    }

    return (
        <div className="bg-white font-sans text-gray-800">
             {/* Hero Section */}
             <div className="bg-green-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{content.hero_title}</h1>
                    <p className="text-green-100 max-w-2xl mx-auto text-xl mb-10 font-light">
                        {content.hero_desc}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link 
                            to="/register" 
                            className="inline-block bg-yellow-400 text-green-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transition-colors shadow-lg transform hover:-translate-y-1"
                        >
                            Buat Akun Mahasiswa
                        </Link>
                         <Link 
                            to="/login" 
                            className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-green-900 transition-colors shadow-lg"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            {content.info_cards && content.info_cards.length > 0 ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {content.info_cards.map((card, idx) => (
                            <div key={idx} className="text-center p-6 bg-gray-50 rounded-xl">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                    {card.icon === 'MapPin' && <MapPin size={32} />}
                                    {card.icon === 'Calendar' && <Calendar size={32} />}
                                    {card.icon === 'CheckCircle' && <CheckCircle size={32} />}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                <p className="text-gray-600">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Pilih Lokasi</h3>
                            <p className="text-gray-600">t</p>
                        </div>
                         <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Jadwal Pelaksanaan</h3>
                            <p className="text-gray-600">p</p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Validasi & Penilaian</h3>
                            <p className="text-gray-600">v</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
