import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileText, CheckCircle, Circle } from 'lucide-react';

// Components
import StepTkt from './components/StepTkt';
import StepIdentity from './components/StepIdentity';
import StepPersonnel from './components/StepPersonnel';
import StepOutputs from './components/StepOutputs';
import StepRAB from './components/StepRAB';
import StepSubstance from './components/StepSubstance';
import StepFinal from './components/StepFinal';

const STEPS = [
    { id: 0, name: 'Kuesioner TKT', label: 'TKT' },
    { id: 1, name: 'Identitas Usulan', label: 'Identitas' },
    { id: 2, name: 'Manajemen Personil', label: 'Personil' },
    { id: 3, name: 'Luaran Dijanjikan', label: 'Luaran' },
    { id: 4, name: 'Rincian Anggaran', label: 'RAB' },
    { id: 5, name: 'Substansi Usulan', label: 'Substansi' },
    { id: 6, name: 'Konfirmasi Akhir', label: 'Submit' }
];

export default function Create() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    
    // Core State
    const [proposalId, setProposalId] = useState(id || null);
    const [currentStep, setCurrentStep] = useState(0);
    const [proposalData, setProposalData] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    
    // Initial Form State
    const [schemes, setSchemes] = useState([]);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [initialForm, setInitialForm] = useState({
        title: '',
        scheme_id: '',
        fiscal_year_id: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [schemesRes, fyRes] = await Promise.all([
                    axios.get('/api/schemes', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/fiscal-years/active', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setSchemes(schemesRes.data);
                setFiscalYears(fyRes.data);
                if (fyRes.data.length > 0) {
                    setInitialForm(prev => ({ ...prev, fiscal_year_id: fyRes.data[0].id }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitialData();
    }, [token]);

    useEffect(() => {
        if (proposalId) {
            fetchProposalDetail();
        }
    }, [proposalId, token]);

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setIsInitialLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/proposals', initialForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposalId(res.data.id);
            setProposalData(res.data);
            setIsInitialLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal membuat draf proposal. Periksa eligibility skema.");
            setIsInitialLoading(false);
        }
    };

    const fetchProposalDetail = async () => {
        if (!proposalId) return;
        try {
            const res = await axios.get(`/api/proposals/${proposalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposalData(res.data);
            setCurrentStep(res.data.current_step || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const onStepNext = () => {
        fetchProposalDetail();
        if (currentStep < 6) setCurrentStep(currentStep + 1);
    };

    const onStepBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    // Render Initial Form (Stage 1)
    if (!proposalId) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-white shadow-xl rounded-sm border border-gray-100 overflow-hidden">
                    <div className="bg-green-700 px-8 py-6">
                        <h1 className="text-2xl font-bold text-white flex items-center">
                            <FileText className="mr-3" size={32} />
                            Pengajuan Usulan Baru
                        </h1>
                        <p className="text-green-100 mt-2">Daftarkan judul dan pilih skema hibah untuk memulai pengisian detail usulan (BIMA Mirror).</p>
                    </div>

                    <div className="p-10">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start text-sm">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleInitialSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Skema Kegiatan</label>
                                    <select 
                                        required
                                        className="w-full border-gray-300 rounded-sm p-3 bg-gray-50 focus:ring-green-500 transition-all"
                                        value={initialForm.scheme_id}
                                        onChange={e => setInitialForm({...initialForm, scheme_id: e.target.value})}
                                    >
                                        <option value="">-- Pilih Skema Hibah --</option>
                                        {schemes.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Tahun Akademik</label>
                                    <select 
                                        required
                                        className="w-full border-gray-300 rounded-sm p-3 bg-white"
                                        value={initialForm.fiscal_year_id}
                                        onChange={e => setInitialForm({...initialForm, fiscal_year_id: e.target.value})}
                                    >
                                        {fiscalYears.map(fy => (
                                            <option key={fy.id} value={fy.id}>{fy.year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Judul Usulan</label>
                                <textarea 
                                    required
                                    rows={3}
                                    placeholder="Masukkan judul lengkap usulan penelitian/pengabdian..."
                                    className="w-full border-gray-300 rounded-sm p-3 focus:ring-green-500"
                                    value={initialForm.title}
                                    onChange={e => setInitialForm({...initialForm, title: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit"
                                    disabled={isInitialLoading}
                                    className="px-10 py-3 bg-green-700 text-white rounded-sm font-bold shadow-lg hover:bg-green-800 transition-all disabled:opacity-50"
                                >
                                    {isInitialLoading ? 'Memproses...' : 'Lanjutkan ke Detail Usulan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Render Stepper (Stage 2)
    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="bg-white shadow-2xl rounded-sm border border-gray-100">
                {/* Stepper Header */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{proposalData?.title}</h2>
                            <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                                {proposalData?.scheme?.name} • ID Usulan: #{proposalId}
                            </p>
                        </div>
                        <div className="flex items-center space-x-1">
                            {STEPS.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            currentStep === idx 
                                                ? 'bg-green-700 text-white shadow-md' 
                                                : currentStep > idx ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {currentStep > idx ? <CheckCircle size={16} /> : idx + 1}
                                        </div>
                                        <span className={`text-[10px] mt-1 hidden md:block ${currentStep === idx ? 'font-bold text-green-800' : 'text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {idx < 6 && <div className={`w-6 md:w-12 h-0.5 mx-1 transition-colors ${currentStep > idx ? 'bg-green-400' : 'bg-gray-200'}`} />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Visual */}
                <div className="w-full h-1 bg-gray-100 overflow-hidden">
                    <div 
                        className="h-full bg-green-700 transition-all duration-500" 
                        style={{ width: `${((currentStep + 1) / 7) * 100}%` }} 
                    />
                </div>

                {/* Step Content */}
                <div className="p-8 min-h-[500px]">
                    <h3 className="text-lg font-bold text-gray-700 mb-8 border-l-4 border-green-700 pl-4">
                        TAHAP {currentStep + 1}: {STEPS[currentStep].name}
                    </h3>
                    
                    {currentStep === 0 && <StepTkt proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} />}
                    {currentStep === 1 && <StepIdentity proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 2 && <StepPersonnel proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 3 && <StepOutputs proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 4 && <StepRAB proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 5 && <StepSubstance proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 6 && <StepFinal proposalId={proposalId} token={token} onBack={onStepBack} initialData={proposalData} />}
                </div>
            </div>
        </div>
    );
}
