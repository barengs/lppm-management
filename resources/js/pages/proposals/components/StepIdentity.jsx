import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';

export default function StepIdentity({ proposalId, token, onNext, onBack, initialData }) {
    const [formData, setFormData] = useState({
        duration_years: 1,
        science_cluster_level_1: '',
        science_cluster_level_2: '',
        science_cluster_level_3: '',
        focus_area: '',
        research_theme: '',
        research_topic: '',
        sdg_goal: '',
        tkt_initial: initialData?.tkt_level || 1,
        tkt_target: initialData?.identity?.tkt_target || (initialData?.tkt_level ? initialData.tkt_level + 1 : 2)
    });
    
    // Master Lists
    const [clustersL1, setClustersL1] = useState([]);
    const [clustersL2, setClustersL2] = useState([]);
    const [clustersL3, setClustersL3] = useState([]);
    
    const [focusAreas, setFocusAreas] = useState([]);
    const [themes, setThemes] = useState([]);
    const [topics, setTopics] = useState([]);
    const [sdgs, setSdgs] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Initial Load & Master Data L1
    useEffect(() => {
        const fetchL1 = async () => {
            try {
                const [cRes, fRes, sRes] = await Promise.all([
                    axios.get('/api/master/science-clusters?level=1', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/master/research-priorities?type=focus_area', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/master/selections/sdg_goal', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setClustersL1(cRes.data);
                setFocusAreas(fRes.data);
                setSdgs(sRes.data);
            } catch (err) { console.error(err); }
        };

        if (token) fetchL1();

        if (initialData?.identity) {
            setFormData(initialData.identity);
        }
    }, [initialData, token]);

    // Handle Cascading Clusters
    useEffect(() => {
        if (formData.science_cluster_level_1) {
            axios.get(`/api/master/science-clusters?parent_id=${formData.science_cluster_level_1}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setClustersL2(res.data));
        } else {
            setClustersL2([]);
            setClustersL3([]);
        }
    }, [formData.science_cluster_level_1, token]);

    useEffect(() => {
        if (formData.science_cluster_level_2) {
            axios.get(`/api/master/science-clusters?parent_id=${formData.science_cluster_level_2}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setClustersL3(res.data));
        } else {
            setClustersL3([]);
        }
    }, [formData.science_cluster_level_2, token]);

    // Handle Cascading Priorities
    useEffect(() => {
        if (formData.focus_area) {
            axios.get(`/api/master/research-priorities?parent_id=${formData.focus_area}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setThemes(res.data));
        } else {
            setThemes([]);
            setTopics([]);
        }
    }, [formData.focus_area, token]);

    useEffect(() => {
        if (formData.research_theme) {
            axios.get(`/api/master/research-priorities?parent_id=${formData.research_theme}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setTopics(res.data));
        } else {
            setTopics([]);
        }
    }, [formData.research_theme, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 1,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaving(false);
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan identitas usulan.");
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Rumpun Ilmu</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select 
                            required
                            className="text-sm border border-gray-300 rounded-sm p-2 bg-white"
                            value={formData.science_cluster_level_1}
                            onChange={e => setFormData({...formData, science_cluster_level_1: e.target.value, science_cluster_level_2: '', science_cluster_level_3: ''})}
                        >
                            <option value="">-- Pilih Level 1 --</option>
                            {clustersL1.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select 
                            required
                            disabled={!formData.science_cluster_level_1}
                            className="text-sm border border-gray-300 rounded-sm p-2 bg-white disabled:bg-gray-50"
                            value={formData.science_cluster_level_2}
                            onChange={e => setFormData({...formData, science_cluster_level_2: e.target.value, science_cluster_level_3: ''})}
                        >
                            <option value="">-- Pilih Level 2 --</option>
                            {clustersL2.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select 
                            required
                            disabled={!formData.science_cluster_level_2}
                            className="text-sm border border-gray-300 rounded-sm p-2 bg-white disabled:bg-gray-50"
                            value={formData.science_cluster_level_3}
                            onChange={e => setFormData({...formData, science_cluster_level_3: e.target.value})}
                        >
                            <option value="">-- Pilih Level 3 --</option>
                            {clustersL3.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Bidang Fokus</label>
                    <select 
                        required
                        className="w-full text-sm border border-gray-300 rounded-sm p-2 bg-white"
                        value={formData.focus_area}
                        onChange={e => setFormData({...formData, focus_area: e.target.value, research_theme: '', research_topic: ''})}
                    >
                        <option value="">-- Pilih Bidang Fokus --</option>
                        {focusAreas.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Lama Kegiatan (Tahun)</label>
                    <select 
                        className="w-full text-sm border border-gray-300 rounded-sm p-2 bg-white"
                        value={formData.duration_years}
                        onChange={e => setFormData({...formData, duration_years: e.target.value})}
                    >
                        <option value={1}>1 Tahun</option>
                        <option value={2}>2 Tahun</option>
                        <option value={3}>3 Tahun</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Target SDGs</label>
                    <select 
                        required
                        className="w-full text-sm border border-gray-300 rounded-sm p-2 bg-white"
                        value={formData.sdg_goal}
                        onChange={e => setFormData({...formData, sdg_goal: e.target.value})}
                    >
                        <option value="">-- Pilih Target SDGs --</option>
                        {sdgs.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Tema Penelitian</label>
                    <select 
                        required
                        disabled={!formData.focus_area}
                        className="w-full text-sm border border-gray-300 rounded-sm p-2 bg-white disabled:bg-gray-50"
                        value={formData.research_theme}
                        onChange={e => setFormData({...formData, research_theme: e.target.value, research_topic: ''})}
                    >
                        <option value="">-- Pilih Tema --</option>
                        {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Topik Penelitian</label>
                    <select 
                        required
                        disabled={!formData.research_theme}
                        className="w-full text-sm border border-gray-300 rounded-sm p-2 bg-white disabled:bg-gray-50"
                        value={formData.research_topic}
                        onChange={e => setFormData({...formData, research_topic: e.target.value})}
                    >
                        <option value="">-- Pilih Topik --</option>
                        {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-sm border border-gray-100">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">TKT Saat Ini (Awal)</label>
                    <input 
                        type="number"
                        readOnly
                        className="w-full border border-gray-200 rounded-sm p-2 bg-gray-100"
                        value={formData.tkt_initial}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">*Nilai otomatis dari Kuesioner TKT</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Target TKT Akhir</label>
                    <input 
                        type="number"
                        min={initialData?.tkt_level || 1}
                        max={9}
                        required
                        className="w-full border border-gray-300 rounded-sm p-2"
                        value={formData.tkt_target}
                        onChange={e => setFormData({...formData, tkt_target: e.target.value})}
                    />
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-sm">{error}</div>}

            <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Kembali
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2 bg-green-700 text-white rounded-sm text-sm font-bold shadow-md hover:bg-green-800 disabled:opacity-50"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan & Lanjut'}
                </button>
            </div>
        </form>
    );
}
