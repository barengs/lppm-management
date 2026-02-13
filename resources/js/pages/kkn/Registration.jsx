import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { CheckCircle, Upload, Save, User as UserIcon, FileText, Camera, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetFiscalYearsQuery, useGetFacultiesQuery, useGetStudyProgramsQuery } from '../../store/api/masterDataApi';
import { useGetDocumentTemplatesQuery, useCreateRegistrationMutation, useGetRegistrationsQuery } from '../../store/api/kknApi';
import { useGetProfileQuery } from '../../store/api/authApi';

export default function KknStudentRegistration() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    
    // Form States
    const [step, setStep] = useState(1);
    const [selectedFy, setSelectedFy] = useState('');
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    
    // Account Data (For Admin creating new student)
    const [accountData, setAccountData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fiscal_year_id: '',
    });
    const [errors, setErrors] = useState({});

    const [profileData, setProfileData] = useState({
        name: '',
        npm: '',
        prodi: '',
        fakultas: '',
        phone: '',
        address: '',
        ips: '',
        gender: '',
        place_of_birth: '',
        date_of_birth: '',
        jacket_size: '',
    });
    const [documents, setDocuments] = useState([]);
    const [files, setFiles] = useState({ photo: null });
    
    // RTK Query hooks
    const { data: fiscalYearsData } = useGetFiscalYearsQuery();
    const { data: facultiesData } = useGetFacultiesQuery();
    const { data: studyProgramsData } = useGetStudyProgramsQuery();
    const { data: fetchedProfile } = useGetProfileQuery(undefined, { skip: isAdmin });
    const { data: registrationsData } = useGetRegistrationsQuery({}, { skip: isAdmin }); // Only for students
    const { data: documentTemplatesData } = useGetDocumentTemplatesQuery(
        { fiscal_year_id: accountData.fiscal_year_id },
        { skip: !accountData.fiscal_year_id }
    );
    const [createRegistration, { isLoading: isSubmitting }] = useCreateRegistrationMutation();
    
    // Derived data from RTK Query
    const fiscalYears = fiscalYearsData || [];
    const faculties = facultiesData || [];
    const studyPrograms = studyProgramsData || [];
    const registrations = registrationsData?.data || [];
    
    // Photo Upload State
    const [isDragging, setIsDragging] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Password Visibility State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Initialize fiscal year when data loads
    useEffect(() => {
        if (fiscalYears.length > 0 && !selectedFy) {
            setSelectedFy(fiscalYears[0].id);
        }
    }, [fiscalYears, selectedFy]);

    // Load profile data from RTK Query
    useEffect(() => {
        if (!isAdmin && fetchedProfile) {
            const profile = fetchedProfile.mahasiswa_profile;
            if (profile) {
                setProfileData({
                    name: fetchedProfile.name,
                    npm: profile.npm || '',
                    prodi: profile.prodi || '',
                    fakultas: profile.fakultas || '',
                    phone: profile.phone || '',
                    address: profile.address || '',
                    ips: profile.ips || '',
                    gender: profile.gender || '',
                    place_of_birth: profile.place_of_birth || '',
                    date_of_birth: profile.date_of_birth || '',
                    jacket_size: profile.jacket_size || '',
                });
            }
        }
    }, [fetchedProfile, isAdmin]);

    // Transform document templates from RTK Query
    useEffect(() => {
        if (documentTemplatesData) {
            const docs = documentTemplatesData.map(template => ({
                id: template.slug,
                name: template.name,
                file: null,
                required: template.is_required,
                type: template.is_required ? 'required' : 'optional',
                description: template.description
            }));
            setDocuments(docs);
        }
    }, [documentTemplatesData]);

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

    // Camera & Drag Logic
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            setIsCameraOpen(true);
        } catch (err) {
            toast.error("Gagal akses kamera: " + err.message);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(blob => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                setFiles({ ...files, photo: file });
                stopCamera();
            }, 'image/jpeg');
        }
    };

    useEffect(() => {
        if (isCameraOpen && videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [isCameraOpen, cameraStream]);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFiles({ ...files, photo: e.dataTransfer.files[0] });
        }
    };

    const handleRegisterClick = () => {
        setShowConfirmModal(true);
    };

    const handleRegister = async () => {
        setShowConfirmModal(false);

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
        formData.append('jacket_size', profileData.jacket_size || '');

        // Account Data (Admin only)
        if (isAdmin) {
            formData.append('email', accountData.email);
            formData.append('password', accountData.password);
        }

        // Registration Data (location is optional now)
        formData.append('fiscal_year_id', selectedFy);

        // Files
        // Files
        // Documents (Dynamic)
        documents.forEach((doc, index) => {
            if (doc.file) {
                 formData.append(`documents[${index}][name]`, doc.name);
                 formData.append(`documents[${index}][file]`, doc.file);
                 // Send doc.id (e.g. 'krs', 'transkrip') as the type identifier
                 formData.append(`documents[${index}][type]`, doc.id);
            }
        });

        // Photo (Step 3)
        if (files.photo) formData.append('photo', files.photo);

        try {
            await createRegistration(formData).unwrap();
            toast.success("Berhasil mendaftar KKN!");
            
            // Redirect to participants page after short delay to show toast
            setTimeout(() => {
                navigate('/kkn/participants');
            }, 1500);
        } catch (error) {
            console.error('Registration failed:', error);
            
            // Handle specific error messages
            if (error.status === 500 && error.data?.message) {
                const message = error.data.message;
                
                // Check for duplicate NPM
                if (message.includes('Duplicate entry') && message.includes('npm')) {
                    toast.error("NPM sudah terdaftar! Gunakan NPM yang berbeda.");
                } 
                // Check for duplicate email
                else if (message.includes('Duplicate entry') && message.includes('email')) {
                    toast.error("Email sudah terdaftar! Gunakan email yang berbeda.");
                }
                // Generic validation error
                else if (message.includes('Integrity constraint violation')) {
                    toast.error("Data yang Anda masukkan sudah terdaftar. Periksa kembali NPM dan Email.");
                }
                // Other errors
                else {
                    toast.error(message);
                }
            } 
            // Handle validation errors (422)
            else if (error.status === 422 && error.data?.errors) {
                const errors = error.data.errors;
                const firstError = Object.values(errors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            }
            // Generic error
            else {
                toast.error(error.data?.message || "Gagal mendaftar. Silakan coba lagi.");
            }
            // Stay on form - modal will close automatically, form stays visible
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
                        href="/kkn/status" 
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
                {[
                    ...(isAdmin ? ['Akun & Data Akademik'] : []), // Updated Label
                    isAdmin ? 'Data Pribadi' : 'Data Diri & Akademik', 
                    'Dokumen Pendukung', 
                    'Upload Foto'
                ].map((label, idx) => (
                    <div key={idx} className={`flex flex-col items-center flex-1 cursor-pointer ${step === idx + 1 ? 'opacity-100' : 'opacity-50'}`} onClick={() => setStep(idx + 1)}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step > idx ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-center">{label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                
                {/* Step 1 (Admin Only): Account & Academic Data */}
                {isAdmin && step === 1 && (
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold flex items-center mb-4 border-b pb-2"><UserIcon className="mr-2 w-5 h-5" /> Buat Akun Mahasiswa</h3>
                         
                         {/* Account Info */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    value={accountData.email} 
                                    onChange={e => {
                                        setAccountData({...accountData, email: e.target.value});
                                        if (errors.email) setErrors({...errors, email: ''});
                                    }} 
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                                    required 
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div className="hidden md:block"></div> {/* Spacer */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={accountData.password} 
                                        onChange={e => {
                                            setAccountData({...accountData, password: e.target.value});
                                            if (errors.password) setErrors({...errors, password: ''});
                                        }} 
                                        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 pr-10 bg-white ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                                        required 
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 top-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        value={accountData.confirmPassword} 
                                        onChange={e => {
                                            setAccountData({...accountData, confirmPassword: e.target.value});
                                            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                                        }} 
                                        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 pr-10 bg-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} 
                                        required 
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 top-1"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Public Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={profileData.name} 
                                    onChange={(e) => {
                                        handleProfileChange(e);
                                        if (errors.name) setErrors({...errors, name: ''});
                                    }} 
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                                    required 
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NPM <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="npm" 
                                    value={profileData.npm} 
                                    onChange={(e) => {
                                        handleProfileChange(e);
                                        if (errors.npm) setErrors({...errors, npm: ''});
                                    }} 
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white ${errors.npm ? 'border-red-500' : 'border-gray-300'}`} 
                                    required 
                                />
                                {errors.npm && <p className="text-red-500 text-xs mt-1">{errors.npm}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fakultas <span className="text-red-500">*</span></label>
                                <select 
                                    name="fakultas" 
                                    value={profileData.fakultas} 
                                    onChange={(e) => {
                                        handleProfileChange(e);
                                        if (errors.fakultas) setErrors({...errors, fakultas: ''});
                                    }} 
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white ${errors.fakultas ? 'border-red-500' : 'border-gray-300'}`} 
                                    required
                                >
                                    <option value="">Pilih Fakultas</option>
                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                {errors.fakultas && <p className="text-red-500 text-xs mt-1">{errors.fakultas}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program Studi <span className="text-red-500">*</span></label>
                                <select 
                                    name="prodi" 
                                    value={profileData.prodi} 
                                    onChange={(e) => {
                                        handleProfileChange(e);
                                        if (errors.prodi) setErrors({...errors, prodi: ''});
                                    }} 
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white ${errors.prodi ? 'border-red-500' : 'border-gray-300'}`} 
                                    required 
                                    disabled={!profileData.fakultas}
                                >
                                    <option value="">Pilih Program Studi</option>
                                    {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {errors.prodi && <p className="text-red-500 text-xs mt-1">{errors.prodi}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ukuran Jaket/Kaos <span className="text-red-500">*</span></label>
                                <select 
                                    name="jacket_size" 
                                    value={profileData.jacket_size} 
                                    onChange={(e) => {
                                        handleProfileChange(e);
                                        if (errors.jacket_size) setErrors({...errors, jacket_size: ''});
                                    }} 
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white ${errors.jacket_size ? 'border-red-500' : 'border-gray-300'}`} 
                                    required
                                >
                                    <option value="">Pilih Ukuran</option>
                                    {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                {errors.jacket_size && <p className="text-red-500 text-xs mt-1">{errors.jacket_size}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button 
                                onClick={() => {
                                    // Validation for Step 1
                                    const newErrors = {};
                                    if (!accountData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
                                        newErrors.email = "Email tidak valid";
                                    }
                                    if (!accountData.password) {
                                        newErrors.password = "Password wajib diisi";
                                    } else if (accountData.password.length < 6) {
                                        newErrors.password = "Password minimal 6 karakter";
                                    }
                                    if (accountData.password !== accountData.confirmPassword) {
                                        newErrors.confirmPassword = "Password tidak cocok";
                                    }
                                    
                                    if (!profileData.name) newErrors.name = "Nama wajib diisi";
                                    if (!profileData.npm) newErrors.npm = "NPM wajib diisi";
                                    if (!profileData.fakultas) newErrors.fakultas = "Fakultas wajib dipilih";
                                    if (!profileData.prodi) newErrors.prodi = "Program studi wajib dipilih";
                                    if (!profileData.jacket_size) newErrors.jacket_size = "Ukuran jaket wajib dipilih";

                                    if (Object.keys(newErrors).length > 0) {
                                        setErrors(newErrors);
                                        toast.error("Mohon lengkapi data dengan benar.");
                                    } else {
                                        setErrors({});
                                        setStep(2);
                                    }
                                }} 
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                            >
                                Lanjut
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2 (or 1 for Student): Profile / Data Pribadi */}
                {(isAdmin ? step === 2 : step === 1) && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center mb-4 border-b pb-2"><UserIcon className="mr-2 w-5 h-5" /> {isAdmin ? 'Data Pribadi' : 'Data Diri'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Student Fields (Only show in Step 1 for Non-Admin) */}
                            {!isAdmin && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                        <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">NPM</label>
                                        <input type="text" name="npm" value={profileData.npm} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required />
                                    </div>
                                </>
                            )}

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

                            {/* Student Fields (Only show in Step 1 for Non-Admin) */}
                            {!isAdmin && (
                                <>
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
                                </>
                            )}

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
                            
                            {!isAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ukuran Jaket/Kaos</label>
                                    <select name="jacket_size" value={profileData.jacket_size} onChange={handleProfileChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 bg-white border" required>
                                        <option value="">Pilih Ukuran</option>
                                        {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            {isAdmin && <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 px-4 py-2 mr-2">Kembali</button>}
                            <button onClick={() => setStep(isAdmin ? 3 : 2)} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Lanjut</button>
                        </div>
                    </div>
                )}

                {/* Step 3 (or 2 for Student): Documents */}
                {(isAdmin ? step === 3 : step === 2) && (
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
                            <button onClick={() => setStep(isAdmin ? 2 : 1)} className="text-gray-600 hover:text-gray-900 px-4 py-2">Kembali</button>
                            <button onClick={() => setStep(isAdmin ? 4 : 3)} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Lanjut</button>
                        </div>
                    </div>
                )}

                {/* Step 4 (or 3 for Student): Photo Upload */}
                {(isAdmin ? step === 4 : step === 3) && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center mb-4 border-b pb-2"><Camera className="mr-2 w-5 h-5" /> Upload Pas Foto</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Input Area */}
                            <div>
                                {isCameraOpen ? (
                                    <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] flex items-center justify-center">
                                        <video ref={videoRef} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
                                        <div className="absolute bottom-4 flex space-x-2">
                                            <button 
                                                onClick={capturePhoto} 
                                                className="bg-white text-black p-3 rounded-full hover:bg-gray-200 shadow-lg"
                                                title="Ambil Foto"
                                            >
                                                <Camera size={24} />
                                            </button>
                                            <button 
                                                onClick={stopCamera} 
                                                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"
                                                title="Batal"
                                            >
                                                <span className="font-bold">X</span>
                                            </button>
                                        </div>
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                ) : (
                                    <div 
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors h-full flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}
                                    >
                                        <div onClick={() => document.getElementById('photo-upload').click()}>
                                            <Camera className={`mx-auto h-16 w-16 mb-4 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
                                            <p className="text-lg font-medium text-gray-700 mb-2">Drag & Drop Foto di sini</p>
                                            <p className="text-sm text-gray-500 mb-4">atau klik untuk upload (Max 2MB)</p>
                                            <input 
                                                id="photo-upload"
                                                type="file" 
                                                name="photo" 
                                                onChange={handlePhotoChange} 
                                                className="hidden" 
                                                accept=".jpg,.jpeg,.png" 
                                            />
                                        </div>
                                        
                                        <div className="my-4 text-gray-400 text-xs">- ATAU -</div>
                                        
                                        <button 
                                            onClick={startCamera}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                        >
                                            <Camera className="mr-2 w-4 h-4" /> Buka Kamera
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Preview Area */}
                            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <span className="text-sm font-medium text-gray-500 mb-4">Preview Foto</span>
                                {files.photo ? (
                                    <div className="relative shadow-md rounded-lg overflow-hidden">
                                        <img 
                                            src={URL.createObjectURL(files.photo)} 
                                            alt="Preview" 
                                            className="w-48 h-64 object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center truncate px-2">
                                            {files.photo.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8 border-t pt-6">
                            <button onClick={() => setStep(isAdmin ? 3 : 2)} className="text-gray-600 hover:text-gray-900 px-4 py-2">Kembali</button>
                            <button 
                                onClick={handleRegisterClick} 
                                disabled={isSubmitting}
                                className={`flex items-center bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transform transition-transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-800'}`}
                            >
                                <Save className="mr-2 w-5 h-5" />
                                {isSubmitting ? 'Proses Mendaftar...' : 'Selesaikan Pendaftaran'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Pendaftaran</h3>
                            </div>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Apakah Anda yakin semua data dan dokumen yang Anda masukkan sudah benar?
                            </p>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <p className="text-sm text-yellow-800">
                                    <strong>Perhatian:</strong> Pastikan semua informasi yang Anda berikan akurat. 
                                    Data yang salah dapat menyebabkan penolakan pendaftaran.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className={`flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Periksa Kembali
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={isSubmitting}
                                className={`flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Ya, Daftar Sekarang</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
