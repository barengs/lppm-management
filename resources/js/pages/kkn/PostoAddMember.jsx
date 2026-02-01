import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, UserPlus, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';

export default function PostoAddMember() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [posto, setPosto] = useState(null);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState({}); // {studentId: position}
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const postoRes = await api.get(`/kkn/postos/${id}`);
            setPosto(postoRes.data);

            const studentsRes = await api.get('/kkn/postos/available-students', {
                params: {
                    fiscal_year_id: postoRes.data.fiscal_year?.id,
                }
            });

            const students = studentsRes.data.map(item => ({
                ...item.student,
                registration_id: item.registration_id
            }));
            
            setAvailableStudents(students);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(error.response?.data?.message || 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStudent = (student) => {
        const newSelected = { ...selectedStudents };
        if (newSelected[student.id]) {
            delete newSelected[student.id];
        } else {
            newSelected[student.id] = 'anggota'; // Default position
        }
        setSelectedStudents(newSelected);
    };

    const handlePositionChange = (studentId, position) => {
        setSelectedStudents({
            ...selectedStudents,
            [studentId]: position
        });
    };

    const handleSubmit = async () => {
        const selectedCount = Object.keys(selectedStudents).length;
        if (selectedCount === 0) {
            toast.error('Pilih minimal 1 mahasiswa');
            return;
        }

        setIsSaving(true);
        try {
            for (const [studentId, position] of Object.entries(selectedStudents)) {
                await api.post(`/kkn/postos/${id}/members`, {
                    student_id: parseInt(studentId),
                    position: position,
                });
            }

            toast.success(`${selectedCount} anggota berhasil ditambahkan`);
            navigate(`/kkn/postos/${id}`);
        } catch (error) {
            console.error('Failed to add members:', error);
            toast.error(error.response?.data?.message || 'Gagal menambah anggota');
        } finally {
            setIsSaving(false);
        }
    };

    const isSelected = (studentId) => selectedStudents.hasOwnProperty(studentId);
    const selectedCount = Object.keys(selectedStudents).length;

    // Define columns for DataTable
    const columns = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center">
                        <CheckSquare className="w-4 h-4 text-gray-400" />
                    </div>
                ),
                cell: ({ row }) => (
                    <button
                        onClick={() => handleToggleStudent(row.original)}
                        className="flex items-center"
                    >
                        {isSelected(row.original.id) ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                ),
            },
            {
                accessorKey: 'mahasiswa_profile.npm',
                header: 'NPM',
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900">
                        {row.original.mahasiswa_profile?.npm || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'name',
                header: 'Nama',
                cell: ({ row }) => (
                    <div className="text-gray-900">{row.original.name}</div>
                ),
            },
            {
                accessorKey: 'mahasiswa_profile.faculty.name',
                header: 'Fakultas',
                cell: ({ row }) => (
                    <div className="text-gray-900">
                        {row.original.mahasiswa_profile?.faculty?.name || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'mahasiswa_profile.study_program.name',
                header: 'Program Studi',
                cell: ({ row }) => (
                    <div className="text-gray-900">
                        {row.original.mahasiswa_profile?.study_program?.name || '-'}
                    </div>
                ),
            },
            {
                id: 'position',
                header: 'Jabatan',
                cell: ({ row }) => (
                    isSelected(row.original.id) ? (
                        <select
                            value={selectedStudents[row.original.id]}
                            onChange={(e) => handlePositionChange(row.original.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="kordes">Koordinator Desa</option>
                            <option value="sekretaris">Sekretaris</option>
                            <option value="bendahara">Bendahara</option>
                            <option value="humas">Humas</option>
                            <option value="publikasi">Publikasi</option>
                            <option value="anggota">Anggota</option>
                        </select>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )
                ),
            },
        ],
        [selectedStudents]
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate(`/kkn/postos/${id}`)}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Detail Posko
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tambah Anggota Posko</h1>
                            <p className="mt-1 text-sm text-gray-600">{posto?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Mahasiswa Terpilih</div>
                            <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
                        </div>
                    </div>
                </div>

                {/* DataTable */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <DataTable
                        data={availableStudents}
                        columns={columns}
                        options={{
                            enableGlobalFilter: true,
                            enableSorting: true,
                            enablePagination: true,
                            initialPageSize: 10,
                            searchPlaceholder: 'Cari berdasarkan NPM, nama, fakultas, atau prodi...',
                            emptyMessage: 'Tidak ada mahasiswa tersedia (semua sudah tergabung di posko)',
                        }}
                    />

                    {/* Footer Actions */}
                    {availableStudents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    {selectedCount} dari {availableStudents.length} mahasiswa dipilih
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate(`/kkn/postos/${id}`)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={selectedCount === 0 || isSaving}
                                        className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Tambah {selectedCount} Anggota
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
