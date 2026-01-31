import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Star, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function PublicSurvey() {
    const [formData, setFormData] = useState({
        name: '',
        role: 'mahasiswa', // dosen, mahasiswa, umum, tendik
        rating: 5,
        feedback: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRating = (rating) => {
        setFormData({ ...formData, rating });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post('/api/surveys', formData);
            setIsSuccess(true);
            toast.success("Terima kasih atas masukan Anda!");
        } catch (error) {
            console.error("Survey error", error);
            toast.error("Gagal mengirim survei. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600 w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
                    <p className="text-gray-600 mb-8">
                        Masukan Anda sangat berharga bagi kami untuk meningkatkan kualitas layanan LPPM Universitas Islam Madura.
                    </p>
                    <Link to="/" className="inline-block bg-green-700 text-white font-bold py-3 px-8 rounded-full hover:bg-green-800 transition-colors">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                     <Link to="/" className="inline-flex items-center text-yellow-100 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Survei Kepuasan Layanan</h1>
                            <p className="text-yellow-100 text-lg">Bantu kami menjadi lebih baik.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Rating */}
                        <div className="text-center mb-8">
                            <label className="block text-gray-700 font-bold mb-4">Seberapa puas Anda dengan layanan kami?</label>
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => handleRating(star)}
                                        className={`p-2 rounded-full transition-transform hover:scale-110 focus:outline-none ${
                                            formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    >
                                        <Star fill="currentColor" size={40} />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between max-w-xs mx-auto mt-2 text-xs text-gray-400">
                                <span>Sangat Kecewa</span>
                                <span>Sangat Puas</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama (Opsional)</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 p-3 border"
                                    placeholder="Nama Anda"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status / Peran</label>
                                <select 
                                    name="role" 
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 p-3 border"
                                >
                                    <option value="mahasiswa">Mahasiswa</option>
                                    <option value="dosen">Dosen</option>
                                    <option value="tendik">Tenaga Kependidikan</option>
                                    <option value="umum">Umum / Mitra</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kritik & Saran</label>
                            <textarea 
                                name="feedback"
                                rows="4"
                                value={formData.feedback}
                                onChange={handleChange}
                                required
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 p-3 border"
                                placeholder="Tuliskan pengalaman Anda atau saran perbaikan..."
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full flex justify-center items-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl ${
                                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                <Send className="mr-2" size={20} />
                                {isSubmitting ? 'Mengirim...' : 'Kirim Survei'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
