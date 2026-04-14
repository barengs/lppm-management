import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Trash2, CheckCircle, Clock, PlusCircle } from 'lucide-react';

export default function StepPersonnel({ proposalId, token, onNext, onBack, initialData }) {
    const [members, setMembers] = useState([]);
    const [students, setStudents] = useState([
        { student_nim: '', student_name: '', task_description: '' },
        { student_nim: '', student_name: '', task_description: '' }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        axios.get('/api/master/selections/personnel_role', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setRoles(res.data));

        if (initialData?.personnel) {
            // 1. Process System Members (Dosen/Tendik) - excluding Chairman
            const existingMembers = initialData.personnel
                .filter(m => m.role !== 'ketua' && m.type === 'dosen')
                .map(m => ({
                    user_id: m.user_id,
                    name: m.user?.name,
                    nidn: m.nidn_nik,
                    role: m.role,
                    task_description: m.task_description,
                    is_confirmed: m.is_confirmed
                }));
            setMembers(existingMembers);

            // 2. Process Manual Students
            const existingStudents = initialData.personnel
                .filter(m => m.type === 'mahasiswa')
                .map(m => ({
                    student_nim: m.student_nim,
                    student_name: m.student_name,
                    task_description: m.task_description,
                }));
            
            if (existingStudents.length > 0) {
                setStudents(existingStudents);
            }
        }
    }, [initialData]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await axios.get(`/api/users/search?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(res.data);
            setIsSearching(false);
        } catch (err) {
            console.error(err);
            setIsSearching(false);
        }
    };

    const addMember = (user) => {
        if (members.find(m => m.user_id === user.id) || user.id === initialData?.user_id) {
            alert("Orang ini sudah ada dalam tim.");
            return;
        }

        setMembers([...members, {
            user_id: user.id,
            name: user.name,
            nidn: user.dosen_profile?.nidn,
            role: 'anggota',
            task_description: '',
            is_confirmed: false
        }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeMember = (userId) => {
        setMembers(members.filter(m => m.user_id !== userId));
    };

    const updateMember = (userId, field, value) => {
        setMembers(members.map(m => 
            m.user_id === userId ? { ...m, [field]: value } : m
        ));
    };

    // --- Student Management ---
    const addStudent = () => {
        setStudents([...students, { student_nim: '', student_name: '', task_description: '' }]);
    };

    const removeStudent = (index) => {
        if (students.length <= 2) {
            alert("Minimal harus melibatkan 2 mahasiswa.");
            return;
        }
        setStudents(students.filter((_, i) => i !== index));
    };

    const updateStudent = (index, field, value) => {
        const newStudents = [...students];
        newStudents[index][field] = value;
        setStudents(newStudents);
    };

    const handleSave = async () => {
        // Validation
        if (members.some(m => !m.task_description)) {
            setError("Harap isi deskripsi tugas untuk semua anggota dosen.");
            return;
        }

        if (students.length < 2) {
            setError("Wajib melibatkan minimal 2 mahasiswa.");
            return;
        }

        if (students.some(s => !s.student_nim || !s.student_name || !s.task_description)) {
            setError("Harap lengkapi semua data mahasiswa (NIM, Nama, Deskripsi Tugas).");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await axios.post(`/api/proposals/${proposalId}/steps`, {
                step: 2,
                members: members,
                students: students
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaving(false);
            onNext();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan personil.");
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                    <strong>Penting:</strong> Anggota Dosen yang ditambahkan harus login dan menyetujui pelibatan mereka sebelum proposal dapat di-submit. Mahasiswa diinput secara manual.
                </p>
            </div>

            {/* Ketua - Read Only */}
            <div className="p-4 border border-green-200 bg-green-50 rounded-sm flex items-center justify-between">
                <div>
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Ketua Pengusul</p>
                    <p className="text-sm font-bold text-gray-900">{initialData?.user?.name}</p>
                    <p className="text-xs text-gray-500">NIDN: {initialData?.user?.dosen_profile?.nidn || '-'}</p>
                </div>
                <div className="flex items-center text-green-600 text-xs font-bold">
                    <CheckCircle size={16} className="mr-1" /> Terkonfirmasi
                </div>
            </div>

            {/* Search Personnel (Lecturers) */}
            <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cari Anggota (Dosen / Tim Pakar)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ketik nama atau NIDN dosen..."
                        className="w-full border border-gray-300 rounded-sm p-2.5 pl-10 focus:ring-green-500"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {isSearching && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 p-2 text-xs text-gray-500 shadow-lg">Mencari...</div>}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-xl max-h-64 overflow-y-auto">
                        {searchResults.map(user => (
                            <div 
                                key={user.id}
                                onClick={() => addMember(user)}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.dosen_profile?.nidn || 'NIDN -'} • {user.email}</p>
                                </div>
                                <UserPlus size={18} className="text-green-600" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Members List (Dosen) */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b pb-2">Daftar Anggota Dosen</h3>
                {members.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 border border-dashed rounded-sm">
                        Belum ada anggota dosen tambahan.
                    </p>
                )}
                {members.map(member => (
                    <div key={member.user_id} className="p-4 border border-gray-200 rounded-sm space-y-4 hover:border-green-300 transition-colors bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-gray-900 truncate">{member.name}</span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-sm border border-green-200">
                                        Dosen
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">NIDN: {member.nidn || '-'}</p>
                            </div>
                            <button 
                                onClick={() => removeMember(member.user_id)}
                                className="text-red-400 hover:text-red-600 p-1"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Peran dlm Tim</label>
                                <select 
                                    className="w-full text-sm border border-gray-200 p-1.5 bg-gray-50 rounded-sm font-medium"
                                    value={member.role}
                                    onChange={e => updateMember(member.user_id, 'role', e.target.value)}
                                >
                                    {roles.map(r => (
                                        <option key={r.key} value={r.key}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status Persetujuan</label>
                                <div className={`flex items-center text-xs font-bold leading-none p-2 rounded-sm border ${member.is_confirmed ? 'text-green-600 bg-green-50 border-green-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                                    {member.is_confirmed ? (
                                        <><CheckCircle size={14} className="mr-1" /> Sudah Menyetujui</>
                                    ) : (
                                        <><Clock size={14} className="mr-1" /> Menunggu Konfirmasi</>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deskripsi Tugas</label>
                            <textarea 
                                required
                                placeholder="Jelaskan peran spesifik dalam penelitian ini..."
                                className="w-full text-sm border border-gray-200 p-2 focus:ring-green-500 rounded-sm"
                                rows={2}
                                value={member.task_description}
                                onChange={e => updateMember(member.user_id, 'task_description', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Students List (Manual) */}
            <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Anggota Mahasiswa (Min. 2)</h3>
                    <button 
                        onClick={addStudent}
                        className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center"
                    >
                        <PlusCircle size={14} className="mr-1" /> Tambah Mahasiswa
                    </button>
                </div>
                
                <div className="bg-gray-50 rounded-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-[10px] font-black uppercase text-gray-600 tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-b border-gray-200 w-32">NIM</th>
                                <th className="px-4 py-3 border-b border-gray-200">Nama Lengkap</th>
                                <th className="px-4 py-3 border-b border-gray-200">Tugas / Peran</th>
                                <th className="px-4 py-3 border-b border-gray-200 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students.map((student, index) => (
                                <tr key={index} className="hover:bg-green-50/30 transition-colors">
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border border-gray-300 rounded-sm p-1.5 focus:ring-green-500 focus:border-green-500"
                                            placeholder="NIM..."
                                            value={student.student_nim}
                                            onChange={e => updateStudent(index, 'student_nim', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border border-gray-300 rounded-sm p-1.5 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Nama Mahasiswa..."
                                            value={student.student_name}
                                            onChange={e => updateStudent(index, 'student_name', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border border-gray-300 rounded-sm p-1.5 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Role/Tugas..."
                                            value={student.task_description}
                                            onChange={e => updateStudent(index, 'task_description', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button 
                                            onClick={() => removeStudent(index)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                            title="Hapus Mahasiswa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-sm font-medium border border-red-200">{error}</div>}

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
                    className="px-8 py-2 bg-green-700 text-white rounded-sm text-sm font-bold shadow-md hover:bg-green-800 disabled:opacity-50 transition-all flex items-center"
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menyimpan...
                        </>
                    ) : 'Simpan & Lanjut'}
                </button>
            </div>
        </div>
    );
}
