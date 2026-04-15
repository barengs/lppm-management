import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, AlertCircle, Users } from 'lucide-react';
import axios from 'axios';

const emptyMember  = { user_id: '', role: 'anggota', institution: '', study_program: '', sinta_id: '', science_cluster: '', task_description: '' };
const emptyStudent = { student_nim: '', student_name: '', student_prodi: '', student_university: '', task_description: '' };

export default function StepPkmPersonnel({ proposalId, token, onNext, onBack, initialData }) {
    const [members,  setMembers]  = useState([]);
    const [students, setStudents] = useState([emptyStudent, emptyStudent]);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        if (initialData?.personnel) {
            const dosen = initialData.personnel.filter(p => p.type === 'dosen' && p.role !== 'ketua');
            const mhsw  = initialData.personnel.filter(p => p.type === 'mahasiswa');

            setMembers(dosen.map(p => ({
                user_id:          p.user_id || '',
                role:             p.role || 'anggota',
                institution:      p.institution || '',
                study_program:    p.study_program || '',
                sinta_id:         p.sinta_id || '',
                science_cluster:  p.science_cluster || '',
                task_description: p.task_description || '',
                _display:         p.user ? `${p.user.name} (${p.user.email})` : '',
            })));

            if (mhsw.length > 0) {
                setStudents(mhsw.map(p => ({
                    student_nim:         p.student_nim || '',
                    student_name:        p.student_name || '',
                    student_prodi:       p.student_prodi || '',
                    student_university:  p.student_university || '',
                    task_description:    p.task_description || '',
                })));
            }
        }
    }, [initialData]);

    const searchUsers = async (q) => {
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const res = await axios.get(`/api/users/search?q=${q}&role=dosen`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(res.data);
        } catch { setSearchResults([]); }
    };

    const addMember = (user) => {
        if (members.find(m => m.user_id === user.id)) return;
        setMembers(prev => [...prev, {
            ...emptyMember,
            user_id: user.id,
            _display: `${user.name} (${user.email})`,
        }]);
        setUserSearch('');
        setSearchResults([]);
    };

    const removeMember = (idx) => setMembers(prev => prev.filter((_, i) => i !== idx));

    const updateMemberField = (idx, field, val) =>
        setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));

    const addStudent = () => setStudents(prev => [...prev, { ...emptyStudent }]);
    const removeStudent = (idx) => {
        if (students.length <= 2) return;
        setStudents(prev => prev.filter((_, i) => i !== idx));
    };
    const updateStudentField = (idx, field, val) =>
        setStudents(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));

    const handleSave = async (e) => {
        e.preventDefault();
        if (students.length < 2) {
            setError('Wajib melibatkan minimal 2 mahasiswa.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `/api/pkm-proposals/${proposalId}/save-step`,
                {
                    step: 1,
                    members:  members.map(({ _display, ...m }) => m),
                    students,
                },
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
        <form onSubmit={handleSave} className="space-y-8">
            {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Dosen Anggota */}
            <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Users size={16} className="text-green-600" /> Anggota Dosen
                </h4>

                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={userSearch}
                        onChange={e => { setUserSearch(e.target.value); searchUsers(e.target.value); }}
                        placeholder="Cari dosen berdasarkan nama atau email..."
                        className="w-full border border-gray-300 rounded-sm p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                            {searchResults.map(u => (
                                <button key={u.id} type="button" onClick={() => addMember(u)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm border-b border-gray-100 last:border-0 font-medium">
                                    <div className="font-bold text-green-800">{u.name}</div>
                                    <div className="text-gray-500 text-xs">{u.email}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {members.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Belum ada anggota dosen ditambahkan. (Opsional)</p>
                )}

                <div className="space-y-3">
                    {members.map((m, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-sm bg-gray-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-green-800 uppercase tracking-wide">{m._display || `Dosen #${idx + 1}`}</span>
                                <button type="button" onClick={() => removeMember(idx)}
                                    className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Perguruan Tinggi/Institusi</label>
                                    <input type="text" value={m.institution}
                                        onChange={e => updateMemberField(idx, 'institution', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: Universitas Islam Madura" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Program Studi/Bagian</label>
                                    <input type="text" value={m.study_program}
                                        onChange={e => updateMemberField(idx, 'study_program', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: Agroteknologi" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">ID SINTA</label>
                                    <input type="text" value={m.sinta_id}
                                        onChange={e => updateMemberField(idx, 'sinta_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: 5972907" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Rumpun Ilmu</label>
                                    <input type="text" value={m.science_cluster}
                                        onChange={e => updateMemberField(idx, 'science_cluster', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: TEKNOLOGI DALAM ILMU TANAMAN" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Bidang Tugas / Uraian Peran <span className="text-red-500">*</span></label>
                                <textarea required rows={3} value={m.task_description}
                                    onChange={e => updateMemberField(idx, 'task_description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                    placeholder="Uraikan secara lengkap peran dan tugas dosen ini dalam kegiatan PKM..." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mahasiswa */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                        <Users size={16} className="text-green-600" />
                        Mahasiswa <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-sm font-bold">MIN. 2 ORANG</span>
                    </h4>
                    <button type="button" onClick={addStudent}
                        className="flex items-center gap-1 text-[11px] text-green-700 font-bold uppercase hover:underline">
                        <UserPlus size={14} /> Tambah Mahasiswa
                    </button>
                </div>
                <div className="space-y-3">
                    {students.map((s, idx) => (
                        <div key={idx} className="p-4 border border-green-200 rounded-sm bg-green-50/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-green-800 uppercase tracking-wide">Mahasiswa #{idx + 1}</span>
                                {students.length > 2 && (
                                    <button type="button" onClick={() => removeStudent(idx)}
                                        className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">NIM <span className="text-red-500">*</span></label>
                                    <input type="text" required value={s.student_nim}
                                        onChange={e => updateStudentField(idx, 'student_nim', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="NIM Mahasiswa" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" required value={s.student_name}
                                        onChange={e => updateStudentField(idx, 'student_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="Nama Lengkap Mahasiswa" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Program Studi</label>
                                    <input type="text" value={s.student_prodi}
                                        onChange={e => updateStudentField(idx, 'student_prodi', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: Teknik Informatika" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Perguruan Tinggi</label>
                                    <input type="text" value={s.student_university}
                                        onChange={e => updateStudentField(idx, 'student_university', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="Nama PT" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">Uraian Tugas <span className="text-red-500">*</span></label>
                                <input type="text" required value={s.task_description}
                                    onChange={e => updateStudentField(idx, 'task_description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                    placeholder="Tugas mahasiswa ini dalam PKM..." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-2">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 text-sm font-bold">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-green-700 text-white rounded-sm font-bold shadow-md hover:bg-green-800 transition-all disabled:opacity-50 text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
