import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, Download, CheckCircle, AlertCircle, RefreshCw, FileText, Sheet, ChevronDown, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
    useGetKknGradesQuery,
    useGetDplKknGradesQuery,
    useGetKknGradeSettingsQuery,
    useSaveDplScoreMutation,
    useSaveArticleScoreMutation,
    useGetPostosQuery,
    useImportKknGradesMutation,
} from '../../store/api/kknApi';
import { useGetFacultiesQuery } from '../../store/api/masterDataApi';

const fmt = (v) => (v !== null && v !== undefined && v !== '') ? Number(v).toFixed(1) : '-';

const GRADE_COLORS = {
    'A'  : 'bg-green-700 text-white',
    'A-' : 'bg-green-600 text-white',
    'B+' : 'bg-blue-600 text-white',
    'B'  : 'bg-blue-500 text-white',
    'B-' : 'bg-blue-400 text-white',
    'C+' : 'bg-yellow-500 text-white',
    'C'  : 'bg-yellow-400 text-black',
    'D'  : 'bg-orange-500 text-white',
    'E'  : 'bg-red-600 text-white',
};

function scoreToGrade(score) {
    if (score === null || score === undefined || score === '') return null;
    const n = Number(score);
    if (n >= 85) return 'A';
    if (n >= 80) return 'A-';
    if (n >= 75) return 'B+';
    if (n >= 70) return 'B';
    if (n >= 65) return 'B-';
    if (n >= 60) return 'C+';
    if (n >= 55) return 'C';
    if (n >= 40) return 'D';
    return 'E';
}

