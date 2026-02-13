import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Upload, DollarSign, FileText } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function CreateProposal() {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // Form State
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [schemeId, setSchemeId] = useState('');
    const [fiscalYearId, setFiscalYearId] = useState('');
    const [budget, setBudget] = useState('');
    const [file, setFile] = useState(null);
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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('abstract', abstract);
        formData.append('scheme_id', schemeId);
        formData.append('fiscal_year_id', fiscalYearId);
        formData.append('budget', budget);
        if (location) formData.append('location', location);
        if (file) formData.append('file_proposal', file);

        try {
            await axios.post('/api/proposals', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit proposal. Make sure all fields are valid.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-sm overflow-hidden border border-gray-100">
            <div className="bg-green-700 px-6 py-4 border-b border-green-800">
                <h1 className="text-xl font-bold text-white flex items-center">
                    <FileText className="mr-2" size={24} />
                    Pengajuan Proposal Baru
                </h1>
                <p className="text-green-100 text-sm mt-1">Lengkapi formulir di bawah ini untuk mengajukan proposal penelitian atau pengabdian.</p>
            </div>
            
            <div className="p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-sm border border-red-200 flex items-start">
                        <div className="mr-2 mt-0.5">⚠️</div>
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Anggaran</label>
                            <select 
                                required
                                className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-green-500 focus:border-green-500 border p-2.5 bg-gray-50"
                                value={fiscalYearId}
                                onChange={(e) => setFiscalYearId(e.target.value)}
                            >
                                {fiscalYears.map(fy => (
                                    <option key={fy.id} value={fy.id}>{fy.year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Skema Hibah</label>
                            <select 
                                required
                                className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-green-500 focus:border-green-500 border p-2.5 bg-white"
                                value={schemeId}
                                onChange={(e) => setSchemeId(e.target.value)}
                            >
                                <option value="">-- Pilih Skema --</option>
                                {schemes.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Proposal</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Judul lengkap penelitian/pengabdian..."
                            className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-green-500 focus:border-green-500 border p-2.5"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Abstract */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Abstrak / Ringkasan</label>
                        <div className="bg-white">
                             <ReactQuill 
                                theme="snow"
                                value={abstract}
                                onChange={setAbstract}
                                className="h-64 mb-12"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}],
                                        ['link'],
                                        ['clean']
                                    ],
                                }}
                             />
                        </div>
                    </div>

                    {/* Budget & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Rencana Anggaran Biaya (Rp)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <input 
                                    type="number" 
                                    required
                                    min="0"
                                    placeholder="0"
                                    className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-green-500 focus:border-green-500 border p-2.5 pl-10"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi (Opsional)</label>
                            <input 
                                type="text" 
                                placeholder="Lokasi kegiatan (jika ada)..."
                                className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-green-500 focus:border-green-500 border p-2.5"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 bg-gray-50 hover:bg-white transition-colors">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Unggah Dokumen Proposal (PDF)</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk unggah</span> atau drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf"
                                    required
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        {file && (
                            <div className="mt-2 text-sm text-green-600 font-medium flex items-center">
                                <FileText size={16} className="mr-1" />
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100 space-x-3">
                        <button 
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2.5 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className={`px-6 py-2.5 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Mengirim...' : 'Kirim Proposal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
