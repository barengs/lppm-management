import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { Users, MapPin, BookOpen, UserCheck } from 'lucide-react';

export default function Dashboard() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({
        participants_per_period: [],
        lecturer_count: 0,
        locations_per_period: [],
        abmas_per_period: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Dashboard mounted. Token exists:", !!token);
        const fetchStats = async () => {
            console.log("Fetching dashboard stats...");
            try {
                const response = await axios.get('/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Stats received:", response.data);
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
        else console.log("No token available, skipping stats fetch");
    }, [token]);

    const StatCard = ({ title, value, icon, color }) => (
        <div className={`bg-white shadow p-6 border-l-4 ${color}`}>
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('600', '100').replace('500', '100')} mr-4`}>
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

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white shadow p-6 border-l-4 border-green-600">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                    Selamat datang, <span className="font-semibold text-green-700">{user?.name}</span>
                </p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Dosen" 
                    value={stats.lecturer_count ?? 0} 
                    icon={<UserCheck className="text-green-600" size={24} />} 
                    color="border-green-600" 
                />
                 {/* Provide summary stats from the arrays */}
                <StatCard 
                    title="Peserta KKN (Thn Ini)" 
                    value={(stats.participants_per_period && stats.participants_per_period.length > 0) ? stats.participants_per_period[stats.participants_per_period.length - 1].total : 0} 
                    icon={<Users className="text-blue-600" size={24} />} 
                    color="border-blue-600" 
                />
                 <StatCard 
                    title="Lokasi KKN (Thn Ini)" 
                    value={(stats.locations_per_period && stats.locations_per_period.length > 0) ? stats.locations_per_period[stats.locations_per_period.length - 1].total : 0} 
                    icon={<MapPin className="text-purple-600" size={24} />} 
                    color="border-purple-600" 
                />
                 <StatCard 
                    title="Judul Abmas (Thn Ini)" 
                    value={(stats.abmas_per_period && stats.abmas_per_period.length > 0) ? stats.abmas_per_period[stats.abmas_per_period.length - 1].total : 0} 
                    icon={<BookOpen className="text-yellow-600" size={24} />} 
                    color="border-yellow-600" 
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participants Chart */}
                <div className="bg-white p-6 shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Peserta KKN per Periode</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
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
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
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
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
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
