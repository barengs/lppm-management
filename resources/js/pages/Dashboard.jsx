import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Users, MapPin, BookOpen, UserCheck } from 'lucide-react';
import MemberConsentList from '../components/MemberConsentList';

const PIE_COLORS = [
    '#16a34a', '#2563eb', '#9333ea', '#ea580c', '#0891b2',
    '#db2777', '#ca8a04', '#4f46e5', '#059669', '#dc2626',
    '#0d9488', '#7c3aed', '#d97706', '#0284c7', '#be185d',
];

function ProdiPieChartCard({ title, subtitle, data, unitLabel, emptyMessage, headerAction, isUpdating }) {
    return (
        <div className="bg-white p-6 shadow">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {headerAction}
            </div>
            {data && data.length > 0 ? (
                <div className={`h-80 w-full min-w-0 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="42%"
                                outerRadius={84}
                                label={({ percent }) => (percent >= 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => [`${val} ${unitLabel}`, 'Jumlah']} />
                            <Legend wrapperStyle={{ fontSize: '11px', maxHeight: '72px', overflowY: 'auto' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex items-center justify-center text-sm text-gray-400">
                    {emptyMessage}
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        participants_per_period: [],
        lecturer_count: 0,
        locations_per_period: [],
        abmas_per_period: [],
        pending_consents_count: 0,
        fiscal_years: [],
        selected_fiscal_year_id: null,
        lecturers_per_prodi: [],
        students_per_prodi: [],
    });
    const [selectedFiscalYearId, setSelectedFiscalYearId] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingStudents, setUpdatingStudents] = useState(false);

    const fetchStats = async (fiscalYearId = null, isFilterChange = false) => {
        if (isFilterChange) setUpdatingStudents(true);
        try {
            const response = await axios.get('/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` },
                params: fiscalYearId ? { fiscal_year_id: fiscalYearId } : undefined,
            });
            setStats(response.data);
            if (!fiscalYearId && response.data.selected_fiscal_year_id) {
                setSelectedFiscalYearId(String(response.data.selected_fiscal_year_id));
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
            setUpdatingStudents(false);
        }
    };

    useEffect(() => {
        // Redirect student if they somehow access this page
        if (user && user.role === 'mahasiswa') {
            navigate('/dashboard/kkn', { replace: true });
            return;
        }

        if (token && user?.role !== 'mahasiswa') fetchStats();
    }, [token, user, navigate]);

    const handleFiscalYearChange = (e) => {
        const nextId = e.target.value;
        setSelectedFiscalYearId(nextId);
        fetchStats(nextId, true);
    };

    const StatCard = ({ title, value, icon, iconBg }) => (
        <div className="bg-white shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${iconBg} mr-4`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center">Memuat dashboard...</div>;

    const activeFyObj = (stats.fiscal_years || []).find(
        (fy) => String(fy.id) === String(selectedFiscalYearId || stats.selected_fiscal_year_id)
    );
    const totalStudentsInPeriod = (stats.students_per_prodi || []).reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                    Selamat datang, <span className="font-semibold text-green-700">{user?.name}</span>
                </p>
            </div>

            {/* Member Consent Invitations */}
            <MemberConsentList onUpdate={() => fetchStats(selectedFiscalYearId || null)} />

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Dosen" 
                    value={stats.lecturer_count ?? 0} 
                    icon={<UserCheck className="text-green-600" size={24} />} 
                    iconBg="bg-green-100" 
                />
                 {/* Provide summary stats from the arrays */}
                <StatCard 
                    title="Peserta KKN (Thn Ini)" 
                    value={(stats.participants_per_period && stats.participants_per_period.length > 0) ? stats.participants_per_period[stats.participants_per_period.length - 1].total : 0} 
                    icon={<Users className="text-blue-600" size={24} />} 
                    iconBg="bg-blue-100" 
                />
                 <StatCard 
                    title="Lokasi KKN (Thn Ini)" 
                    value={(stats.locations_per_period && stats.locations_per_period.length > 0) ? stats.locations_per_period[stats.locations_per_period.length - 1].total : 0} 
                    icon={<MapPin className="text-purple-600" size={24} />} 
                    iconBg="bg-purple-100" 
                />
                 <StatCard 
                    title="Judul Abmas (Thn Ini)" 
                    value={(stats.abmas_per_period && stats.abmas_per_period.length > 0) ? stats.abmas_per_period[stats.abmas_per_period.length - 1].total : 0} 
                    icon={<BookOpen className="text-yellow-600" size={24} />} 
                    iconBg="bg-yellow-100" 
                />
            </div>

            {/* Pie Charts: Dosen & Mahasiswa per Prodi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProdiPieChartCard
                    title="Dosen per Program Studi"
                    subtitle={`Seluruh dosen terdaftar (${stats.lecturer_count ?? 0} dosen)`}
                    data={stats.lecturers_per_prodi}
                    unitLabel="Dosen"
                    emptyMessage="Belum ada data dosen per program studi."
                />

                <ProdiPieChartCard
                    title="Mahasiswa KKN per Program Studi"
                    subtitle={`Peserta disetujui Tahun Akademik ${activeFyObj?.year || '-'} (${totalStudentsInPeriod} mahasiswa)`}
                    data={stats.students_per_prodi}
                    unitLabel="Mahasiswa"
                    emptyMessage="Belum ada peserta KKN disetujui pada tahun akademik ini."
                    isUpdating={updatingStudents}
                    headerAction={
                        (stats.fiscal_years || []).length > 0 ? (
                            <select
                                aria-label="Pilih Tahun Akademik"
                                value={selectedFiscalYearId}
                                onChange={handleFiscalYearChange}
                                className="text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {stats.fiscal_years.map((fy) => (
                                    <option key={fy.id} value={fy.id}>
                                        Tahun {fy.year}{fy.is_active ? ' (Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        ) : null
                    }
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participants Chart */}
                <div className="bg-white p-6 shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Peserta KKN per Periode</h3>
                    <div className="h-72 w-full min-w-0">
                        <ResponsiveContainer width="100%" height={288} minWidth={0}>
                            <BarChart data={stats.participants_per_period}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" name="Jumlah Peserta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Locations Chart */}
                <div className="bg-white p-6 shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Jumlah Lokasi KKN per Periode</h3>
                    <div className="h-72 w-full min-w-0">
                        <ResponsiveContainer width="100%" height={288} minWidth={0}>
                            <BarChart data={stats.locations_per_period}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" name="Jumlah Lokasi" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Abmas Chart */}
                <div className="bg-white p-6 shadow lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Jumlah Pengabdian Masyarakat (Abmas) per Periode</h3>
                    <div className="h-72 w-full min-w-0">
                        <ResponsiveContainer width="100%" height={288} minWidth={0}>
                            <LineChart data={stats.abmas_per_period}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total" name="Jumlah Judul Abmas" stroke="#eab308" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
