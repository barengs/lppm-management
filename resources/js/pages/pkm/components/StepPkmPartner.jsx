import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PARTNER_CATEGORIES = [
    { value: 'sasaran',          label: 'Kelompok Sasaran (Masyarakat)' },
    { value: 'mitra_pemerintah', label: 'Mitra Pemerintah' },
    { value: 'mitra_dudi',       label: 'Mitra DUDI (Dunia Usaha & Industri)' },
    { value: 'mitra_pt',         label: 'Mitra Perguruan Tinggi' },
];

const emptyPartner = {
    partner_category:    'sasaran',
    partner_name:        '',    // Nama Mitra Sasaran
    partner_description: '',    // Kelompok Mitra Sasaran (deskripsi)
    group_name:          '',    // Nama kelompok (alternatif/opsional)
    leader_name:         '',
    group_type:          '',
    member_count:        '',
    problem_scope_1:     '',
    problem_scope_2:     '',
    province:            '',
    city:                '',
    district:            '',
    village:             '',
    address:             '',
};

export default function StepPkmPartner({ proposalId, token, onNext, onBack, initialData }) {
    const [partners, setPartners] = useState([{ ...emptyPartner }]);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [provinces, setProvinces] = useState([]);

    useEffect(() => {
        if (initialData?.partners?.length > 0) {
            setPartners(initialData.partners.map(p => ({
                partner_category:    p.partner_category    || 'sasaran',
                partner_name:        p.partner_name        || '',
                partner_description: p.partner_description || '',
                group_name:          p.group_name          || '',
                leader_name:         p.leader_name         || '',
                group_type:          p.group_type          || '',
                member_count:        p.member_count        || '',
                problem_scope_1:     p.problem_scope_1     || '',
                problem_scope_2:     p.problem_scope_2     || '',
                province:            p.province            || '',
                city:                p.city                || '',
                district:            p.district            || '',
                village:             p.village             || '',
                address:             p.address             || '',
            })));
        }
    }, [initialData]);

    useEffect(() => {
        axios.get('/api/indonesia/provinces', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setProvinces(r.data || []))
            .catch(() => {});
    }, [token]);

    const addPartner   = () => setPartners(p => [...p, { ...emptyPartner }]);
    const removePartner = (idx) => { if (partners.length > 1) setPartners(p => p.filter((_, i) => i !== idx)); };
    const update = (idx, field, val) =>
        setPartners(p => p.map((pt, i) => i === idx ? { ...pt, [field]: val } : pt));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                { step: 2, partners },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onNext();
        } catch (err) {
            const msgs = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : err.response?.data?.message || 'Terjadi kesalahan.';
            setError(msgs);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
            )}

            <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-sm p-4">
                <strong className="text-blue-700">Informasi:</strong> Isi data mitra kerjasama PKM. Minimal 1 mitra sasaran wajib diisi. Anda dapat menambahkan beberapa mitra dengan kategori yang berbeda.
            </div>

            {partners.map((pt, idx) => (
                <div key={idx} className="border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-green-50 px-5 py-3 flex items-center justify-between border-b border-gray-200">
                        <span className="font-bold text-green-800 text-sm">Mitra #{idx + 1}</span>
                        {partners.length > 1 && (
                            <button type="button" onClick={() => removePartner(idx)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold">
                                <Trash2 size={13} /> Hapus
                            </button>
                        )}
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Kategori dan Nama */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Jenis Mitra <span className="text-red-500">*</span></label>
                                <select required value={pt.partner_category} onChange={e => update(idx, 'partner_category', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500">
                                    {PARTNER_CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Nama Mitra Sasaran <span className="text-red-500">*</span></label>
                                <input type="text" required value={pt.partner_name}
                                    onChange={e => update(idx, 'partner_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                    placeholder="Contoh: Asman Toga Gandaria" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Kelompok Mitra Sasaran</label>
                                <input type="text" value={pt.partner_description}
                                    onChange={e => update(idx, 'partner_description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Contoh: Kelompok masyarakat yang tidak produktif secara ekonomi" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Pimpinan Mitra</label>
                                <input type="text" value={pt.leader_name}
                                    onChange={e => update(idx, 'leader_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Nama pimpinan/ketua kelompok" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Jenis Kelompok Mitra</label>
                                <input type="text" value={pt.group_type}
                                    onChange={e => update(idx, 'group_type', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Contoh: kelompok ibu-ibu rumah tangga" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Jumlah Anggota Kelompok</label>
                                <input type="number" min="0" value={pt.member_count}
                                    onChange={e => update(idx, 'member_count', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Contoh: 10" />
                            </div>
                        </div>

                        {/* Permasalahan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Lingkup Permasalahan ke-1 <span className="text-red-500">*</span></label>
                                <textarea required rows={3} value={pt.problem_scope_1}
                                    onChange={e => update(idx, 'problem_scope_1', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                    placeholder="Contoh: Aspek Produksi" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-tight">Lingkup Permasalahan ke-2</label>
                                <textarea rows={3} value={pt.problem_scope_2}
                                    onChange={e => update(idx, 'problem_scope_2', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Contoh: Aspek Sosial Kemasyarakatan" />
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-600 mb-3 uppercase tracking-tight">
                                <MapPin size={13} className="text-green-600" /> Lokasi Mitra
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['province','city','district','village'].map(field => (
                                    <div key={field}>
                                        <label className="text-xs text-gray-500 mb-1 block capitalize">{
                                            { province: 'Provinsi', city: 'Kabupaten/Kota', district: 'Kecamatan', village: 'Desa/Kelurahan' }[field]
                                        }</label>
                                        <input type="text" value={pt[field]}
                                            onChange={e => update(idx, field, e.target.value)}
                                            className="w-full border border-gray-300 rounded-sm p-2 text-sm"
                                            placeholder={{ province: 'JAWA TIMUR', city: 'Kab. Pamekasan', district: 'PAMEKASAN', village: 'GLADAK ANYAR' }[field]} />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3">
                                <label className="text-xs text-gray-500 mb-1 block">Alamat Lengkap Mitra Sasaran</label>
                                <input type="text" value={pt.address}
                                    onChange={e => update(idx, 'address', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm"
                                    placeholder="Contoh: Jl. Amin Jakfar Gang 1/52 Pamekasan" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" onClick={addPartner}
                className="w-full border-2 border-dashed border-green-300 rounded-sm py-3 text-green-700 font-semibold text-sm hover:bg-green-50 flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Tambah Mitra
            </button>

            <div className="flex justify-between pt-2">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 text-sm font-semibold">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-green-700 text-white rounded-sm font-bold shadow hover:bg-green-800 transition-all disabled:opacity-50 text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
