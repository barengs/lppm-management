import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

import { MapPin, Plus, Edit, Trash2, Upload, Download } from 'lucide-react';
import LocationMapPicker from '../../components/LocationMapPicker';
import { toast } from 'react-toastify';

export default function KknLocationsIndex() {
    const { token } = useAuthStore();
    const [locations, setLocations] = useState([]);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Region Data
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);

    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        quota: 0, 
        description: '', 
        fiscal_year_id: '',
        province_id: '',
        city_id: '',
        district_id: '',
        village_id: '',
        latitude: '-7.1568',  // Default: Pamekasan, Madura
        longitude: '113.4746'
    });

    // Import Modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [locRes, fyRes, provRes] = await Promise.all([
                axios.get('/api/kkn-locations', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/fiscal-years/active', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/indonesia/provinces', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setLocations(locRes.data);
            setFiscalYears(fyRes.data);
            setProvinces(provRes.data);
            if (fyRes.data.length > 0) {
                setFormData(prev => ({ ...prev, fiscal_year_id: fyRes.data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error('Gagal memuat data lokasi KKN');
        }
        setIsLoading(false);
    };

    const fetchCities = async (provinceId) => {
        if (!provinceId) return;
        try {
            const res = await axios.get(`/api/indonesia/cities?province_id=${provinceId}`, { headers: { Authorization: `Bearer ${token}` } });
            setCities(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchDistricts = async (cityId) => {
        if (!cityId) return;
        try {
            const res = await axios.get(`/api/indonesia/districts?city_id=${cityId}`, { headers: { Authorization: `Bearer ${token}` } });
            setDistricts(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchVillages = async (districtId) => {
        if (!districtId) return;
        try {
            const res = await axios.get(`/api/indonesia/villages?district_id=${districtId}`, { headers: { Authorization: `Bearer ${token}` } });
            setVillages(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        if (formData.province_id) fetchCities(formData.province_id);
    }, [formData.province_id]);

    useEffect(() => {
        if (formData.city_id) fetchDistricts(formData.city_id);
    }, [formData.city_id]);

    useEffect(() => {
        if (formData.district_id) fetchVillages(formData.district_id);
    }, [formData.district_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`/api/kkn-locations/${selectedId}`, formData, {
                   headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/kkn-locations', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchData();
            toast.success(isEditing ? 'Lokasi berhasil diperbarui!' : 'Lokasi berhasil ditambahkan!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan lokasi');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this location?')) return;
        try {
            await axios.delete(`/api/kkn-locations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
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

        setIsImporting(true);
        try {
            await axios.post('/api/kkn-locations/import', data, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            toast.success('Import lokasi berhasil!');
            setShowImportModal(false);
            setImportFile(null);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Import gagal. Periksa format file Anda.');
        }
        setIsImporting(false);
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get('/api/kkn-locations/template', {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'locations_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Template berhasil diunduh!');
        } catch (error) {
            console.error("Failed to download template", error);
            toast.error('Gagal mengunduh template');
        }
    };

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
                        setFormData({ name: '', quota: 0, description: '', fiscal_year_id: fiscalYears[0]?.id || '', province_id: '', city_id: '', district_id: '', village_id: '', latitude: '-7.1568', longitude: '113.4746' });
                        setIsEditing(false); 
                        setShowModal(true); 
                    }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                        <Plus size={18} className="mr-2" /> Tambah Lokasi
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lokasi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wilayah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kuota</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {locations.map(loc => (
                            <tr key={loc.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {loc.name}
                                    <div className="text-xs text-gray-500">Lat: {loc.latitude}, Long: {loc.longitude}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {loc.district?.name}, {loc.city?.name}, {loc.province?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.fiscal_year?.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.quota}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => {
                                        setFormData({ 
                                            name: loc.name, 
                                            quota: loc.quota, 
                                            description: loc.description || '', 
                                            fiscal_year_id: loc.fiscal_year_id,
                                            province_id: loc.province_id,
                                            city_id: loc.city_id,
                                            district_id: loc.district_id,
                                            village_id: loc.village_id,
                                            latitude: loc.latitude,
                                            longitude: loc.longitude
                                        });
                                        setSelectedId(loc.id);
                                        setIsEditing(true);
                                        setShowModal(true);
                                    }} className="text-blue-600 mr-3"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(loc.id)} className="text-red-600"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
