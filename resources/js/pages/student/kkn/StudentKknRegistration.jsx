import React, { useEffect, useState } from 'react';
import api from '../../../utils/api'; 
import useAuthStore from '../../../store/useAuthStore';
import { CheckCircle, Upload, Save, User as UserIcon, FileText, Camera } from 'lucide-react';
import { toast } from 'react-toastify';

export default function KknStudentRegistration() {
    const { token, user } = useAuthStore();
    const [registrations, setRegistrations] = useState([]);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [selectedFy, setSelectedFy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Master Data
    const [faculties, setFaculties] = useState([]);
    const [studyPrograms, setStudyPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    
    // Form States
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        npm: user?.mahasiswa_profile?.npm || '',
        prodi: user?.mahasiswa_profile?.prodi || '',
        fakultas: user?.mahasiswa_profile?.fakultas || '',
        phone: user?.mahasiswa_profile?.phone || '',
        address: user?.mahasiswa_profile?.address || '',
        ips: user?.mahasiswa_profile?.ips || '',
        gender: user?.mahasiswa_profile?.gender || '',
        place_of_birth: user?.mahasiswa_profile?.place_of_birth || '',
        date_of_birth: user?.mahasiswa_profile?.date_of_birth || '',
        jacket_size: user?.mahasiswa_profile?.jacket_size || '',
    });
    const [documents, setDocuments] = useState([
        { id: 'krs', name: 'Kartu Rencana Studi (KRS)', file: null, required: true, type: 'required' },
        { id: 'transkrip', name: 'Transkrip Nilai Sementara', file: null, required: true, type: 'required' },
        { id: 'ortu', name: 'Surat Izin Orang Tua', file: null, required: true, type: 'required' },
        { id: 'sehat', name: 'Surat Keterangan Sehat', file: null, required: false, type: 'optional' },
    ]);
    const [files, setFiles] = useState({ photo: null }); // Keep photo separate as it is in Step 3

    // Fetch initial data
    useEffect(() => {
        fetchData();
        fetchProfile();
    }, [token]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [regRes, fyRes, facRes, prodiRes] = await Promise.all([
                api.get('/kkn-registrations'),
                api.get('/fiscal-years/active'),
                api.get('/faculties'),
                api.get('/study-programs')
            ]);
            setRegistrations(regRes.data);
            setFiscalYears(fyRes.data);
            setFaculties(facRes.data);
            setStudyPrograms(prodiRes.data);
            if(fyRes.data.length > 0) setSelectedFy(fyRes.data[0].id);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load KKN data");
        }
        setIsLoading(false);
    };

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile/me');
            if (data && data.mahasiswa_profile) {
                setProfileData({
                    name: data.name,
                    email: data.email,
                    npm: data.mahasiswa_profile.npm || '',
                    prodi: data.mahasiswa_profile.prodi || '',
                    fakultas: data.mahasiswa_profile.fakultas || '',
                    phone: data.mahasiswa_profile.phone || '',
                    address: data.mahasiswa_profile.address || '',
                    ips: data.mahasiswa_profile.ips || '',
                    gender: data.mahasiswa_profile.gender || '',
                    place_of_birth: data.mahasiswa_profile.place_of_birth || '',
                    date_of_birth: data.mahasiswa_profile.date_of_birth || '',
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile");
        }
    }

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
        
        // Filter study programs when faculty changes
        if (name === 'fakultas') {
            const filtered = studyPrograms.filter(p => p.faculty_id == value);
            setFilteredPrograms(filtered);
            setProfileData(prev => ({ ...prev, prodi: '' })); // Reset prodi
        }
    };

    const handlePhotoChange = (e) => {
        setFiles({ ...files, photo: e.target.files[0] });
    };

    const handleDocumentFileChange = (index, file) => {
        const newDocs = [...documents];
        newDocs[index].file = file;
        setDocuments(newDocs);
    };

    const handleDocumentNameChange = (index, name) => {
         const newDocs = [...documents];
         newDocs[index].name = name;
         setDocuments(newDocs);
    };

    const addDocument = () => {
        setDocuments([...documents, { id: Date.now(), name: '', file: null, required: false, type: 'custom' }]);
    };

    const removeDocument = (index) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setDocuments(newDocs);
    };

    const handleRegister = async () => {
        if (!confirm("Apakah Anda yakin data dan dokumen sudah benar?")) return;

        const formData = new FormData();
        // Profile Data
        formData.append('name', profileData.name);
        formData.append('npm', profileData.npm);
        formData.append('prodi', profileData.prodi);
        formData.append('fakultas', profileData.fakultas);
        formData.append('phone', profileData.phone);
        formData.append('address', profileData.address);
        formData.append('ips', profileData.ips);
        formData.append('gender', profileData.gender);
        formData.append('place_of_birth', profileData.place_of_birth);
        formData.append('date_of_birth', profileData.date_of_birth);
        formData.append('jacket_size', profileData.jacket_size);

        // Registration Data (location is optional now)
        formData.append('fiscal_year_id', selectedFy);

        // Files
        // Documents (Dynamic)
        documents.forEach((doc, index) => {
            if (doc.file) {
                 formData.append(`documents[${index}][name]`, doc.name);
                 formData.append(`documents[${index}][file]`, doc.file);
                 formData.append(`documents[${index}][type]`, doc.type);
            }
        });

        // Photo (Step 3)
        if (files.photo) formData.append('photo', files.photo);

        try {
            setIsLoading(true);
            await api.post('/kkn-registrations', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Berhasil mendaftar KKN!");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mendaftar.");
        } finally {
            setIsLoading(false);
        }
    };

    const myRegistration = registrations.length > 0 ? registrations[0] : null;

    // Only show "already registered" message for students (mahasiswa)
    // Admin/staff should always see the form to register other students
    if (myRegistration && user?.role === 'mahasiswa') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Anda Telah Terdaftar!</h2>
                <div className="text-gray-600 mb-6">
                    <p>Lokasi: <span className="font-semibold text-gray-900">{myRegistration.location?.name}</span></p>
                    <p>Status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        myRegistration.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        myRegistration.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {myRegistration.status.toUpperCase()}
                    </span></p>
                    {myRegistration.dpl && <p className="mt-2 text-sm">DPL: {myRegistration.dpl.name}</p>}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-500">
                    <p>Validation Notes: {myRegistration.validation_notes || "Belum ada catatan validasi."}</p>
                </div>
                <div className="mt-6">
                    <a 
                        href="/dashboard/kkn/status" 
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                        Lihat Detail Status
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
                Formulir Pendaftaran KKN
            </h1>

            {/* Stepper */}
            <div className="flex justify-between items-center mb-8">
                {['Data Diri & Akademik', 'Dokumen Pendukung', 'Upload Foto'].map((label, idx) => (
                    <div key={idx} className={`flex flex-col items-center w-1/3 cursor-pointer ${step === idx + 1 ? 'opacity-100' : 'opacity-50'}`} onClick={() => setStep(idx + 1)}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step > idx ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-center">{label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                
                {/* Step 1: Profile */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center mb-4 border-b pb-2"><UserIcon className="mr-2 w-5 h-5" /> Data Diri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NPM</label>
                                <input type="text" name="npm" value={profileData.npm} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                <select name="gender" value={profileData.gender} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required>
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                                    <input type="text" name="place_of_birth" value={profileData.place_of_birth} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <input type="date" name="date_of_birth" value={profileData.date_of_birth} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fakultas</label>
                                <select name="fakultas" value={profileData.fakultas} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required>
                                    <option value="">Pilih Fakultas</option>
                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                                <select name="prodi" value={profileData.prodi} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required disabled={!profileData.fakultas}>
                                    <option value="">Pilih Program Studi</option>
                                    {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. HP / WA</label>
                                <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Indeks Prestasi Sementara (IPS)</label>
                                <input type="number" step="0.01" min="0" max="4.00" name="ips" value={profileData.ips} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required placeholder="0.00 - 4.00" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                                <textarea name="address" rows="3" value={profileData.address} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ukuran Jaket/Kaos</label>
                                <select name="jacket_size" value={profileData.jacket_size} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required>
                                    <option value="">Pilih Ukuran</option>
                                    {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setStep(2)} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Lanjut</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Documents */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center mb-4 border-b pb-2"><FileText className="mr-2 w-5 h-5" /> Unggah Dokumen Pendukung</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Nama Dokumen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Upload</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.map((doc, index) => (
                                        <tr key={doc.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {doc.required ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                                        <span className="text-xs text-red-500">*Wajib</span>
                                                    </div>
                                                ) : (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Nama Dokumen..." 
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2 border"
                                                        value={doc.name}
                                                        onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer group">
                                                    <input 
                                                        type="file" 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e) => handleDocumentFileChange(index, e.target.files[0])}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                    />
                                                    <div className="text-center">
                                                        {doc.file ? (
                                                            <div className="flex items-center text-green-600">
                                                                <CheckCircle size={16} className="mr-1" />
                                                                <span className="text-sm truncate max-w-[200px]">{doc.file.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-gray-500 group-hover:text-green-600">
                                                                <Upload size={16} className="mr-2" />
                                                                <span className="text-xs">Drag & Drop atau Klik</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!doc.required && (
                                                    <button 
                                                        onClick={() => removeDocument(index)}
                                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button 
                            onClick={addDocument}
                            className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                        >
                            + Tambah Dokumen Lain
                        </button>

                        <div className="flex justify-between mt-6">
                            <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 px-4 py-2">Kembali</button>
                            <button onClick={() => setStep(3)} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Lanjut</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Photo Upload */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center mb-4 border-b pb-2"><Camera className="mr-2 w-5 h-5" /> Upload Pas Foto</h3>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                            <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">Pas Foto (3x4)</p>
                            <p className="text-sm text-gray-500 mb-4">Format: JPG, JPEG, PNG (Max 2MB)</p>
                            <input 
                                type="file" 
                                name="photo" 
                                onChange={handlePhotoChange} 
                                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
                                accept=".jpg,.jpeg,.png" 
                            />
                            {files.photo && (
                                <div className="mt-4 text-sm text-green-600 font-medium">
                                    ✓ File dipilih: {files.photo.name}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between mt-8 border-t pt-6">
                            <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-900 px-4 py-2">Kembali</button>
                            <button 
                                onClick={handleRegister} 
                                disabled={isLoading}
                                className={`flex items-center bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transform transition-transform hover:-translate-y-0.5 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-800'}`}
                            >
                                <Save className="mr-2 w-5 h-5" />
                                {isLoading ? 'Proses Mendaftar...' : 'Selesaikan Pendaftaran'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
