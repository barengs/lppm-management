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
            <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>!
                    </p>
                </div>
                <div className="flex space-x-3">
                     <Link 
                        to="/proposals/create" 
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Proposal
                    </Link>
                    <button 
                        onClick={logout}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Proposals List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">My Proposals</h2>
                </div>
                
                {proposals.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No proposals found. Start by creating one!
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {proposals.map((proposal) => (
                            <li key={proposal.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 pt-1">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 truncate">{proposal.title}</p>
                                            <p className="text-sm text-gray-500">{proposal.scheme?.name} • {proposal.fiscal_year?.year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                              proposal.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
                                              proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {proposal.status.toUpperCase()}
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
