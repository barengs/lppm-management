import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { PlusCircle, FileText, MessageSquare, History, Eye, ClipboardCheck } from 'lucide-react';
import RevisionHistory from './components/RevisionHistory';
import ReportModal from './components/ReportModal';
import FullProposalPreviewModal from '../../components/pdf/FullProposalPreviewModal';

export default function ProposalsIndex() {
    const { token } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await axios.get('/api/proposals', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProposals(response.data);
            } catch (error) {
                console.error("Failed to fetch proposals", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProposals();
    }, [token]);

    const openHistory = (proposal) => {
        setSelectedProposal(proposal);
        setIsHistoryOpen(true);
    };

    const openReport = (proposal) => {
        setSelectedProposal(proposal);
        setIsReportOpen(true);
    };

    const openPreview = (proposal) => {
        setSelectedProposal(proposal);
        setIsPreviewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow p-6 flex justify-between items-center border-l-4 border-green-600">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daftar Proposal</h1>
                    <p className="text-gray-600">Kelola proposal penelitian dan pengabdian masyarakat Anda.</p>
                </div>
                <Link 
                    to="/proposals/create" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Buat Proposal Baru
                </Link>
            </div>

            <div className="bg-white shadow rounded-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Memuat data...</div>
                ) : proposals.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                             <FileText size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Belum ada proposal</h3>
                        <p className="mt-1 text-gray-500">Mulai ajukan proposal penelitian atau pengabdian masyarakat anda.</p>
                        <div className="mt-6">
                             <Link 
                                to="/proposals/create" 
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Buat Proposal
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {proposals.map((proposal) => (
                            <li key={proposal.id} className="px-6 py-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 pt-1">
                                            <div className={`p-2 rounded-lg ${
                                                proposal.scheme?.type === 'research' ? 'bg-blue-100 text-blue-600' : 
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-green-700 truncate mb-1">{proposal.title}</p>
                                            <div className="flex items-center text-xs text-gray-500 space-x-2">
                                                 <span className="font-medium text-gray-900">{proposal.scheme?.name}</span>
                                                 <span>&bull;</span>
                                                 <span>TA {proposal.fiscal_year?.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => openPreview(proposal)}
                                            className="mr-3 p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                                            title="Pratinjau PDF"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <Link
                                            to={`/proposals/${proposal.id}`}
                                            className="mr-3 p-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors border border-gray-200"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-4 font-bold rounded-full uppercase tracking-wide 
                                            ${proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                              proposal.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
                                              proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {proposal.status}
                                        </span>
                                        {proposal.notes && proposal.notes.length > 0 && (
                                            <button 
                                                onClick={() => openHistory(proposal)}
                                                className="ml-3 p-1.5 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors border border-yellow-200"
                                                title="Lihat Catatan Revisi"
                                            >
                                                <History size={16} />
                                            </button>
                                        )}
                                        {proposal.status === 'accepted' && (
                                            <button 
                                                onClick={() => openReport(proposal)}
                                                className="ml-3 p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                                                title="Laporan Kemajuan/Akhir"
                                            >
                                                <ClipboardCheck size={16} />
                                            </button>
                                        )}
                                        {proposal.status === 'draft' && (
                                            <Link 
                                                to={`/proposals/create/${proposal.id}`}
                                                className="ml-4 text-xs font-bold text-green-600 hover:text-green-800 flex items-center"
                                            >
                                                Lanjutkan &rarr;
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <RevisionHistory 
                isOpen={isHistoryOpen} 
                onClose={() => setIsHistoryOpen(false)} 
                notes={selectedProposal?.notes || []} 
            />

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => {
                    setIsReportOpen(false);
                    // Optionally refresh list if needed
                }}
                proposalId={selectedProposal?.id}
                title={selectedProposal?.title}
                type="research"
            />

            <FullProposalPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                proposalId={selectedProposal?.id}
                type="research"
            />
        </div>
    );
}
