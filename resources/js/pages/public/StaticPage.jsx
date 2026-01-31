import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function StaticPage() {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/pages/${slug}`);
                setPage(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch page:', err);
                setError('Halaman tidak ditemukan');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPage();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600">{error || 'Halaman tidak ditemukan'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {page.content?.hero_title || page.title}
                    </h1>
                    {page.content?.hero_desc && (
                        <p className="text-xl text-blue-100 max-w-3xl">
                            {page.content.hero_desc}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div 
                        className="prose prose-lg max-w-none bg-white rounded-lg shadow-lg p-8"
                        dangerouslySetInnerHTML={{ __html: page.content?.body || '' }}
                    />
                </div>
            </div>
        </div>
    );
}
