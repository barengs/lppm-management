import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, AlertCircle, Users, Briefcase } from 'lucide-react';
import axios from 'axios';

const emptyMember  = { student_name: '', student_nim: '', institution: '', study_program: '', sinta_id: '', science_cluster: '', task_description: '' };
const emptyStudent = { student_nim: '', student_name: '', student_prodi: '', student_university: '', task_description: '' };

export default function StepPkmPersonnel({ proposalId, token, onNext, onBack, initialData }) {
    const [members,  setMembers]  = useState([]);
    const [students, setStudents] = useState([emptyStudent, emptyStudent]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const [ketua, setKetua] = useState(null);

    useEffect(() => {
        if (initialData?.personnel) {
            const head  = initialData.personnel.find(p => p.role === 'ketua');
            const dosen = initialData.personnel.filter(p => p.type === 'dosen' && p.role !== 'ketua');
            const mhsw  = initialData.personnel.filter(p => p.type === 'mahasiswa');

            if (head) setKetua(head);

            setMembers(dosen.map(p => ({
                student_name:     p.student_name || (p.user ? p.user.name : ''),
                student_nim:      p.student_nim || '',
                institution:      p.institution || '',
                study_program:    p.study_program || '',
                sinta_id:         p.sinta_id || '',
                science_cluster:  p.science_cluster || '',
                task_description: p.task_description || '',
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

    const addMember = () => setMembers(prev => [...prev, { ...emptyMember }]);
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
                    step: 2, // Backend case 2 is personnel
                    members,
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

            {/* Ketua Pengusul (Read-only) */}
            <div className="p-5 border border-green-200 rounded-sm bg-green-50/50">
                <h4 className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Briefcase size={16} /> Ketua Pengusul
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Nama Lengkap</label>
                        <p className="font-bold text-gray-800">{ketua?.user?.name || '-'}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">NIDN / NIDK</label>
                        <p className="font-bold text-gray-800">{ketua?.user?.dosen_profile?.nidn || '-'}</p>
                    </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-400 italic">* Data ketua otomatis diambil dari profil pengusul yang sedang login.</p>
            </div>

            {/* Dosen Anggota */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                        <Users size={16} className="text-green-600" /> Anggota Dosen
                    </h4>
                    <button type="button" onClick={addMember}
                        className="flex items-center gap-1 text-[11px] text-green-700 font-bold uppercase hover:underline">
                        <UserPlus size={14} /> Tambah Anggota Dosen
                    </button>
                </div>

                {members.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-sm text-center">
                        <p className="text-sm text-gray-400 italic">Belum ada anggota dosen ditambahkan. (Opsional)</p>
                    </div>
                )}

                <div className="space-y-4">
                    {members.map((m, idx) => (
                        <div key={idx} className="p-5 border border-gray-200 rounded-sm bg-gray-50 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-sm font-bold text-green-800 uppercase tracking-wide">Dosen Anggota #{idx + 1}</span>
                                <button type="button" onClick={() => removeMember(idx)}
                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" required value={m.student_name}
                                        onChange={e => updateMemberField(idx, 'student_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="Nama Lengkap Dosen" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">NIDN <span className="text-red-500">*</span></label>
                                    <input type="text" required value={m.student_nim}
                                        onChange={e => updateMemberField(idx, 'student_nim', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="NIDN Dosen" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Kampus Asal <span className="text-red-500">*</span></label>
                                    <input type="text" required value={m.institution}
                                        onChange={e => updateMemberField(idx, 'institution', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: Universitas Islam Madura" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Uraian Tugas <span className="text-red-500">*</span></label>
                                <textarea required rows={2} value={m.task_description}
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
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                        <Users size={16} className="text-green-600" />
                        Mahasiswa <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-sm font-bold">MIN. 2 ORANG</span>
                    </h4>
                    <button type="button" onClick={addStudent}
                        className="flex items-center gap-1 text-[11px] text-green-700 font-bold uppercase hover:underline">
                        <UserPlus size={14} /> Tambah Mahasiswa
                    </button>
                </div>
                <div className="space-y-4">
                    {students.map((s, idx) => (
                        <div key={idx} className="p-5 border border-green-200 rounded-sm bg-green-50/30 space-y-4">
                            <div className="flex items-center justify-between border-b border-green-100 pb-2">
                                <span className="text-sm font-bold text-green-800 uppercase tracking-wide">Mahasiswa #{idx + 1}</span>
                                {students.length > 2 && (
                                    <button type="button" onClick={() => removeStudent(idx)}
                                        className="text-red-500 hover:text-red-700 p-1 hover:bg-green-100 rounded-full transition-colors"><Trash2 size={16} /></button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">NIM <span className="text-red-500">*</span></label>
                                    <input type="text" required value={s.student_nim}
                                        onChange={e => updateStudentField(idx, 'student_nim', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="NIM Mahasiswa" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" required value={s.student_name}
                                        onChange={e => updateStudentField(idx, 'student_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="Nama Lengkap Mahasiswa" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Program Studi</label>
                                    <input type="text" value={s.student_prodi}
                                        onChange={e => updateStudentField(idx, 'student_prodi', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="Contoh: Teknik Informatika" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Perguruan Tinggi</label>
                                    <input type="text" value={s.student_university}
                                        onChange={e => updateStudentField(idx, 'student_university', e.target.value)}
                                        className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                        placeholder="Nama PT" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Uraian Tugas <span className="text-red-500">*</span></label>
                                <input type="text" required value={s.task_description}
                                    onChange={e => updateStudentField(idx, 'task_description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-sm p-2.5 text-sm focus:ring-2 focus:ring-green-500"
                                    placeholder="Tugas mahasiswa ini dalam PKM..." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
                <button type="button" onClick={onBack}
                    className="px-6 py-2.5 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 text-sm font-bold uppercase tracking-tight transition-all">
                    ← Kembali
                </button>
                <button type="submit" disabled={loading}
                    className="px-10 py-2.5 bg-green-700 text-white rounded-sm font-bold shadow-md hover:bg-green-800 transition-all disabled:opacity-50 text-sm uppercase tracking-tight">
                    {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
            </div>
        </form>
    );
}
