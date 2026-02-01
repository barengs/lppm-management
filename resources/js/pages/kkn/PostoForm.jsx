import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

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

    const [locations, setLocations] = useState([]);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [dosens, setDosens] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEdit);

    useEffect(() => {
        fetchOptions();
        if (isEdit) {
            fetchPosto();
        }
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [locationsRes, fiscalYearsRes, dosensRes, activeFiscalYearRes] = await Promise.all([
                api.get('/kkn-locations'),
                api.get('/fiscal-years'),
                api.get('/users', { params: { role: 'dosen' } }),
                api.get('/fiscal-years/active').catch(() => ({ data: [] })), // Get active fiscal year, ignore error if not found
            ]);

            setLocations(locationsRes.data);
            setFiscalYears(fiscalYearsRes.data);
            setDosens(dosensRes.data);

            // Auto-select active fiscal year for new posko (not edit)
            // active endpoint returns array, get first item
            if (!isEdit && activeFiscalYearRes.data && activeFiscalYearRes.data.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    fiscal_year_id: activeFiscalYearRes.data[0].id
                }));
            }
        } catch (error) {
            console.error('Failed to fetch options:', error);
            toast.error('Gagal memuat data');
        }
    };

    const fetchPosto = async () => {
        setIsFetching(true);
        try {
            const { data } = await api.get(`/kkn/postos/${id}`);
            setFormData({
                name: data.name,
                kkn_location_id: data.location?.id || '',
                fiscal_year_id: data.fiscal_year?.id || '',
                dpl_id: data.dpl?.id || '',
                start_date: data.start_date || '',
                end_date: data.end_date || '',
                description: data.description || '',
            });
        } catch (error) {
            console.error('Failed to fetch posto:', error);
            toast.error('Gagal memuat data posko');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEdit) {
                await api.put(`/kkn/postos/${id}`, formData);
                toast.success('Posko berhasil diupdate');
            } else {
                await api.post('/kkn/postos', formData);
                toast.success('Posko berhasil dibuat');
            }
            navigate('/kkn/postos');
        } catch (error) {
            console.error('Failed to save posto:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan posko');
        } finally {
            setIsLoading(false);
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
