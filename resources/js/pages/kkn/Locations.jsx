import React, { useEffect, useState, useMemo } from 'react';
import { MapPin, Plus, Edit, Trash2, Upload, Download } from 'lucide-react';
import LocationMapPicker from '../../components/LocationMapPicker';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';
import { useGetFiscalYearsQuery } from '../../store/api/masterDataApi';
import { 
    useGetKknLocationsQuery, 
    useCreateKknLocationMutation, 
    useUpdateKknLocationMutation, 
    useDeleteKknLocationMutation,
    useImportKknLocationsMutation,
    useDownloadKknLocationTemplateMutation
} from '../../store/api/kknApi';
import { 
    useGetProvincesQuery, 
    useGetCitiesQuery, 
    useGetDistrictsQuery, 
    useGetVillagesQuery 
} from '../../store/api/indonesiaApi';

export default function KknLocationsIndex() {
    // RTK Query hooks
    const { data: locationsData, isLoading } = useGetKknLocationsQuery();
    const { data: fiscalYearsData } = useGetFiscalYearsQuery();
    const { data: provincesData } = useGetProvincesQuery();
    
    // Mutations
    const [createLocation] = useCreateKknLocationMutation();
    const [updateLocation] = useUpdateKknLocationMutation();
    const [deleteLocation] = useDeleteKknLocationMutation();
    const [importLocations, { isLoading: isImporting }] = useImportKknLocationsMutation();
    const [downloadTemplate] = useDownloadKknLocationTemplateMutation();
    
    // Derived data
    const locations = locationsData || [];
    const fiscalYears = fiscalYearsData || [];
    const provinces = provincesData || [];
    
    // Modal
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        quota: 0, 
        description: '', 
        fiscal_year_id: '',
        location_type: 'domestic',
        country: '',
        province_id: '',
        city_id: '',
        district_id: '',
        village_id: '',
        latitude: '-7.1568',
        longitude: '113.4746'
    });

    // Import Modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    
    // Cascading dropdowns with RTK Query
    const { data: citiesData } = useGetCitiesQuery(formData.province_id, { 
        skip: !formData.province_id 
    });
    const { data: districtsData } = useGetDistrictsQuery(formData.city_id, { 
        skip: !formData.city_id 
    });
    const { data: villagesData } = useGetVillagesQuery(formData.district_id, { 
        skip: !formData.district_id 
    });
    
    const cities = citiesData || [];
    const districts = districtsData || [];
    const villages = villagesData || [];

    // Initialize fiscal year when data loads
    useEffect(() => {
        if (fiscalYears.length > 0 && !formData.fiscal_year_id) {
            setFormData(prev => ({ ...prev, fiscal_year_id: fiscalYears[0].id }));
        }
    }, [fiscalYears, formData.fiscal_year_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateLocation({ id: selectedId, ...formData }).unwrap();
                toast.success('Lokasi berhasil diperbarui!');
            } else {
                await createLocation(formData).unwrap();
                toast.success('Lokasi berhasil ditambahkan!');
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.data?.message || 'Gagal menyimpan lokasi');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this location?')) return;
        try {
            await deleteLocation(id).unwrap();
            toast.success('Lokasi berhasil dihapus!');
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus lokasi');
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;
        
        const data = new FormData();
        data.append('file', importFile);
        data.append('fiscal_year_id', formData.fiscal_year_id || (fiscalYears[0] ? fiscalYears[0].id : ''));

        try {
            await importLocations(data).unwrap();
            toast.success('Import lokasi berhasil!');
            setShowImportModal(false);
            setImportFile(null);
        } catch (error) {
            console.error(error);
            toast.error(error.data?.message || 'Import gagal. Periksa format file Anda.');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await downloadTemplate().unwrap();
            toast.success('Template berhasil diunduh!');
        } catch (error) {
            console.error("Failed to download template", error);
            toast.error('Gagal mengunduh template');
        }
    };

    // Define columns for DataTable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nama Lokasi',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium text-gray-900">{row.original.name}</div>
                        <div className="text-xs text-gray-500">
                            Lat: {row.original.latitude}, Long: {row.original.longitude}
                        </div>
                    </div>
                ),
            },
            {
                id: 'region',
                header: 'Wilayah',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">
                        {row.original.location_type === 'international' 
                            ? <span className="text-blue-600 font-semibold">{row.original.country} (Luar Negeri)</span> 
                            : `${row.original.district?.name}, ${row.original.city?.name}, ${row.original.province?.name}`
                        }
                    </div>
                ),
            },
            {
                accessorKey: 'fiscal_year.year',
                header: 'Tahun',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">{row.original.fiscal_year?.year}</div>
                ),
            },
            {
                accessorKey: 'quota',
                header: 'Kuota',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-900">{row.original.quota}</div>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setFormData({ 
                                    name: row.original.name, 
                                    quota: row.original.quota, 
                                    description: row.original.description || '', 
                                    fiscal_year_id: row.original.fiscal_year_id,
                                    location_type: row.original.location_type || 'domestic',
                                    country: row.original.country || '',
                                    province_id: row.original.province_id,
                                    city_id: row.original.city_id,
                                    district_id: row.original.district_id,
                                    village_id: row.original.village_id,
                                    latitude: row.original.latitude,
                                    longitude: row.original.longitude
                                });
                                setSelectedId(row.original.id);
                                setIsEditing(true);
                                setShowModal(true);
                            }} 
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(row.original.id)} 
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <MapPin className="mr-2 text-green-700" /> Lokasi KKN
                </h1>
                <div className="flex space-x-2">
                    <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                        <Upload size={18} className="mr-2" /> Import
                    </button>
                    <button onClick={() => { 
                        setFormData({ name: '', quota: 0, description: '', fiscal_year_id: fiscalYears[0]?.id || '', location_type: 'domestic', country: '', province_id: '', city_id: '', district_id: '', village_id: '', latitude: '-7.1568', longitude: '113.4746' });
                        setIsEditing(false); 
                        setShowModal(true); 
                    }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                        <Plus size={18} className="mr-2" /> Tambah Lokasi
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable
                    data={locations}
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari berdasarkan nama lokasi, wilayah, atau tahun...',
                        emptyMessage: 'Tidak ada lokasi KKN ditemukan',
                    }}
                />
            </div>

             {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Lokasi' : 'Tambah Lokasi'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Tahun Anggaran</label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={formData.fiscal_year_id}
                                    onChange={e => setFormData({...formData, fiscal_year_id: e.target.value})}
                                >
                                    {fiscalYears.map(fy => <option key={fy.id} value={fy.id}>{fy.year}</option>)}
                                </select>
                            </div>
                            
                            {/* Region Selectors */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Lokasi</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="location_type" 
                                            value="domestic" 
                                            checked={formData.location_type === 'domestic'} 
                                            onChange={() => setFormData({...formData, location_type: 'domestic', country: ''})}
                                            className="text-green-600 focus:ring-green-500"
                                        />
                                        <span>Dalam Negeri</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="location_type" 
                                            value="international" 
                                            checked={formData.location_type === 'international'} 
                                            onChange={() => setFormData({...formData, location_type: 'international', province_id: '', city_id: '', district_id: '', village_id: ''})}
                                            className="text-green-600 focus:ring-green-500"
                                        />
                                        <span>Luar Negeri</span>
                                    </label>
                                </div>
                            </div>

                            {formData.location_type === 'international' ? (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Negara <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full border p-2 rounded" 
                                        placeholder="Contoh: Malaysia, Singapura"
                                        value={formData.country} 
                                        onChange={e => setFormData({...formData, country: e.target.value, name: e.target.value})}
                                        required
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                                        <select className="w-full border p-2 rounded" value={formData.province_id} onChange={e => setFormData({...formData, province_id: e.target.value, city_id: '', district_id: '', village_id: '', name: ''})}>
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kota/Kabupaten</label>
                                        <select className="w-full border p-2 rounded" value={formData.city_id} onChange={e => setFormData({...formData, city_id: e.target.value, district_id: '', village_id: '', name: ''})} disabled={!formData.province_id}>
                                            <option value="">Pilih Kota/Kab</option>
                                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                                        <select className="w-full border p-2 rounded" value={formData.district_id} onChange={e => setFormData({...formData, district_id: e.target.value, village_id: '', name: ''})} disabled={!formData.city_id}>
                                            <option value="">Pilih Kecamatan</option>
                                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Desa/Kelurahan</label>
                                        <select 
                                            className="w-full border p-2 rounded" 
                                            value={formData.village_id} 
                                            onChange={e => {
                                                const selectedVillage = villages.find(v => v.id == e.target.value);
                                                setFormData({
                                                    ...formData, 
                                                    village_id: e.target.value,
                                                    name: selectedVillage ? selectedVillage.name : ''
                                                });
                                            }} 
                                            disabled={!formData.district_id}
                                        >
                                            <option value="">Pilih Desa/Kelurahan</option>
                                            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kuota Mahasiswa</label>
                                <input type="number" className="w-full border p-2 rounded" required min="1" value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} />
                            </div>

                            {/* Coordinates */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Lokasi di Peta</label>
                                <LocationMapPicker 
                                    latitude={parseFloat(formData.latitude)} 
                                    longitude={parseFloat(formData.longitude)} 
                                    onLocationSelect={({latitude, longitude}) => setFormData({...formData, latitude, longitude})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                <input type="text" className="w-full border p-2 rounded" placeholder="-7.12345" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                <input type="text" className="w-full border p-2 rounded" placeholder="110.12345" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                            </div>

                            <div className="col-span-2 flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
             )}

             {/* Import Modal */}
             {showImportModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Import Lokasi (Excel)</h2>
                            <button onClick={handleDownloadTemplate} className="text-sm text-blue-600 hover:underline flex items-center">
                                <Download size={16} className="mr-1" /> Template
                            </button>
                        </div>
                        <form onSubmit={handleImport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel (.xlsx, .xls, .csv)</label>
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    className="w-full border p-2 rounded"
                                    required 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Kolom: <strong>name, quota, description, province, city, district, latitude, longitude</strong>
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded">Batal</button>
                                <button type="submit" disabled={isImporting} className="px-4 py-2 bg-blue-600 text-white rounded">{isImporting ? 'Importing...' : 'Import'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
