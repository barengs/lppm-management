import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const DEFAULT_SETTINGS = {
    w1_max: 10, w2_max: 10, w3_max: 10, w4_max: 10,
    secondary_max: 60,
    article_max: 100,
};

export default function KknGradingSettings() {
    const { token } = useAuth();
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        axios.get('/api/kkn-periods', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                setPeriods(r.data?.data || r.data || []);
                const active = (r.data?.data || r.data || []).find(p => p.is_active);
                if (active) setSelectedPeriod(String(active.id));
            });
    }, [token]);

    useEffect(() => {
        if (!selectedPeriod) return;
        axios.get(`/api/kkn-grades/settings?kkn_period_id=${selectedPeriod}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            if (r.data) setSettings({ ...DEFAULT_SETTINGS, ...r.data });
            else setSettings(DEFAULT_SETTINGS);
        }).catch(() => setSettings(DEFAULT_SETTINGS));
    }, [selectedPeriod, token]);

    const maxPrimer = settings.w1_max + settings.w2_max + settings.w3_max + settings.w4_max;
    const maxTotalBobot = maxPrimer + settings.secondary_max;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedPeriod) { toast.error('Pilih periode KKN terlebih dahulu.'); return; }
        setIsSaving(true);
        try {
            await axios.post('/api/kkn-grades/settings', {
                kkn_period_id: selectedPeriod,
                ...settings
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Pengaturan penilaian berhasil disimpan.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
        } finally {
            setIsSaving(false);
        }
    };

    const Field = ({ label, fieldKey, help }) => (
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="number" min="1" max="500"
                    value={settings[fieldKey]}
                    onChange={e => setSettings(p => ({ ...p, [fieldKey]: Number(e.target.value) }))}
                    className="w-24 border border-gray-300 rounded-sm p-2 text-sm font-bold text-center focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs text-gray-400">{help}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="bg-white shadow p-6 border-l-4 border-green-600">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="text-green-700" size={26} /> Pengaturan Penilaian KKN
                </h1>
                <p className="text-sm text-gray-500 mt-1">Atur batas poin maksimal untuk setiap komponen penilaian per periode KKN.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Periode KKN</label>
                <select
                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                >
                    <option value="">-- Pilih Periode --</option>
                    {periods.map(p => (
                        <option key={p.id} value={p.id}>{p.name || p.year} {p.is_active ? '(Aktif)' : ''}</option>
                    ))}
                </select>
            </div>

            {selectedPeriod && (
                <form onSubmit={handleSave} className="space-y-6">
                    {/* A. Nilai Primer */}
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">A</span>
                            Nilai Primer (Mingguan)
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">Nilai yang diberikan oleh <strong>DPL</strong> setiap minggu selama pelaksanaan KKN.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Field label="Minggu 1" fieldKey="w1_max" help="poin maks" />
                            <Field label="Minggu 2" fieldKey="w2_max" help="poin maks" />
                            <Field label="Minggu 3" fieldKey="w3_max" help="poin maks" />
                            <Field label="Minggu 4" fieldKey="w4_max" help="poin maks" />
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500">
                            Total maksimal Nilai Primer: <strong className="text-blue-700">{maxPrimer} poin</strong>
                        </div>
                    </div>

                    {/* B. Nilai Sekunder */}
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-black">B</span>
                            Nilai Sekunder (Kegiatan Lapangan)
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">Nilai kegiatan lapangan yang diberikan oleh <strong>DPL</strong>.</p>
                        <Field label="Nilai Sekunder Maksimal" fieldKey="secondary_max" help="poin maks" />
                        <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500">
                            Total Bobot Maks (Primer + Sekunder): <strong className="text-green-700">{maxTotalBobot} poin</strong>
                        </div>
                    </div>

                    {/* C. Nilai Artikel */}
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">C</span>
                            Nilai Artikel Ilmiah (Luaran)
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">Nilai artikel ilmiah yang diberikan oleh <strong>LPPM</strong>.</p>
                        <Field label="Nilai Artikel Maksimal" fieldKey="article_max" help="poin maks" />
                    </div>

                    {/* Formula Preview */}
                    <div className="bg-blue-50 border border-blue-100 rounded-sm p-4 text-xs text-blue-800 space-y-1">
                        <p className="font-bold mb-2">📐 Formula Nilai Akhir:</p>
                        <p><strong>Total Bobot</strong> = (M1 + M2 + M3 + M4) + Sekunder</p>
                        <p><strong>Nilai Akhir</strong> = (Total Bobot + Nilai Artikel) ÷ 2</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving}
                            className="px-8 py-3 bg-green-700 text-white rounded-sm font-bold text-sm uppercase tracking-wider hover:bg-green-800 disabled:opacity-50 flex items-center gap-2 shadow-md">
                            <Save size={16} />
                            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
