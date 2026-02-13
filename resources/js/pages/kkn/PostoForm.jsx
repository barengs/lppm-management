import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetFiscalYearsQuery, useGetActiveFiscalYearQuery, useGetUsersByRoleQuery } from '../../store/api/masterDataApi';
import {
    useGetKknLocationsQuery,
    useGetPostoByIdQuery,
    useCreatePostoMutation,
    useUpdatePostoMutation,
} from '../../store/api/kknApi';

export default function PostoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        kkn_location_id: '',
        fiscal_year_id: '',
        dpl_id: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    // RTK Query hooks
    const { data: locationsData } = useGetKknLocationsQuery();
    const { data: fiscalYearsData } = useGetFiscalYearsQuery();
    const { data: dosensData } = useGetUsersByRoleQuery('dosen');
    const { data: activeFiscalYearData } = useGetActiveFiscalYearQuery(undefined, {
        skip: isEdit, // Only fetch for new posto
    });

    // Fetch posto data for edit mode
    const { data: postoData, isLoading: isFetching } = useGetPostoByIdQuery(id, {
        skip: !isEdit, // Only fetch if editing
    });

    // Mutations
    const [createPosto, { isLoading: isCreating }] = useCreatePostoMutation();
    const [updatePosto, { isLoading: isUpdating }] = useUpdatePostoMutation();

    // Derived data
    const locations = Array.isArray(locationsData) ? locationsData : [];
    const fiscalYears = Array.isArray(fiscalYearsData) ? fiscalYearsData : [];
    const dosens = Array.isArray(dosensData) ? dosensData : [];
    const isLoading = isCreating || isUpdating;

    // Auto-select active fiscal year for new posto
    useEffect(() => {
        if (!isEdit && activeFiscalYearData && activeFiscalYearData.length > 0) {
            setFormData((prev) => ({
                ...prev,
                fiscal_year_id: activeFiscalYearData[0].id,
            }));
        }
    }, [activeFiscalYearData, isEdit]);

    // Populate form for edit mode
    useEffect(() => {
        if (postoData) {
            setFormData({
                name: postoData.name,
                kkn_location_id: postoData.location?.id || '',
                fiscal_year_id: postoData.fiscal_year?.id || '',
                dpl_id: postoData.dpl?.id || '',
                start_date: postoData.start_date || '',
                end_date: postoData.end_date || '',
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

                        {/* Tahun Ajaran */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tahun Ajaran <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="fiscal_year_id"
                                value={formData.fiscal_year_id}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Pilih Tahun Ajaran</option>
                                {fiscalYears.map((fy) => (
                                    <option key={fy.id} value={fy.id}>
                                        {fy.year}
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

                        {/* Periode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Selesai
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
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
