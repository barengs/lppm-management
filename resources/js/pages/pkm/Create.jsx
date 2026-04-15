import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, FileHeart } from 'lucide-react';
import { toast } from 'react-toastify';

// Step Components
import StepPkmIdentity  from './components/StepPkmIdentity';
import StepPkmPersonnel from './components/StepPkmPersonnel';
import StepPkmPartner   from './components/StepPkmPartner';
import StepPkmAstaCita  from './components/StepPkmAstaCita';
import StepPkmStrategic from './components/StepPkmStrategic';
import StepPkmOutputs   from './components/StepPkmOutputs';
import StepPkmBudget    from './components/StepPkmBudget';
import StepPkmDocument  from './components/StepPkmDocument';

const STEPS = [
    { id: 0, name: 'Identitas & Ringkasan Skema', label: 'Identitas' },
    { id: 1, name: 'Tim Pengusul',                label: 'Tim' },
    { id: 2, name: 'Mitra Kerjasama',             label: 'Mitra' },
    { id: 3, name: 'SDGs',                        label: 'SDGs' },
    { id: 4, name: '8 Bidang Strategis',          label: 'Bidang' },
    { id: 5, name: 'Luaran Dijanjikan',           label: 'Luaran' },
    { id: 6, name: 'Rincian Anggaran (RAB)',      label: 'RAB' },
    { id: 7, name: 'Dokumen & Pratinjau',         label: 'Dokumen' },
];

