import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

export default function DateTimePeriod() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activePeriod, setActivePeriod] = useState(null);
    const { token } = useAuthStore();

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch active fiscal year
    useEffect(() => {
        fetchActivePeriod();
    }, []);

    const fetchActivePeriod = async () => {
        try {
            const response = await axios.get('/api/fiscal-years/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both single object and array response
            const data = response.data;
            if (Array.isArray(data)) {
                setActivePeriod(data[0] || null);
            } else {
                setActivePeriod(data);
            }
        } catch (error) {
            console.error('Failed to fetch active period:', error);
        }
    };

    // Indonesian day and month names
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const monthName = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    const time = currentTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    return (
        <div className="flex items-center space-x-4 text-sm">
            {/* Date & Time */}
            <div className="flex items-center space-x-2 text-gray-700">
                <Calendar size={16} className="text-green-600" />
                <span className="font-medium">
                    {dayName}, {date} {monthName} {year}
                </span>
                <span className="hidden md:inline text-gray-400">|</span>
                <Clock size={16} className="hidden md:inline text-green-600" />
                <span className="hidden md:inline font-mono">{time}</span>
            </div>

            {/* Active Period */}
            {activePeriod && (
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-700 font-semibold text-xs">
                        Periode: {activePeriod.year}
                    </span>
                </div>
            )}
        </div>
    );
}
