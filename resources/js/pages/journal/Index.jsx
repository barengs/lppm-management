import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Newspaper } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';

export default function JournalIndex() {
    const { user } = useAuthStore();
    const [journals, setJournals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            const response = await api.get('/journals');
            setJournals(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredJournals = journals.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.target_publisher?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-gray-100 text-gray-800',
            in_review: 'bg-blue-100 text-blue-800',
            revision_needed: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        const labels = {
            pending: 'Menunggu',
            in_review: 'Sedang Direview',
            revision_needed: 'Perlu Revisi',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-sm shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Newspaper className="mr-2" /> Konsultasi Jurnal
                    </h1>
                    <p className="text-gray-500 text-sm">Review draft jurnal sebelum submit ke publisher</p>
                </div>
                {user?.role !== 'admin' && (
                    <Link to="/journals/create" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors shadow-sm">
                        <Plus size={18} className="mr-1" /> Buat Konsultasi Baru
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-sm shadow overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center">
                    <Search className="text-gray-400 mr-2" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari judul atau publisher..." 
                        className="w-full border-none focus:ring-0 text-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredJournals.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Jurnal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Publisher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredJournals.map((journal) => (
                                <tr key={journal.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{journal.title}</div>
                                        <div className="text-xs text-gray-500">Update: {new Date(journal.updated_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {journal.target_publisher || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {journal.user?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(journal.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/journals/${journal.id}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                                            <FileText size={16} className="mr-1" /> Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-10 text-center text-gray-500">
                        Belum ada data konsultasi jurnal.
                    </div>
                )}
            </div>
        </div>
    );
}