const STATUS_COLORS = {
    draft:     'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-700',
    review:    'bg-yellow-100 text-yellow-700',
    accepted:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function PkmCreate() {
    const navigate = useNavigate();
    const { id }   = useParams();
    const { token } = useAuth();

    const [proposalId,   setProposalId]   = useState(id || null);
    const [currentStep,  setCurrentStep]  = useState(0);
    const [proposalData, setProposalData] = useState(null);
    const [isSubmitted,  setIsSubmitted]  = useState(false);

    // Initial form (new PKM)
    const [fiscalYears, setFiscalYears]   = useState([]);
    const [initForm,    setInitForm]      = useState({ title: '', fiscal_year_id: '' });
    const [initLoading, setInitLoading]   = useState(false);
    const [initError,   setInitError]     = useState(null);

    useEffect(() => {
        axios.get('/api/fiscal-years/active', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                setFiscalYears(r.data);
                if (r.data.length > 0) setInitForm(f => ({ ...f, fiscal_year_id: r.data[0].id }));
            })
            .catch(() => {});
    }, [token]);

    useEffect(() => {
        if (proposalId) fetchDetail();
    }, [proposalId]);

    const fetchDetail = async () => {
        try {
            const r = await axios.get(`/api/pkm-proposals/${proposalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposalData(r.data);
            setCurrentStep(r.data.current_step || 0);
        } catch { }
    };

    const handleInitSubmit = async (e) => {
        e.preventDefault();
        setInitLoading(true);
        setInitError(null);
        try {
            const r = await axios.post('/api/pkm-proposals', initForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposalId(r.data.id);
            setProposalData(r.data);
        } catch (err) {
            setInitError(err.response?.data?.message || 'Gagal membuat draf PKM.');
        } finally {
            setInitLoading(false);
        }
    };

    const onStepNext = () => {
        fetchDetail();
        if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
        else {
            // All steps done → PKM ready to submit
            setIsSubmitted(false);
        }
    };

    const onStepBack = () => {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    };

    const handleFinalSubmit = async () => {
        try {
            await axios.post(`/api/pkm-proposals/${proposalId}/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Proposal PKM berhasil dikirim ke LPPM!');
            setIsSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengirim proposal.');
        }
    };

    // ------ Render: Initial Form (No proposal yet) ------
    if (!proposalId) {
        return (
            <div className="max-w-3xl mx-auto py-8">
                <div className="bg-white shadow-xl rounded-sm overflow-hidden border border-gray-100">
                    <div className="bg-green-700 px-8 py-8 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <FileHeart size={32} className="opacity-90" />
                            <h1 className="text-2xl font-bold">Pengajuan Proposal PKM</h1>
                        </div>
                        <p className="text-green-100 text-sm">
                            Program Kemitraan Masyarakat — Daftarkan judul dan tahun untuk memulai pengisian.
                        </p>
                    </div>
                    <div className="p-8">
                        {initError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                                ⚠️ {initError}
                            </div>
                        )}
                        <form onSubmit={handleInitSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                    Tahun Anggaran <span className="text-red-500">*</span>
                                </label>
                                <select required value={initForm.fiscal_year_id}
                                    onChange={e => setInitForm(f => ({ ...f, fiscal_year_id: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-green-500">
                                    <option value="">-- Pilih Tahun Anggaran --</option>
                                    {fiscalYears.map(fy => (
                                        <option key={fy.id} value={fy.id}>{fy.year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                    Judul Proposal PKM <span className="text-red-500">*</span>
                                </label>
                                <textarea required rows={3}
                                    placeholder="Masukkan judul lengkap proposal PKM..."
                                    className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-green-500"
                                    value={initForm.title}
                                    onChange={e => setInitForm(f => ({ ...f, title: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={initLoading}
                                    className="px-8 py-3 bg-green-700 text-white rounded-sm font-bold shadow-lg hover:bg-green-800 transition-all disabled:opacity-50 text-sm">
                                    {initLoading ? 'Memproses...' : 'Mulai Pengisian →'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ------ Render: Submitted Confirmation ------
    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Proposal PKM Berhasil Dikirim!</h2>
                <p className="text-gray-500 mb-6">Proposal PKM Anda telah dikirim ke LPPM dan sedang dalam proses review.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/pkm')}
                        className="px-6 py-2.5 bg-green-700 text-white rounded-sm font-bold hover:bg-green-800 transition-all text-sm">
                        Kembali ke Daftar PKM
                    </button>
                    <button onClick={() => navigate(`/pkm/${proposalId}`)}
                        className="px-6 py-2.5 border border-gray-300 rounded-sm text-gray-700 font-semibold hover:bg-gray-50 text-sm">
                        Lihat Detail
                    </button>
                </div>
            </div>
        );
    }

    // ------ Render: Stepper Wizard ------
    const isPastAllSteps = proposalData?.current_step >= STEPS.length;

    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="bg-white shadow-2xl rounded-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-green-700 px-8 py-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <FileHeart size={20} className="opacity-80" />
                                <span className="text-xs text-green-200 font-semibold uppercase tracking-wider">PKM #{proposalId}</span>
                                {proposalData?.status && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[proposalData.status] || ''}`}>
                                        {proposalData.status}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg font-bold leading-tight">{proposalData?.title || 'Memuat...'}</h2>
                            <p className="text-green-200 text-xs mt-1">Tahun Anggaran: {proposalData?.fiscal_year?.year || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center overflow-x-auto gap-0">
                        {STEPS.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center shrink-0">
                                    <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-xs font-bold transition-all ${
                                        currentStep === idx
                                            ? 'bg-green-700 text-white shadow-md ring-2 ring-green-300'
                                            : currentStep > idx
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-400'
                                    }`}>
                                        {currentStep > idx ? <CheckCircle size={16} /> : idx + 1}
                                    </div>
                                    <span className={`text-[9px] mt-1 hidden sm:block text-center w-14 ${
                                        currentStep === idx ? 'font-bold text-green-800' : 'text-gray-400'
                                    }`}>{step.label}</span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 transition-colors ${currentStep > idx ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div className="h-full bg-green-600 transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
                </div>

                {/* Step Content */}
                <div className="p-8 min-h-[480px]">
                    <h3 className="text-base font-bold text-gray-700 mb-6 border-l-4 border-green-600 pl-4">
                        TAHAP {currentStep + 1} dari {STEPS.length}: {STEPS[currentStep].name}
                    </h3>

                    {isPastAllSteps && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm text-green-800 text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600 shrink-0" />
                            Semua tahap telah diisi. Silakan kirim proposal PKM Anda ke LPPM.
                        </div>
                    )}

                    {currentStep === 0 && <StepPkmIdentity  proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 1 && <StepPkmPersonnel proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 2 && <StepPkmPartner   proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 3 && <StepPkmAstaCita  proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 4 && <StepPkmStrategic proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 5 && <StepPkmOutputs   proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 6 && <StepPkmBudget    proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                    {currentStep === 7 && <StepPkmDocument  proposalId={proposalId} token={token} onNext={onStepNext} onBack={onStepBack} initialData={proposalData} />}
                </div>

                {/* Footer: Final Submit */}
                {isPastAllSteps && (
                    <div className="px-8 pb-8 flex justify-end">
                        <button onClick={handleFinalSubmit}
                            className="px-10 py-3 bg-green-700 text-white rounded-sm font-bold shadow-lg hover:bg-green-800 transition-all text-sm">
                            🚀 Kirim ke LPPM
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
