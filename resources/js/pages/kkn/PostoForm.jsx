import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetUsersByRoleQuery } from '../../store/api/masterDataApi';
import {
    useGetKknLocationsQuery,
    useGetPostoByIdQuery,
    useCreatePostoMutation,
    useUpdatePostoMutation,
    useGetKknPeriodsQuery,
} from '../../store/api/kknApi';

export default function PostoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        kkn_location_id: '',
        kkn_period_id: '',
        dpl_id: '',
        description: '',
    });

    // RTK Query hooks
    const { data: locationsData } = useGetKknLocationsQuery();
    const { data: periodsData } = useGetKknPeriodsQuery({ active: true, no_pagination: true });
    const { data: dosensData } = useGetUsersByRoleQuery('dosen');

    // Fetch posto data for edit mode
    const { data: postoData, isLoading: isFetching } = useGetPostoByIdQuery(id, {
        skip: !isEdit, // Only fetch if editing
    });

    // Mutations
    const [createPosto, { isLoading: isCreating }] = useCreatePostoMutation();
    const [updatePosto, { isLoading: isUpdating }] = useUpdatePostoMutation();

    // Derived data
    const locations = Array.isArray(locationsData) ? locationsData : [];
    const periods = Array.isArray(periodsData) ? periodsData : (periodsData?.data || []);
    const dosens = Array.isArray(dosensData) ? dosensData : [];
    const isLoading = isCreating || isUpdating;

    // Auto-select active period for new posto
    useEffect(() => {
        if (!isEdit && periods && periods.length > 0) {
            // Find active period if any, or just take the first one
            const active = periods.find(p => p.is_active) || periods[0];
            if (active) {
                setFormData((prev) => ({
                    ...prev,
                    kkn_period_id: active.id,
                }));
            }
        }
    }, [periods, isEdit]);

    // Populate form for edit mode
    useEffect(() => {
        if (postoData) {
            setFormData({
                name: postoData.name,
                kkn_location_id: postoData.location?.id || '',
                kkn_period_id: postoData.kkn_period?.id || '',
                dpl_id: postoData.dpl?.id || '',
                description: postoData.description || '',
            });
        }
    }, [postoData]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEdit) {
                await updatePosto({ id, ...formData }).unwrap();
                toast.success('Posko berhasil diupdate');
            } else {
                await createPosto(formData).unwrap();
                toast.success('Posko berhasil dibuat');
            }
            navigate('/kkn/postos');
        } catch (error) {
            console.error('Failed to save posto:', error);
            toast.error(error.data?.message || 'Gagal menyimpan posko');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/kkn/postos')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Daftar Posko
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Posko' : 'Buat Posko Baru'}
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                        {/* Nama Posko */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Posko <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Contoh: Posko Desa Sukamaju"
                            />
                        </div>

                        {/* Lokasi KKN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lokasi KKN <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="kkn_location_id"
                                value={formData.kkn_location_id}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Pilih Lokasi</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Periode KKN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Periode KKN <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="kkn_period_id"
                                value={formData.kkn_period_id}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Pilih Periode</option>
                                {periods.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DPL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dosen Pembimbing Lapangan (DPL)
                            </label>
                            <select
                                name="dpl_id"
                                value={formData.dpl_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Pilih DPL (Opsional)</option>
                                {dosens.map((dosen) => (
                                    <option key={dosen.id} value={dosen.id}>
                                        {dosen.name}
                                    </option>
                                ))}
                            </select>
                        </div>



                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Deskripsi posko (opsional)"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/kkn/postos')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEdit ? 'Update Posko' : 'Simpan Posko'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
