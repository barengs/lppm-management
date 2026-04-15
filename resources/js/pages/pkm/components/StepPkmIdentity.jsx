import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';

const SCHEME_GROUPS = [
    'Penelitian Dasar',
    'Penelitian Terapan',
    'Penelitian Pengembangan',
    'Pengabdian Berbasis Riset',
    'Pemberdayaan Berbasis Masyarakat',
    'Pemberdayaan Kemitraan',
    'Penugasan',
];

const SCOPES = [
    'Pemberdayaan Kemitraan Masyarakat',
    'Pemberdayaan Berbasis Masyarakat',
    'Pengembangan Wilayah Terpadu',
    'Hilirisasi Hasil Riset Perguruan Tinggi',
    'Pengembangan Desa Mitra',
];

const FOCUS_AREAS = [
    'Kesehatan',
    'Pangan',
    'Energi',
    'Teknologi Informasi',
    'Lingkungan',
    'Sosial Humaniora',
    'Pendidikan',
    'Ekonomi',
    'Pertanian',
    'Kelautan dan Perikanan',
    'Industri Kreatif',
    'Lainnya',
];

export default function StepPkmIdentity({ proposalId, token, onNext, initialData }) {
    const [form, setForm] = useState({
        title:             '',
        substance_summary: '',
        keywords:          '',
        scheme_group:      '',
        scope:             '',
        focus_area:        '',
        duration_years:    1,
        first_year:        new Date().getFullYear(),
    });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                title:             initialData.title             || '',
                substance_summary: initialData.substance_summary || '',
                keywords:          initialData.keywords          || '',
                scheme_group:      initialData.scheme_group      || '',
                scope:             initialData.scope             || '',
                focus_area:        initialData.focus_area        || '',
                duration_years:    initialData.duration_years    || 1,
                first_year:        initialData.first_year        || new Date().getFullYear(),
            });
        }
    }, [initialData]);

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 0, ...form },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onNext();
        } catch (err) {
            const msgs = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : err.response?.data?.message || 'Gagal menyimpan.';
            setError(msgs);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Judul */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Judul Pengabdian <span className="text-red-500">*</span>
                </label>
                <textarea required rows={3}
                    className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-green-500 transition-all font-medium"
                    placeholder="Masukkan judul lengkap proposal PKM..."
                    value={form.title}
                    onChange={e => set('title', e.target.value)} />
            </div>

            {/* Metadata Skema */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
                <div className="bg-green-50 px-5 py-3 border-b border-green-200">
                    <h4 className="font-bold text-green-800 text-sm">📋 Informasi Skema</h4>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Kelompok Skema <span className="text-red-500">*</span>
                        </label>
                        <select required value={form.scheme_group}
                            onChange={e => set('scheme_group', e.target.value)}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">-- Pilih Kelompok Skema --</option>
                            {SCHEME_GROUPS.map((s, i) => <option key={i} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Ruang Lingkup <span className="text-red-500">*</span>
                        </label>
                        <select required value={form.scope}
                            onChange={e => set('scope', e.target.value)}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">-- Pilih Ruang Lingkup --</option>
                            {SCOPES.map((s, i) => <option key={i} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Bidang Fokus <span className="text-red-500">*</span>
                        </label>
                        <select required value={form.focus_area}
                            onChange={e => set('focus_area', e.target.value)}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">-- Pilih Bidang Fokus --</option>
                            {FOCUS_AREAS.map((f, i) => <option key={i} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Lama Kegiatan (Tahun) <span className="text-red-500">*</span>
                        </label>
                        <select required value={form.duration_years}
                            onChange={e => set('duration_years', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                            <option value={1}>1 Tahun</option>
                            <option value={2}>2 Tahun</option>
                            <option value={3}>3 Tahun</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            Tahun Pertama Usulan <span className="text-red-500">*</span>
                        </label>
                        <input type="number" required min={2020} max={2040}
                            value={form.first_year}
                            onChange={e => set('first_year', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
            </div>

            {/* Substansi - Section 9 BIMA */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
                <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-200">
                    <h4 className="font-bold text-indigo-800 text-sm">📝 Substansi Proposal</h4>
                    <p className="text-xs text-indigo-500 mt-0.5">Ringkasan substansi menjelaskan latar belakang, solusi, metode pelaksanaan, dan manfaat PKM secara komprehensif.</p>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Ringkasan Substansi <span className="text-red-500">*</span>
                        </label>
                        <textarea required rows={10}
                            className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Tuliskan ringkasan substansi PKM yang mencakup: latar belakang permasalahan, solusi yang ditawarkan, metode pelaksanaan, luaran dan manfaat bagi mitra..."
                            value={form.substance_summary}
                            onChange={e => set('substance_summary', e.target.value)} />
                        <p className="text-xs text-gray-500 mt-1">Min. 300 kata. Uraikan permasalahan mitra, solusi, metode, luaran, dan dampak yang diharapkan.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Keyword <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required
                            className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Contoh: Pemberdayaan Masyarakat; Tanaman Obat Keluarga (TOGA); Bebas Mikroplastik; Kesehatan Preventif"
                            value={form.keywords}
                            onChange={e => set('keywords', e.target.value)} />
                        <p className="text-xs text-gray-500 mt-1">Pisahkan keyword dengan titik koma ( ; ).</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-green-700 text-white rounded-sm font-bold shadow hover:bg-green-800 transition-all disabled:opacity-50 text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
