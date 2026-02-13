import React, { useEffect, useState } from 'react';
import { Download, Save, FileText, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';
import { useGetKknGradesQuery, useSaveKknGradeMutation, useExportKknGradesMutation, useGetKknLocationsQuery, useGetPostosQuery } from '../../store/api/kknApi';
import { useGetFacultiesQuery, useGetStudyProgramsQuery } from '../../store/api/masterDataApi';

export default function KknAssessment() {
    // Filters
    const [filterLocation, setFilterLocation] = useState('');
    const [filterPosto, setFilterPosto] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('');
    const [filterProdi, setFilterProdi] = useState('');

    const [grading, setGrading] = useState(null); // ID of registration being graded
    const [scoreInput, setScoreInput] = useState('');

    // Build query params
    const gradesParams = {
        ...(filterLocation && { kkn_location_id: filterLocation }),
        ...(filterPosto && { kkn_posto_id: filterPosto }),
        ...(filterFaculty && { faculty_id: filterFaculty }),
        ...(filterProdi && { prodi_id: filterProdi }),
    };

    // RTK Query hooks
    const { data: gradesData, isLoading } = useGetKknGradesQuery(gradesParams);
    const { data: locations = [] } = useGetKknLocationsQuery();
    const { data: postos = [] } = useGetPostosQuery(
        { kkn_location_id: filterLocation },
        { skip: !filterLocation }
    );
    const { data: faculties = [] } = useGetFacultiesQuery();
    const { data: studyPrograms = [] } = useGetStudyProgramsQuery();

    const [saveGrade] = useSaveKknGradeMutation();
    const [exportGrades] = useExportKknGradesMutation();

    const registrations = gradesData?.data || [];

    // Reset posto filter when location changes
    useEffect(() => {
        if (!filterLocation) {
            setFilterPosto('');
        }
    }, [filterLocation]);

    const handleExport = async () => {
        try {
            await exportGrades(gradesParams).unwrap();
        } catch (error) {
            toast.error("Gagal mengunduh PDF.");
            console.error(error);
        }
    };

    const handleSaveGrade = async (regId) => {
        if (!scoreInput || scoreInput < 0 || scoreInput > 100) {
            toast.warning("Masukkan nilai 0-100");
            return;
        }

        try {
            await saveGrade({
                kkn_registration_id: regId,
                numeric_score: scoreInput
            }).unwrap();
            
            toast.success("Nilai berhasil disimpan.");
            setGrading(null);
        } catch (error) {
            toast.error("Gagal menyimpan nilai.");
        }
    };

    const getGradeLetter = (score) => {
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 40) return 'D';
        return 'E';
    };

    const columns = React.useMemo(() => [
        {
            header: 'Mahasiswa',
            accessorFn: (row) => row.student?.name,
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-gray-900">{row.original.student?.name}</div>
                    <div className="text-sm text-gray-500">{row.original.student?.mahasiswa_profile?.npm}</div>
                </div>
            )
        },
        {
            header: 'Info KKN',
            accessorFn: (row) => row.kkn_location?.name,
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="text-gray-900">{row.original.kkn_location?.name}</div>
                    <div className="text-xs text-gray-500">{row.original.kkn_location?.village}</div>
                </div>
            )
        },
        {
            header: 'Akademik',
            accessorFn: (row) => row.student?.mahasiswa_profile?.study_program?.name,
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="text-gray-900">{row.original.student?.mahasiswa_profile?.study_program?.name || '-'}</div>
                    <div className="text-xs text-gray-500">{row.original.student?.mahasiswa_profile?.faculty?.name || '-'}</div>
                </div>
            )
        },
        {
            header: 'Nilai Angka',
            accessorKey: 'numeric_score',
            cell: ({ row }) => {
                const reg = row.original;
                return grading === reg.id ? (
                    <input 
                        type="number" 
                        className="border w-20 p-1 rounded focus:ring-green-500 focus:border-green-500"
                        value={scoreInput}
                        onChange={e => setScoreInput(e.target.value)}
                        autoFocus
                    />
                ) : (
                    <span className="font-semibold text-gray-900">{reg.kkn_grade?.numeric_score ?? '-'}</span>
                );
            }
        },
        {
            header: 'Nilai Huruf',
            accessorKey: 'grade_letter',
            cell: ({ row }) => {
                const reg = row.original;
                if (grading === reg.id) {
                    return <span className="text-gray-400 font-medium">{scoreInput ? getGradeLetter(scoreInput) : '-'}</span>;
                }
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${reg.kkn_grade ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {reg.kkn_grade?.grade ?? '-'}
                    </span>
                );
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: ({ row }) => {
                const reg = row.original;
                return grading === reg.id ? (
                    <div className="flex gap-2">
                        <button onClick={() => handleSaveGrade(reg.id)} className="p-1 px-2 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Simpan">
                            <Save size={16} />
                        </button>
                        <button onClick={() => setGrading(null)} className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50">
                            Batal
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => {
                            setGrading(reg.id);
                            setScoreInput(reg.kkn_grade?.numeric_score || '');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                    >
                        {reg.kkn_grade ? 'Edit Nilai' : 'Beri Nilai'}
                    </button>
                );
            }
        }
    ], [grading, scoreInput]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-gray-800">Penilaian KKN</h1>
                 <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm font-medium"
                 >
                    <FileText size={18} /> Export PDF
                 </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-gray-800 font-semibold mb-4 text-sm uppercase tracking-wide">Filter Data</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Location Filter */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">LOKASI KKN</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors cursor-pointer"
                                value={filterLocation}
                                onChange={e => setFilterLocation(e.target.value)}
                            >
                                <option value="">Semua Lokasi</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name} - {loc.village}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Posto Filter - Dependent on Location */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">POSKO</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                                value={filterPosto}
                                onChange={e => setFilterPosto(e.target.value)}
                                disabled={!filterLocation}
                            >
                                <option value="">{filterLocation ? 'Semua Posko' : 'Pilih Lokasi Dulu'}</option>
                                {postos.map(posto => (
                                    <option key={posto.id} value={posto.id}>{posto.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Faculty Filter */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">FAKULTAS</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors cursor-pointer"
                                value={filterFaculty}
                                onChange={e => {
                                    setFilterFaculty(e.target.value);
                                    setFilterProdi(''); // Reset prodi when faculty changes
                                }}
                            >
                                <option value="">Semua Fakultas</option>
                                {faculties.map(fail => (
                                    <option key={fail.id} value={fail.id}>{fail.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Prodi Filter */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">PROGRAM STUDI</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors cursor-pointer"
                                value={filterProdi}
                                onChange={e => setFilterProdi(e.target.value)}
                            >
                                <option value="">Semua Prodi</option>
                                {studyPrograms
                                    .filter(p => !filterFaculty || p.faculty_id == filterFaculty)
                                    .map(prodi => (
                                        <option key={prodi.id} value={prodi.id}>{prodi.name}</option>
                                    ))
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DataTable */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <DataTable
                    data={registrations}
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        searchPlaceholder: 'Cari mahasiswa...',
                        emptyMessage: isLoading ? 'Memuat data...' : 'Tidak ada mahasiswa yang siap dinilai (Status ACC).'
                    }}
                />
            </div>
        </div>
    );
}
