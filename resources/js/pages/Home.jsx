import React from 'react';
import { Calendar, FileText, Users, Link as LinkIcon, Download, BarChart2, BookOpen, AlertCircle } from 'lucide-react';

export default function Home() {
    return (
        <div className="bg-gray-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <span className="bg-yellow-400 text-green-900 text-xs font-bold px-2 py-1 rounded mb-4 inline-block">
                            PENGUMUMAN TERBARU
                        </span>
                        <h2 className="text-3xl font-bold mb-4">
                            Pengumuman Penerimaan Proposal Penelitian & Pengabdian 2026
                        </h2>
                        <p className="text-green-100 mb-6 font-light">
                            Program Hibah Penelitian dan Pengabdian kepada Masyarakat untuk Dosen dan Mahasiswa Universitas Islam Madura.
                        </p>
                        <button className="bg-white text-green-900 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300">
                            Selengkapnya
                        </button>
                    </div>
                    <div className="md:w-1/2 flex justify-end">
                        <div className="relative w-full max-w-md">
                           <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                                <div className="flex items-center space-x-4 mb-4">
                                    <Calendar className="text-yellow-400 h-8 w-8" />
                                    <div>
                                        <div className="text-sm text-gray-300">Batas Akhir</div>
                                        <div className="font-bold">28 Februari 2026</div>
                                    </div>
                                </div>
                                <div className="h-2 bg-green-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 w-3/4"></div>
                                </div>
                                <div className="mt-2 text-right text-xs text-yellow-400">75% Waktu Berjalan</div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & Center Columns: Info Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard 
                            title="INFO PENERIMAAN PROPOSAL" 
                            desc="Grant / Hibah Riset dan Penyelenggaraan Seminar"
                            icon={<FileText className="h-6 w-6" />}
                        />
                        <InfoCard 
                            title="INFO PKM" 
                            desc="Pelaksanaan Riset dan Pengabdian Kepada Masyarakat" 
                            icon={<Users className="h-6 w-6" />}
                        />
                         <InfoCard 
                            title="SIM PENGABDIAN" 
                            desc="Sistem Informasi Manajemen Pengabdian" 
                            icon={<BookOpen className="h-6 w-6" />}
                        />
                        <InfoCard 
                            title="INFO KULIAH KERJA NYATA" 
                            desc="Informasi pelaksanaan KKN Reguler & Tematik" 
                            icon={<Users className="h-6 w-6" />}
                        />
                        <InfoCard 
                            title="INFO PUBLIKASI" 
                            desc="Jurnal Ilmiah dan Prosiding Seminar" 
                            icon={<BookOpen className="h-6 w-6" />}
                        />
                        <InfoCard 
                            title="BERKAS UNDUHAN" 
                            desc="Template Proposal dan Panduan" 
                            icon={<Download className="h-6 w-6" />}
                        />
                        <InfoCard 
                            title="SURVEI PELAYANAN" 
                            desc="Kepuasan Layanan LPPM UIM" 
                            icon={<BarChart2 className="h-6 w-6" />}
                        />
                         <InfoCard 
                            title="CLINIC PROPOSAL" 
                            desc="Bimbingan Teknis Penulisan Proposal" 
                            icon={<AlertCircle className="h-6 w-6" />}
                        />
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">
                        {/* Recent Announcements */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-yellow-400 inline-block">
                                PENGUMUMAN TERBARU
                            </h3>
                            <ul className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <li key={i} className="group cursor-pointer">
                                        <span className="text-xs text-gray-500 font-semibold block mb-1">26 Jan 2026</span>
                                        <h4 className="text-sm font-medium text-green-900 group-hover:text-green-600 transition-colors">
                                            Pengumuman Penerimaan Proposal Penelitian Internal Tahun 2026
                                        </h4>
                                    </li>
                                ))}
                            </ul>
                            <a href="#" className="text-xs font-bold text-yellow-600 mt-4 inline-block hover:underline">LIHAT SEMUA &rarr;</a>
                        </div>

                         {/* Agenda */}
                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-yellow-400 inline-block">
                                AGENDA
                            </h3>
                             <ul className="space-y-4">
                                <AgendaItem day="30" month="JAN" title="Diseminasi Hasil Penelitian" />
                                <AgendaItem day="12" month="FEB" title="Workshop Metodologi Riset" />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section: News & Video */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Latest News (Berita) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                             <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="w-2 h-8 bg-green-600 mr-3 rounded-full"></span>
                                BERITA TERBARU
                            </h3>
                             <a href="#" className="text-green-700 hover:text-green-900 font-semibold text-sm">Lihat Semua Berita &rarr;</a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group border border-gray-100">
                                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                                        <img src={`https://source.unsplash.com/random/400x300?university,research&sig=${i}`} alt="News Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                                            PENELITIAN
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                            <Calendar size={14} />
                                            <span>26 Jan 2026</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                                            Dosen UIM Raih Hibah Penelitian Kompetitif Nasional 2026
                                        </h4>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            Universitas Islam Madura kembali menorehkan prestasi melalui pencapaian dosen dalam mendapatkan hibah penelitian kompetitif nasional dari Kemdikbud Ristek.
                                        </p>
                                        <a href="#" className="text-green-600 font-bold text-sm hover:underline">Baca Selengkapnya</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Announcements & Video */}
                    <div className="space-y-8">
                        
                        {/* Announcements (moved from top) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="bg-yellow-400 w-1.5 h-6 mr-3"></span>
                                PENGUMUMAN
                            </h3>
                            <ul className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <li key={i} className="group cursor-pointer border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <span className="text-xs text-gray-400 font-semibold block mb-1">26 Jan 2026</span>
                                        <h4 className="text-sm font-medium text-gray-800 group-hover:text-green-700 transition-colors leading-relaxed">
                                            Jadwal Upload Laporan Kemajuan Penelitian Internal Tahun 2026
                                        </h4>
                                    </li>
                                ))}
                            </ul>
                            <a href="#" className="block text-center bg-gray-50 text-green-700 font-bold text-sm py-2 mt-4 rounded hover:bg-green-50 transition-colors">Arsip Pengumuman</a>
                        </div>

                        {/* Video Kegiatan */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="bg-red-500 w-1.5 h-6 mr-3"></span>
                                VIDEO KEGIATAN
                            </h3>
                            <div className="space-y-4">
                                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer">
                                    <img src="https://source.unsplash.com/random/400x225?conference" alt="Video Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">Seminar Nasional Hasil Pengabdian 2025</h4>
                                    <p className="text-xs text-gray-500">Liputan kegiatan seminar nasional yang dihadiri oleh...</p>
                                </div>
                            </div>
                         </div>

                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-green-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                         <h3 className="text-2xl font-bold uppercase tracking-widest text-yellow-400">Data Kinerja Institut</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatItem value="1,271" label="Judul Penelitian" />
                        <StatItem value="27,124" label="Sitasi" />
                        <StatItem value="364" label="HKI / Paten" />
                        <StatItem value="31,339" label="Dokumen Publikasi" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ title, desc, icon }) {
    return (
        <a href="#" className="bg-yellow-500 hover:bg-yellow-400 transition-colors p-6 rounded-lg text-white shadow-md flex items-start space-x-4 group min-h-[140px]">
            <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight mb-2">{title}</h3>
                <p className="text-yellow-100 text-sm">{desc}</p>
            </div>
        </a>
    );
}

function StatItem({ value, label }) {
    return (
        <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">{value}</div>
            <div className="text-green-100 font-medium uppercase text-sm tracking-wide">{label}</div>
        </div>
    );
}

function AgendaItem({ day, month, title }) {
    return (
        <li className="flex items-center space-x-4">
            <div className="text-center bg-gray-100 rounded p-2 min-w-[60px]">
                <div className="text-xl font-bold text-gray-800">{day}</div>
                <div className="text-xs font-bold text-gray-500">{month}</div>
            </div>
            <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        </li>
    );
}
