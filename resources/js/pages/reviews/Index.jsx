import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Star, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

export default function ReviewIndex() {
    const { token } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [formData, setFormData] = useState({ score: '', comment: '', decision: 'accepted' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/reviews/proposals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(response.data);
        } catch (error) {
            console.error("Failed to fetch proposals", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProposals();
    }, [token]);

    const handleReviewClick = (proposal) => {
        setSelectedProposal(proposal);
        // If already reviewed, populate (logic can be improved, for now new review)
        setFormData({ 
            score: proposal.reviews?.[0]?.score || '', 
            comment: proposal.reviews?.[0]?.comment || '', 
            decision: proposal.reviews?.[0]?.decision || 'accepted' 
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post('/api/reviews', {
                proposal_id: selectedProposal.id,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowModal(false);
            fetchProposals(); // Refresh list to see updated status
            alert("Review submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to submit review.");
        }
        setIsSubmitting(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Accepted</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>;
            case 'review': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Needs Revision</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="mr-2 text-yellow-500" /> Review Proposals
            </h1>

            {isLoading ? (
                <div className="text-gray-500">Loading proposals...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {proposals.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No proposals available for review.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Proposal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peneliti</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {proposals.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{item.abstract}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.user?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            {item.file_proposal ? (
                                                <a href={`/storage/${item.file_proposal}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                                                    <FileText size={16} className="mr-1" /> View PDF
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleReviewClick(item)}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center ml-auto"
                                            >
                                                <Star size={14} className="mr-1" />
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Review Modal */}
            {showModal && selectedProposal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Review Proposal</h2>
                        <div className="mb-4 bg-gray-50 p-3 rounded text-sm text-gray-700">
                            <strong>{selectedProposal.title}</strong>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Skor (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={formData.score}
                                    onChange={(e) => setFormData({...formData, score: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Komentar Reviewer</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.comment}
                                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700">Keputusan</label>
                                <select
                                    value={formData.decision}
                                    onChange={(e) => setFormData({...formData, decision: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                >
                                    <option value="accepted">Terima (Accepted)</option>
                                    <option value="rejected">Tolak (Rejected)</option>
                                    <option value="revision">Perlu Revisi (Revision)</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
