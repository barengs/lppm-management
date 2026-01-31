import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';
import { ArrowLeft, Calendar, User, Tag, CheckCircle, XCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function CmsPostDetail() {
    const { id } = useParams();
    const { token } = useAuthStore();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Use the public endpoint but we can also use it authenticated if needed.
                // Since this is admin view, let's just fetch it.
                // Note: The public 'show' endpoint does not enforce auth, which is fine for reading.
                const response = await axios.get(`/api/posts/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error("Failed to fetch post", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Loading article...</div>;
    }

    if (!post) {
        return <div className="p-6 text-center text-red-500">Article not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link to="/cms/posts" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Preview Artikel</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Meta Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="flex items-center bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full capitalize font-medium">
                                <Tag size={14} className="mr-1" />
                                {post.category}
                            </span>
                            <span className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                             {post.is_published ? (
                                <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                    <CheckCircle size={16} className="mr-1"/> Published
                                </span>
                            ) : (
                                <span className="flex items-center text-gray-500 text-sm font-bold bg-gray-200 px-3 py-1 rounded-full border border-gray-300">
                                    <XCircle size={16} className="mr-1"/> Draft
                                </span>
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mt-4 leading-tight">{post.title}</h1>
                </div>

                {/* Thumbnail */}
                {post.thumbnail && (
                    <div className="w-full h-80 bg-gray-100 relative">
                        <img 
                            src={post.thumbnail} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-8 prose max-w-none text-gray-800 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                </div>
            </div>
        </div>
    );
}
