import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Award, Zap } from 'lucide-react';

export default function StepOutputs({ proposalId, token, onNext, onBack, initialData }) {
    const [outputs, setOutputs] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [outputTypes, setOutputTypes] = useState([]);

    useEffect(() => {
        axios.get('/api/master/selections/output_type', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setOutputTypes(res.data));

        if (initialData?.outputs && initialData.outputs.length > 0) {
            setOutputs(initialData.outputs);
        } else {
            // Default mandatory output
            setOutputs([{ category: 'mandatory', type: 'Publikasi Jurnal Internasional/Nasional', target_description: '' }]);
        }
    }, [initialData]);

    const addOutput = (category) => {
        setOutputs([...outputs, { category, type: '', target_description: '' }]);
    };

    const removeOutput = (index) => {
        setOutputs(outputs.filter((_, i) => i !== index));
    };

    const updateOutput = (index, field, value) => {
        const newOutputs = [...outputs];
        newOutputs[index][field] = value;
        setOutputs(newOutputs);
    };

    const handleSave = async () => {
        if (outputs.some(o => !o.type || !o.target_description)) {
            setError("Semua field luaran harus diisi.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 3,
                outputs: outputs
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaving(false);
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan luaran.");
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Mandatory Outputs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center">
                        <Award className="text-green-600 mr-2" size={18} />
                        Luaran Wajib
                    </h3>
                    <button 
                        onClick={() => addOutput('mandatory')}
                        className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center"
                    >
                        <Plus size={14} className="mr-1" /> Tambah Luaran Wajib
                    </button>
                </div>
                
                {outputs.filter(o => o.category === 'mandatory').map((output, idx) => {
                    const originalIdx = outputs.indexOf(output);
                    return (
                        <div key={idx} className="p-4 border border-green-100 bg-green-50/30 rounded-sm space-y-3 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Jenis Luaran</label>
                                    <select 
                                        className="w-full text-sm border border-gray-200 p-2 rounded-sm bg-white"
                                        value={output.type}
                                        onChange={e => updateOutput(originalIdx, 'type', e.target.value)}
                                    >
                                        <option value="">-- Pilih Jenis Luaran --</option>
                                        {outputTypes.map(t => (
                                            <option key={t.key} value={t.key}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Luaran</label>
                                    <input 
                                        type="text"
                                        placeholder="Misal: Q1/Q2, Sinta 1, dsb..."
                                        className="w-full text-sm border border-gray-200 p-2 rounded-sm"
                                        value={output.target_description}
                                        onChange={e => updateOutput(originalIdx, 'target_description', e.target.value)}
                                    />
                                </div>
                            </div>
                            {outputs.filter(o => o.category === 'mandatory').length > 1 && (
                                <button 
                                    onClick={() => removeOutput(originalIdx)}
                                    className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 rounded-full p-1 shadow-sm hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Optional Outputs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center">
                        <Zap className="text-blue-600 mr-2" size={18} />
                        Luaran Tambahan (Opsional)
                    </h3>
                    <button 
                        onClick={() => addOutput('optional')}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center"
                    >
                        <Plus size={14} className="mr-1" /> Tambah Luaran Tambahan
                    </button>
                </div>
                
                {outputs.filter(o => o.category === 'optional').length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 border border-dashed rounded-sm italic">
                        Tidak ada luaran tambahan yang ditambahkan.
                    </p>
                )}

                {outputs.filter(o => o.category === 'optional').map((output, idx) => {
                    const originalIdx = outputs.indexOf(output);
                    return (
                        <div key={idx} className="p-4 border border-blue-100 bg-blue-50/30 rounded-sm space-y-3 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Jenis Luaran</label>
                                    <select 
                                        className="w-full text-sm border border-gray-200 p-2 rounded-sm bg-white"
                                        value={output.type}
                                        onChange={e => updateOutput(originalIdx, 'type', e.target.value)}
                                    >
                                        <option value="">-- Pilih Jenis Luaran --</option>
                                        {outputTypes.map(t => (
                                            <option key={t.key} value={t.key}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Luaran</label>
                                    <input 
                                        type="text"
                                        placeholder="Misal: YouTube, Penerbit Nasional..."
                                        className="w-full text-sm border border-gray-200 p-2 rounded-sm"
                                        value={output.target_description}
                                        onChange={e => updateOutput(originalIdx, 'target_description', e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => removeOutput(originalIdx)}
                                className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 rounded-full p-1 shadow-sm hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-sm">{error}</div>}

            <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Kembali
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-2 bg-green-700 text-white rounded-sm text-sm font-bold shadow-md hover:bg-green-800 disabled:opacity-50"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan & Lanjut'}
                </button>
            </div>
        </div>
    );
}
