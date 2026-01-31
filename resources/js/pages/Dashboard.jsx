import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { PlusCircle, FileText } from 'lucide-react';

export default function Dashboard() {
    const { user, logout, token } = useAuthStore();
    const [proposals, setProposals] = useState([]);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await axios.get('/api/proposals', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProposals(response.data);
            } catch (error) {
                console.error("Failed to fetch proposals", error);
            }
        };

        if (token) fetchProposals();
    }, [token]);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center border-l-4 border-green-600">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">
                        Selamat datang, <span className="font-semibold text-green-700">{user?.name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200">
                            {user?.role}
                        </span>
                    </p>
                </div>
                <div className="flex space-x-3">
                     <Link 
                        to="/proposals/create" 
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Proposal Baru
                    </Link>
                </div>
            </div>

            {/* Admin Widgets */}
            {user?.role === 'admin' && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Proposal</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">124</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Perlu Review</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">45</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Didanai</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">89</p>
                    </div>
                 </div>
            )}

             {/* Reviewer Widgets */}
             {user?.role === 'reviewer' && (
                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <PlusCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Anda memiliki <span className="font-bold">5 proposal</span> baru yang menunggu penilaian.
                                <a href="#" className="font-medium underline hover:text-yellow-600 ml-2">Lihat Daftar Review</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dosen/Common Widgets: Proposals List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Proposal Saya</h2>
                    {proposals.length > 5 && <Link to="/proposals" className="text-sm text-green-600 hover:text-green-800">Lihat Semua</Link>}
                </div>
                
                {proposals.length === 0 ? (
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
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-4 font-bold rounded-full uppercase tracking-wide 
                                            ${proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                              proposal.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
                                              proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {proposal.status}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