// Compact number input — no label, just the field + progress bar
function ScoreInput({ value, max, onChange, disabled }) {
    const num = Number(value) || 0;
    const pct = max > 0 ? Math.min((num / max) * 100, 100) : 0;
    const isOver = num > max && value !== '';

    return (
        <div className="flex flex-col items-center gap-0.5">
            <input
                type="number" min="0" max={max} step="0.5"
                value={value ?? ''}
                onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={disabled}
                className={`w-16 text-center border rounded-sm py-1 text-xs font-bold focus:ring-1 focus:outline-none
                    ${isOver ? 'border-red-400 text-red-600 bg-red-50 focus:ring-red-400'
                             : 'border-gray-200 focus:ring-green-400'}
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
            />
            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export default function KknAssessment() {
    const { token, user, hasAnyRole } = useAuth();

    const isAdmin  = hasAnyRole(['admin', 'ketua_lppm', 'staff', 'staff_kkn']);
    // DPL = dosen who is NOT admin/staff
    const isDpl    = !isAdmin && hasAnyRole(['dpl', 'dosen', 'dpl_kkn']);
    // LPPM can input article scores (admin/staff)
    const canArticle = isAdmin;
    // DPL or admin can input field scores
    const canField   = isDpl || isAdmin;

    // Excel Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const [importSuccessMessage, setImportSuccessMessage] = useState('');

    // Filters
    const [filterPosto, setFilterPosto] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('');
    const [search, setSearch] = useState('');

    // Inline edits: { [regId]: { w1_score, w2_score, w3_score, w4_score, secondary_score, article_score } }
    const [edits, setEdits] = useState({});
    const [rowSaving, setRowSaving] = useState({});
    const [isSavingAll, setIsSavingAll] = useState(false);

    // RTK Query parameters
    const queryParams = useMemo(() => {
        const params = {};
        if (filterPosto) params.kkn_posto_id = filterPosto;
        if (filterFaculty) params.faculty_id = filterFaculty;
        return params;
    }, [filterPosto, filterFaculty]);

    // RTK Query fetches
    const {
        data: dplGradesData,
        isFetching: isDplLoading,
        refetch: refetchDpl
    } = useGetDplKknGradesQuery(queryParams, { skip: !isDpl });

    const {
        data: adminGradesData,
        isFetching: isAdminLoading,
        refetch: refetchAdmin
    } = useGetKknGradesQuery(queryParams, { skip: isDpl });

    const {
        data: allPostosData,
    } = useGetPostosQuery({}, { skip: !isAdmin });

    const {
        data: gradeSettings,
    } = useGetKknGradeSettingsQuery();

    const {
        data: facultiesData,
    } = useGetFacultiesQuery(undefined, { skip: !isAdmin });

    // Mutations
    const [saveDplScore] = useSaveDplScoreMutation();
    const [saveArticleScore] = useSaveArticleScoreMutation();
    const [importKknGrades, { isLoading: isImporting }] = useImportKknGradesMutation();

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setImportErrors([]);
        setImportSuccessMessage('');
    };

    const handleImportExcel = async (e) => {
        e.preventDefault();
        if (!importFile) {
            toast.error('Silakan pilih file Excel terlebih dahulu.');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        setImportErrors([]);
        setImportSuccessMessage('');

        try {
            const res = await importKknGrades(formData).unwrap();
            setImportSuccessMessage(res.message);
            setImportErrors(res.errors || []);
            
            if (res.errors && res.errors.length > 0) {
                toast.warning('Impor selesai dengan beberapa catatan kesalahan.');
            } else {
                toast.success('Semua nilai berhasil diimpor!');
                handleCloseImportModal();
            }
            refetchData();
        } catch (err) {
            const errMsg = err.data?.message || err.message || 'Gagal mengimpor file.';
            setImportErrors(err.data?.errors || [errMsg]);
            toast.error(errMsg);
        }
    };

    const gradesData = isDpl ? dplGradesData : adminGradesData;
    const isLoading = isDpl ? isDplLoading : isAdminLoading;
    const refetchData = isDpl ? refetchDpl : refetchAdmin;

    const registrations = useMemo(() => {
        return gradesData?.data?.data || gradesData?.data || [];
    }, [gradesData]);

    const postos = useMemo(() => {
        if (isDpl) {
            return gradesData?.postos || [];
        }
        return allPostosData || [];
    }, [isDpl, gradesData, allPostosData]);

    const settings = gradeSettings || null;
    const faculties = facultiesData || [];

    // ── Score helpers ──────────────────────────────────────────────────────

    const getVal = (reg, field) => {
        const edit = edits[reg.id];
        if (edit && field in edit) return edit[field];
        return reg.kkn_grade?.[field] ?? '';
    };

    const setVal = (regId, field, val) =>
        setEdits(p => ({ ...p, [regId]: { ...(p[regId] || {}), [field]: val } }));

    const calcPreview = (reg) => {
        const w1  = Number(getVal(reg, 'w1_score'))       || 0;
        const w2  = Number(getVal(reg, 'w2_score'))       || 0;
        const w3  = Number(getVal(reg, 'w3_score'))       || 0;
        const w4  = Number(getVal(reg, 'w4_score'))       || 0;
        const sec = Number(getVal(reg, 'secondary_score'))|| 0;
        const art = Number(getVal(reg, 'article_score'))  || 0;
        const total = w1 + w2 + w3 + w4 + sec;
        const hasField   = getVal(reg, 'w1_score') !== '' && getVal(reg, 'secondary_score') !== '';
        const hasArticle = getVal(reg, 'article_score') !== '';
        const final = (hasField && hasArticle) ? (total + art) / 2 : null;
        return { total, final };
    };

    const hasRowChanges = (regId) => {
        const e = edits[regId];
        return e && Object.keys(e).length > 0;
    };

    // ── Save single row ────────────────────────────────────────────────────

    const saveRow = async (reg) => {
        const e = edits[reg.id] || {};
        setRowSaving(p => ({ ...p, [reg.id]: true }));
        try {
            const fieldKeys = ['w1_score','w2_score','w3_score','w4_score','secondary_score'];
            const hasFieldEdits = fieldKeys.some(k => k in e);
            const hasArticleEdit = 'article_score' in e;

            if (hasFieldEdits && canField) {
                await saveDplScore({
                    kkn_registration_id: reg.id,
                    ...Object.fromEntries(fieldKeys.map(k => [k, k in e ? e[k] : getVal(reg, k)]))
                }).unwrap();
            }

            if (hasArticleEdit && canArticle) {
                await saveArticleScore({
                    kkn_registration_id: reg.id,
                    article_score: e.article_score,
                }).unwrap();
            }

            toast.success(`Nilai ${reg.student?.name} berhasil disimpan.`);
            setEdits(p => { const n = {...p}; delete n[reg.id]; return n; });
        } catch (err) {
            toast.error(err.data?.message || err.message || 'Gagal menyimpan nilai.');
        } finally {
            setRowSaving(p => ({ ...p, [reg.id]: false }));
        }
    };

    // ── Save ALL changed rows ──────────────────────────────────────────────

    const saveAll = async () => {
        const changedIds = Object.keys(edits).filter(id => Object.keys(edits[id]).length > 0);
        if (changedIds.length === 0) { toast.info('Tidak ada perubahan untuk disimpan.'); return; }

        setIsSavingAll(true);
        let successCount = 0;
        let failCount = 0;

        for (const regId of changedIds) {
            const reg = registrations.find(r => String(r.id) === String(regId));
            if (!reg) continue;
            try {
                await saveRow(reg);
                successCount++;
            } catch {
                failCount++;
            }
        }

        setIsSavingAll(false);
        if (successCount > 0) toast.success(`${successCount} data nilai berhasil disimpan.`);
        if (failCount > 0)    toast.error(`${failCount} data gagal disimpan.`);
    };

    // ── Filtered list ──────────────────────────────────────────────────────

    const filtered = useMemo(() => {
        if (!search) return registrations;
        const q = search.toLowerCase();
        return registrations.filter(r =>
            r.student?.name?.toLowerCase().includes(q) ||
            r.student?.mahasiswaProfile?.npm?.toLowerCase().includes(q)
        );
    }, [registrations, search]);

    const changedCount = Object.keys(edits).filter(id => Object.keys(edits[id]).length > 0).length;

    const s = settings || { w1_max: 10, w2_max: 10, w3_max: 10, w4_max: 10, secondary_max: 60, article_max: 100 };

    // Build export URL with current filter params
    const buildExportUrl = (base) => {
        const params = new URLSearchParams();
        if (filterPosto)   params.append('kkn_posto_id', filterPosto);
        if (filterFaculty) params.append('faculty_id', filterFaculty);
        const qs = params.toString();
        return `/api${base}${qs ? '?' + qs : ''}`;
    };

    // Authenticated file download (blob) — avoids redirect-to-login on new tab
    const [exportLoading, setExportLoading] = useState(null); // 'pdf' | 'excel' | null
    const downloadFile = async (urlPath, filename) => {
        const key = filename.endsWith('.pdf') ? 'pdf' : 'excel';
        setExportLoading(key);
        try {
            const response = await fetch(buildExportUrl(urlPath), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Gagal mengunduh file.');
            const blob = await response.blob();
            const url  = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Gagal mengunduh file. Silakan coba lagi.');
        } finally {
            setExportLoading(null);
            setExportOpen(false);
        }
    };

    // Export dropdown state
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="space-y-5 pb-16">
            {/* Header */}
            <div className="bg-white shadow p-6 border-l-4 border-green-600 flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Penilaian KKN</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isDpl ? 'Anda masuk sebagai DPL — hanya mahasiswa di posko Anda.' : 'Tampilan Staff LPPM — semua mahasiswa KKN.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {changedCount > 0 && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-sm">
                            {changedCount} baris belum disimpan
                        </span>
                    )}
                    <button
                        onClick={saveAll}
                        disabled={isSavingAll || changedCount === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-green-800 disabled:opacity-40 shadow-md transition-all"
                    >
                        <Save size={15} />
                        {isSavingAll ? 'Menyimpan...' : `Simpan Semua${changedCount > 0 ? ` (${changedCount})` : ''}`}
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-sm text-xs font-black hover:bg-blue-700 transition-all shadow-md"
                    >
                        <Upload size={15} />
                        Impor Excel
                    </button>
                    {/* Export Dropdown */}
                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportOpen(o => !o)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-sm text-xs font-black hover:bg-red-700 transition-all"
                        >
                            <Download size={15} />
                            {exportLoading ? 'Mengunduh...' : 'Export'}
                            <ChevronDown size={13} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {exportOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-sm shadow-xl z-50">
                                <button
                                    onClick={() => downloadFile('/kkn-grades/export', 'Rekap-Nilai-KKN.pdf')}
                                    disabled={!!exportLoading}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors border-b border-gray-100 disabled:opacity-50"
                                >
                                    <FileText size={15} className="text-red-500" />
                                    {exportLoading === 'pdf' ? 'Mengunduh...' : 'Export PDF'}
                                </button>
                                <button
                                    onClick={() => downloadFile('/kkn-grades/export-excel', `Rekap-Nilai-KKN-${new Date().toISOString().slice(0,10)}.xlsx`)}
                                    disabled={!!exportLoading}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
                                >
                                    <Sheet size={15} className="text-green-600" />
                                    {exportLoading === 'excel' ? 'Mengunduh...' : 'Export Excel'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Summary Chips */}
            {settings && (
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'M1', val: s.w1_max, color: 'blue' },
                        { label: 'M2', val: s.w2_max, color: 'blue' },
                        { label: 'M3', val: s.w3_max, color: 'blue' },
                        { label: 'M4', val: s.w4_max, color: 'blue' },
                        { label: 'Sekunder', val: s.secondary_max, color: 'green' },
                        { label: 'Artikel', val: s.article_max, color: 'purple' },
                    ].map(({ label, val, color }) => (
                        <div key={label}
                            className={`px-3 py-1.5 rounded-sm border text-xs font-bold
                            ${color === 'blue'   ? 'bg-blue-50 border-blue-100 text-blue-700'
                            : color === 'green'  ? 'bg-green-50 border-green-100 text-green-700'
                                                 : 'bg-purple-50 border-purple-100 text-purple-700'}`}>
                            {label}: maks <strong>{val}</strong>
                        </div>
                    ))}
                    <div className="px-3 py-1.5 rounded-sm border bg-gray-50 border-gray-200 text-xs font-bold text-gray-500">
                        Formula: (Total Bobot + Artikel) ÷ 2
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Cari Mahasiswa</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Nama / NPM..."
                        className="border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 w-48" />
                </div>
                {!isDpl && postos.length > 0 && (
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Posko</label>
                        <select value={filterPosto} onChange={e => setFilterPosto(e.target.value)}
                            className="border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">Semua Posko</option>
                            {postos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                )}
                {isAdmin && faculties.length > 0 && (
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Fakultas</label>
                        <select value={filterFaculty} onChange={e => setFilterFaculty(e.target.value)}
                            className="border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
                            <option value="">Semua Fakultas</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                )}
                <button onClick={refetchData}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 rounded-sm text-xs hover:bg-gray-50">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse" style={{ minWidth: 1000 }}>
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-10 text-center">#</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mahasiswa</th>
                            {/* Nilai Primer */}
                            <th className="px-2 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">M1<br/><span className="text-gray-400 normal-case font-medium">/{s.w1_max}</span></th>
                            <th className="px-2 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">M2<br/><span className="text-gray-400 normal-case font-medium">/{s.w2_max}</span></th>
                            <th className="px-2 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">M3<br/><span className="text-gray-400 normal-case font-medium">/{s.w3_max}</span></th>
                            <th className="px-2 py-3 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">M4<br/><span className="text-gray-400 normal-case font-medium">/{s.w4_max}</span></th>
                            {/* Sekunder */}
                            <th className="px-2 py-3 text-[10px] font-black text-green-600 uppercase tracking-widest text-center">Sekunder<br/><span className="text-gray-400 normal-case font-medium">/{s.secondary_max}</span></th>
                            {/* Total */}
                            <th className="px-3 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Total<br/>Bobot</th>
                            {/* Artikel */}
                            <th className="px-2 py-3 text-[10px] font-black text-purple-600 uppercase tracking-widest text-center">Artikel<br/><span className="text-gray-400 normal-case font-medium">/{s.article_max}</span></th>
                            {/* Nilai Akhir */}
                            <th className="px-3 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Nilai Akhir<br/>(Huruf)</th>
                            {/* Aksi */}
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr><td colSpan={12} className="px-4 py-12 text-center text-sm text-gray-400">
                                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-green-500" /> Memuat data...
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={12} className="px-4 py-12 text-center text-sm text-gray-400">
                                <AlertCircle size={24} className="mx-auto mb-2 text-gray-300" /> Tidak ada mahasiswa ditemukan.
                            </td></tr>
                        ) : filtered.map((reg, idx) => {
                            const { total, final } = calcPreview(reg);
                            const changed  = hasRowChanges(reg.id);
                            const isSaving = rowSaving[reg.id];
                            const savedGrade = reg.kkn_grade;

                            // Grade to display: live preview if final available, else from DB
                            const displayFinal = final ?? (savedGrade?.final_score ?? null);
                            const displayGrade = displayFinal !== null ? scoreToGrade(displayFinal) : (savedGrade?.grade ?? null);

                            return (
                                <tr key={reg.id}
                                    className={`transition-colors ${changed ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}`}>
                                    <td className="px-4 py-3 text-xs text-gray-400 font-medium text-center">{idx + 1}</td>

                                    {/* Mahasiswa */}
                                    <td className="px-4 py-3">
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight leading-tight">{reg.student?.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{reg.student?.mahasiswaProfile?.npm || reg.student?.mahasiswa_profile?.npm}</p>
                                        <p className="text-[10px] text-gray-400 italic">{reg.kkn_posto?.name || reg.kkn_location?.name}</p>
                                    </td>

                                    {/* Nilai Primer W1-W4 */}
                                    {['w1_score','w2_score','w3_score','w4_score'].map((field, i) => (
                                        <td key={field} className="px-2 py-3 text-center">
                                            <ScoreInput
                                                value={getVal(reg, field)}
                                                max={s[`w${i+1}_max`]}
                                                onChange={v => setVal(reg.id, field, v)}
                                                disabled={!canField}
                                            />
                                        </td>
                                    ))}

                                    {/* Sekunder */}
                                    <td className="px-2 py-3 text-center">
                                        <ScoreInput
                                            value={getVal(reg, 'secondary_score')}
                                            max={s.secondary_max}
                                            onChange={v => setVal(reg.id, 'secondary_score', v)}
                                            disabled={!canField}
                                        />
                                    </td>

                                    {/* Total Bobot */}
                                    <td className="px-3 py-3 text-center">
                                        <span className="text-sm font-black text-gray-800">
                                            {total > 0 ? fmt(total) : (savedGrade?.total_weight ? fmt(savedGrade.total_weight) : '-')}
                                        </span>
                                    </td>

                                    {/* Artikel */}
                                    <td className="px-2 py-3 text-center">
                                        <ScoreInput
                                            value={getVal(reg, 'article_score')}
                                            max={s.article_max}
                                            onChange={v => setVal(reg.id, 'article_score', v)}
                                            disabled={!canArticle}
                                        />
                                    </td>

                                    {/* Nilai Akhir + Huruf */}
                                    <td className="px-3 py-3 text-center">
                                        {displayFinal !== null ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-gray-900">{fmt(displayFinal)}</p>
                                                {displayGrade && (
                                                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-sm ${GRADE_COLORS[displayGrade] || 'bg-gray-100 text-gray-500'}`}>
                                                        {displayGrade}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">Belum lengkap</span>
                                        )}
                                    </td>

                                    {/* Aksi */}
                                    <td className="px-4 py-3 text-center">
                                        {changed ? (
                                            <button
                                                disabled={isSaving}
                                                onClick={() => saveRow(reg)}
                                                className="px-3 py-1.5 bg-green-700 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-800 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1 mx-auto">
                                                <Save size={11} />
                                                {isSaving ? '...' : 'Simpan Nilai'}
                                            </button>
                                        ) : savedGrade?.final_score ? (
                                            <span title="Nilai tersimpan" className="flex items-center justify-center gap-1 text-[10px] text-green-600 font-bold">
                                                <CheckCircle size={14} /> Tersimpan
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Bottom sticky save bar - shown when there are changes */}
            {changedCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-gray-900 text-white rounded-sm shadow-2xl px-6 py-3 flex items-center gap-4">
                        <AlertCircle size={16} className="text-amber-400 shrink-0" />
                        <span className="text-xs font-bold">{changedCount} baris memiliki perubahan yang belum disimpan</span>
                        <button
                            onClick={saveAll}
                            disabled={isSavingAll}
                            className="px-4 py-1.5 bg-green-600 text-white rounded-sm text-xs font-black hover:bg-green-500 disabled:opacity-50 flex items-center gap-1.5 transition-all">
                            <Save size={13} />
                            {isSavingAll ? 'Menyimpan...' : 'Simpan Semua'}
                        </button>
                        <button onClick={() => setEdits({})}
                            className="text-xs text-gray-400 hover:text-white transition-colors">
                            Batalkan
                        </button>
                    </div>
                </div>
            )}

            {/* Impor Excel Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gray-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <Upload size={18} className="text-blue-400 animate-pulse" />
                                    Impor Nilai Mahasiswa KKN (Excel)
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Unggah file Excel yang berisi nilai mahasiswa KKN
                                </p>
                            </div>
                            <button 
                                onClick={handleCloseImportModal}
                                disabled={isImporting}
                                className="p-1.5 hover:bg-white/10 rounded-sm transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleImportExcel} className="p-6 space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-xs text-blue-800 space-y-1">
                                <p className="font-bold uppercase tracking-wider mb-1">Panduan Pengisian Nilai:</p>
                                <ol className="list-decimal list-inside space-y-1 font-medium text-blue-900">
                                    <li>Gunakan menu <strong>Export &gt; Export Excel</strong> untuk mengunduh daftar mahasiswa Anda.</li>
                                    <li>Isi nilai mahasiswa pada kolom <strong>M1 (Mgg 1)</strong>, <strong>M2 (Mgg 2)</strong>, <strong>M3 (Mgg 3)</strong>, <strong>M4 (Mgg 4)</strong>, dan <strong>Nilai Sekunder</strong>.</li>
                                    <li>Pastikan nilai yang diinput tidak melebihi batas maksimum (M1-M4: {s.w1_max}, Sekunder: {s.secondary_max}{isAdmin ? `, Artikel: ${s.article_max}` : ''}).</li>
                                    <li>Simpan file Excel tersebut dan unggah kembali pada form di bawah ini.</li>
                                </ol>
                            </div>

                            {/* File Upload Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                    Pilih File Excel (.xlsx, .xls, .csv)
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 hover:bg-gray-50 hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 relative">
                                    <input 
                                        type="file" 
                                        accept=".xlsx,.xls,.csv" 
                                        disabled={isImporting}
                                        onChange={e => setImportFile(e.target.files[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                    <Sheet size={32} className="text-gray-400" />
                                    {importFile ? (
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-gray-800">{importFile.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{(importFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600">
                                                Tarik dan lepas file di sini, atau <span className="text-blue-600 font-bold hover:underline">klik untuk mencari</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Maksimal ukuran file 5 MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Success / Error Message Display */}
                            {importSuccessMessage && (
                                <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-xs font-medium">
                                    {importSuccessMessage}
                                </div>
                            )}

                            {importErrors.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                        Catatan Kesalahan / Baris Gagal:
                                    </p>
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-red-800 text-xs max-h-48 overflow-y-auto font-mono space-y-1 divide-y divide-red-100 font-semibold">
                                        {importErrors.map((err, i) => (
                                            <div key={i} className="pt-1 first:pt-0 flex items-start gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1"></span>
                                                <span>{err}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer / Actions */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseImportModal}
                                    disabled={isImporting}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-sm text-xs font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isImporting || !importFile}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-md"
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Mengimpor...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={13} />
                                            Mulai Impor
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
