import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft } from 'lucide-react';

export default function PageDetail() {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/pages/${slug}`)
            .then(res => setPage(res.data))
            .catch(err => console.error("Failed to fetch page", err))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin h-8 w-8 border-2 border-green-900 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
                <h1 className="text-2xl font-bold text-gray-800">Halaman Tidak Ditemukan</h1>
                <Link to="/" className="text-green-600 mt-4 hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }

    const { content } = page;
    // Handle both structured content (hero_desc) or simple HTML string if that's what we stored?
    // In seeder we used array with hero_title, hero_desc, body.
    
    // Fallback if content is just a string? Migration said JSON. Seeder used array.
    // If we change schema to text/longText for content, we might store raw HTML.
    // Assuming JSON structure from seeder:
    // content: { hero_title, hero_desc, body }
    
    // Note: KKN page has complex info_cards structure in content.
    // Generic pages have 'body'.

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800">
             {/* Hero Section */}
             <div className="bg-green-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <Link to="/" className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors text-sm uppercase tracking-wider font-semibold">
                        <ArrowLeft size={16} className="mr-2" /> Kembali
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{content?.hero_title || page.title}</h1>
                    {content?.hero_desc && (
                        <p className="text-green-100 max-w-3xl text-xl font-light opacity-90">
                            {content.hero_desc}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="prose prose-lg prose-green max-w-none text-gray-600">
                    {content?.body && (
                        <div dangerouslySetInnerHTML={{ __html: content.body }} />
                    )}
                    {/* If content is just a string (legacy/fallback) */}
                    {typeof page.content === 'string' && (
                         <div dangerouslySetInnerHTML={{ __html: page.content }} />
                    )}
                 </div>
            </div>
        </div>
    );
}
