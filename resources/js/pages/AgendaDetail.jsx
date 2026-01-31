import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, ArrowLeft, Clock } from 'lucide-react';

export default function AgendaDetail() {
    const { id } = useParams();
    const [agenda, setAgenda] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgenda = async () => {
             try {
                const response = await axios.get(`/api/agendas/${id}`);
                setAgenda(response.data);
            } catch (err) {
                console.error("Failed to fetch agenda", err);
                setError("Agenda tidak ditemukan.");
            } finally {
                setLoading(false);
            }
        };
        fetchAgenda();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!agenda) return null;

     const eventDate = new Date(agenda.event_date);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-green-800 text-white py-12">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <Link to="/" className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{agenda.title}</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
                    {/* Date Badge */}
                    <div className="absolute top-0 right-0 bg-yellow-400 text-green-900 p-4 rounded-bl-xl text-center min-w-[100px]">
                        <div className="text-3xl font-bold">{eventDate.getDate()}</div>
                        <div className="text-xs font-bold uppercase">{eventDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</div>
                    </div>

                    <div className="p-8 md:p-12 pt-16">
                         <div className="flex flex-col space-y-4 mb-8">
                             <div className="flex items-center text-gray-700">
                                <Calendar className="w-5 h-5 mr-3 text-green-600" />
                                <span className="font-medium">
                                    {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                             </div>
                             {agenda.location && (
                                <div className="flex items-center text-gray-700">
                                    <MapPin className="w-5 h-5 mr-3 text-red-500" />
                                    <span>{agenda.location}</span>
                                </div>
                             )}
                             <div className="flex items-center text-gray-700">
                                <Clock className="w-5 h-5 mr-3 text-blue-500" />
                                <span>08:00 WIB - Selesai</span> {/* Placeholder time if not in DB */}
                             </div>
                         </div>

                         <div className="prose prose-green max-w-none border-t pt-8">
                             <h3 className="text-lg font-bold text-gray-800 mb-4">Deskripsi Kegiatan</h3>
                             <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                 {agenda.description || "Tidak ada deskripsi detail untuk agenda ini."}
                             </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
