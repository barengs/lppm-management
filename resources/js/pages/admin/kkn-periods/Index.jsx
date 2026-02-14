import React, { useState } from 'react';
import { 
    useGetKknPeriodsQuery, 
    useCreateKknPeriodMutation, 
    useUpdateKknPeriodMutation, 
    useDeleteKknPeriodMutation,
    useCreateRegistrationPeriodMutation,
    useUpdateRegistrationPeriodMutation,
    useDeleteRegistrationPeriodMutation
} from '../../../store/api/kknApi';
import DataTable from '../../../components/DataTable';
import { Plus, Edit, Trash2, Calendar, Layers, CheckCircle, XCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function KknPeriodsIndex() {
    const { data: periodsData, isLoading } = useGetKknPeriodsQuery();
    const periods = periodsData?.data || [];
    
    const [createPeriod] = useCreateKknPeriodMutation();
    const [updatePeriod] = useUpdateKknPeriodMutation();
    const [deletePeriod] = useDeleteKknPeriodMutation();

    // Period Modal State
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);
    const [periodFormData, setPeriodFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
        description: '',
        is_active: false
    });

    // Wave Modal State
    const [isWaveManagerOpen, setIsWaveManagerOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // Handlers for Period
    const handleCreatePeriod = () => {
        setEditingPeriod(null);
        setPeriodFormData({
            name: '',
            year: new Date().getFullYear(),
            start_date: '',
            end_date: '',
            description: '',
            is_active: false
        });
        setIsPeriodModalOpen(true);
    };

    const handleEditPeriod = (period) => {
        setEditingPeriod(period);
        setPeriodFormData({
            name: period.name,
            year: period.year,
            start_date: period.start_date ? period.start_date.split('T')[0] : '',
            end_date: period.end_date ? period.end_date.split('T')[0] : '',
            description: period.description || '',
            is_active: period.is_active
        });
        setIsPeriodModalOpen(true);
    };

    const handleDeletePeriod = async (id) => {
        if (window.confirm('Are you sure you want to delete this KKN Period?')) {
            try {
                await deletePeriod(id).unwrap();
                toast.success('Period deleted successfully');
            } catch (error) {
                toast.error(error.data?.message || 'Failed to delete period');
            }
        }
    };

    const handleSavePeriod = async (e) => {
        e.preventDefault();
        try {
            if (editingPeriod) {
                await updatePeriod({ id: editingPeriod.id, ...periodFormData }).unwrap();
                toast.success('Period updated successfully');
            } else {
                await createPeriod(periodFormData).unwrap();
                toast.success('Period created successfully');
            }
            setIsPeriodModalOpen(false);
        } catch (error) {
            toast.error(error.data?.message || 'Failed to save period');
        }
    };

    const handleOpenWaveManager = (period) => {
        setSelectedPeriod(period);
        setIsWaveManagerOpen(true);
    };

    const columns = [
        {
            header: 'Tahun',
            accessorKey: 'year',
            cell: info => <span className="font-bold text-gray-900">{info.getValue()}</span>
        },
        {
            header: 'Nama Periode',
            accessorKey: 'name',
            cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
        },
        {
            header: 'Pelaksanaan',
            accessorFn: row => {
                if (!row.start_date || !row.end_date) return '-';
                const start = new Date(row.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                const end = new Date(row.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                return `${start} - ${end}`;
            },
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: info => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${info.getValue() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {info.getValue() ? 'Aktif' : 'Tidak Aktif'}
                </span>
            )
        },
        {
            header: 'Gelombang',
            id: 'waves',
            cell: ({ row }) => (
                <button 
                    onClick={() => handleOpenWaveManager(row.original)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                >
                    <Layers size={14} />
                    Manage Waves ({row.original.registration_periods_count || 0})
                </button>
            )
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" onClick={() => handleEditPeriod(row.original)}>
                        <Edit size={16} />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDeletePeriod(row.original.id)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return <div className="p-8 text-center">Loading periods...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Periode KKN</h1>
                    <p className="text-gray-600">Manajemen Periode KKN dan Gelombang Pendaftaran</p>
                </div>
                <button 
                    onClick={handleCreatePeriod} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Tambah Periode
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <DataTable 
                    data={periods} 
                    columns={columns} 
                    isLoading={isLoading}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                    }}
                />
            </div>

            {/* Period Modal */}
            {isPeriodModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">{editingPeriod ? 'Edit Periode KKN' : 'Tambah Periode KKN'}</h3>
                            <button onClick={() => setIsPeriodModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePeriod} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Periode</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                    value={periodFormData.name}
                                    onChange={e => setPeriodFormData({...periodFormData, name: e.target.value})}
                                    placeholder="Contoh: KKN Reguler 2026"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                                <input 
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                    value={periodFormData.year}
                                    onChange={e => setPeriodFormData({...periodFormData, year: parseInt(e.target.value)})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                                    <input 
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                        value={periodFormData.start_date}
                                        onChange={e => setPeriodFormData({...periodFormData, start_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                                    <input 
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                        value={periodFormData.end_date}
                                        onChange={e => setPeriodFormData({...periodFormData, end_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                    rows="3"
                                    value={periodFormData.description}
                                    onChange={e => setPeriodFormData({...periodFormData, description: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="is_active"
                                    checked={periodFormData.is_active}
                                    onChange={e => setPeriodFormData({...periodFormData, is_active: e.target.checked})}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">Set sebagai Periode Aktif</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                <button type="button" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setIsPeriodModalOpen(false)}>Batal</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Wave Manager Modal */}
            {selectedPeriod && isWaveManagerOpen && (
                <WaveManager 
                    onClose={() => setIsWaveManagerOpen(false)} 
                    period={selectedPeriod} 
                />
            )}
        </div>
    );
}

function WaveManager({ onClose, period }) {
    const [createWave] = useCreateRegistrationPeriodMutation();
    const [updateWave] = useUpdateRegistrationPeriodMutation();
    const [deleteWave] = useDeleteRegistrationPeriodMutation();
    // Re-fetch parent period to get updated waves list automatically via tags
    const { data: periodDetail } = useGetKknPeriodsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            data: data?.data?.find(p => p.id === period.id)
        })
    });

    const [editingWave, setEditingWave] = useState(null);
    const [waveFormData, setWaveFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true
    });
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Fallback to prop period if detail request not ready (though it should be cached)
    const activeWaves = periodDetail?.registration_periods || period.registration_periods || [];

    const handleEditWave = (wave) => {
        setEditingWave(wave);
        setWaveFormData({
            name: wave.name,
            start_date: wave.start_date,
            end_date: wave.end_date,
            is_active: wave.is_active
        });
        setIsFormOpen(true);
    };

    const handleCreateWave = () => {
        setEditingWave(null);
        setWaveFormData({
            name: '',
            start_date: period.start_date, // Default to period start
            end_date: period.end_date,     // Default to period end
            is_active: true
        });
        setIsFormOpen(true);
    };

    const handleDeleteWave = async (id) => {
        if (window.confirm('Delete this registration wave?')) {
            try {
                await deleteWave(id).unwrap();
                toast.success('Wave deleted');
            } catch (error) {
                toast.error('Failed to delete wave');
            }
        }
    };

    const handleSaveWave = async (e) => {
        e.preventDefault();
        try {
            if (editingWave) {
                await updateWave({ 
                    id: editingWave.id, 
                    kkn_period_id: period.id, // For invalidation tag context if needed
                    ...waveFormData 
                }).unwrap();
                toast.success('Wave updated');
            } else {
                await createWave({ 
                    kkn_period_id: period.id, 
                    ...waveFormData 
                }).unwrap();
                toast.success('Wave created');
            }
            setIsFormOpen(false);
        } catch (error) {
            toast.error(error.data?.message || 'Failed to save wave');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                    <h3 className="text-lg font-bold text-gray-900">Gelombang Pendaftaran: {period.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-4 space-y-6">
                    {!isFormOpen ? (
                        <>
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleCreateWave}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    <Plus size={16} /> Tambah Gelombang
                                </button>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                        <tr>
                                            <th className="p-3">Nama Gelombang</th>
                                            <th className="p-3">Waktu Pendaftaran</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {activeWaves.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-500">Belum ada gelombang pendaftaran.</td>
                                            </tr>
                                        ) : (
                                            activeWaves.map(wave => (
                                                <tr key={wave.id}>
                                                    <td className="p-3 font-medium text-gray-900">{wave.name}</td>
                                                    <td className="p-3 text-gray-600">
                                                        {new Date(wave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(wave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${wave.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {wave.is_active ? 'Aktif' : 'Non-Aktif'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleEditWave(wave)} className="text-blue-600 hover:text-blue-800">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteWave(wave.id)} className="text-red-600 hover:text-red-800">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveWave} className="bg-gray-50 p-4 rounded-lg border space-y-4">
                            <h4 className="font-medium text-gray-800 border-b pb-2">{editingWave ? 'Edit Gelombang' : 'Tambah Gelombang Baru'}</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Gelombang</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    value={waveFormData.name}
                                    onChange={e => setWaveFormData({...waveFormData, name: e.target.value})}
                                    placeholder="Contoh: Gelombang 1"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                                    <input 
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        value={waveFormData.start_date}
                                        onChange={e => setWaveFormData({...waveFormData, start_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                                    <input 
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        value={waveFormData.end_date}
                                        onChange={e => setWaveFormData({...waveFormData, end_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="wave_active"
                                    checked={waveFormData.is_active}
                                    onChange={e => setWaveFormData({...waveFormData, is_active: e.target.checked})}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <label htmlFor="wave_active" className="text-sm text-gray-700 font-medium">Status Aktif</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded" onClick={() => setIsFormOpen(false)}>Batal</button>
                                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded">Simpan</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
