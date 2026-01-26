import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function CreateProposal() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    
    // Form State
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [schemeId, setSchemeId] = useState('');
    const [fiscalYearId, setFiscalYearId] = useState('');
    const [location, setLocation] = useState('');
    
    // Data State
    const [schemes, setSchemes] = useState([]);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [schemesRes, fyRes] = await Promise.all([
                    axios.get('/api/schemes', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/fiscal-years/active', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setSchemes(schemesRes.data);
                setFiscalYears(fyRes.data);
                
                // Set default fiscal year if available
                if (fyRes.data.length > 0) {
                    setFiscalYearId(fyRes.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch form data", err);
                setError("Failed to load necessary data. Please try again.");
            }
        };

        fetchData();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await axios.post('/api/proposals', {
                title,
                abstract,
                scheme_id: schemeId,
                fiscal_year_id: fiscalYearId,
                location
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit proposal.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Submit New Proposal</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Proposal</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Abstract */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstrak</label>
                    <textarea 
                        required
                        rows="4"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scheme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skema</label>
                        <select 
                            required
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                            value={schemeId}
                            onChange={(e) => setSchemeId(e.target.value)}
                        >
                            <option value="">Pilih Skema</option>
                            {schemes.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                            ))}
                        </select>
                    </div>

                    {/* Fiscal Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Anggaran</label>
                        <select 
                            required
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                            value={fiscalYearId}
                            onChange={(e) => setFiscalYearId(e.target.value)}
                        >
                            {fiscalYears.map(fy => (
                                <option key={fy.id} value={fy.id}>{fy.year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Location (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi (Khusus KKN/Abmas)</label>
                    <input 
                        type="text" 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75' : ''}`}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                </div>
            </form>
        </div>
    );
}
