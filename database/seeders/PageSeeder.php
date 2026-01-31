<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Page::updateOrCreate(
            ['type' => 'kkn'], // Using strict type if enum allows, or we add 'kkn' to enum
            [
                'title' => 'Kuliah Kerja Nyata (KKN)',
                'content' => [
                    'hero_title' => 'Kuliah Kerja Nyata (KKN)',
                    'hero_desc' => 'Program pengabdian mahasiswa kepada masyarakat sebagai wujud implementasi Tri Dharma Perguruan Tinggi.',
                    'info_cards' => [
                        [
                            'icon' => 'MapPin',
                            'title' => 'Pilih Lokasi',
                            'desc' => 'Tentukan lokasi pengabdian sesuai dengan kuota yang tersedia di berbagai desa binaan.'
                        ],
                        [
                            'icon' => 'Calendar',
                            'title' => 'Jadwal Pelaksanaan',
                            'desc' => 'Ikuti jadwal pembekalan, pelaksanaan, hingga pelaporan sesuai kalender akademik.'
                        ],
                        [
                            'icon' => 'CheckCircle',
                            'title' => 'Validasi & Penilaian',
                            'desc' => 'Proses validasi berkas otomatis dan penilaian kinerja berbasis sistem.'
                        ]
                    ]
                ],
                // We need to ensure 'kkn' is a valid enum value or change column to string
            ]
        );

        // Use updateOrCreate to prevent duplicates
        Page::updateOrCreate(
            ['slug' => 'penerimaan-proposal-2026'],
            [
                'title' => 'Penerimaan Proposal Penelitian 2026',
                'type' => 'news',
                'icon' => 'FileText',
                'hero_desc' => 'Grant / Hibah Riset dan Penyelenggaraan Seminar',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Penerimaan Proposal Penelitian Internal 2026',
                    'hero_desc' => 'Hibah penelitian internal untuk dosen dan mahasiswa tahun anggaran 2026.',
                    'body' => '<p>Informasi detail mengenai penerimaan proposal hibah riset tahun 2026. Jadwal penerimaan dimulai dari tanggal 1 Februari hingga 28 Februari 2026.</p><ul><li>Skema Penelitian Dasar</li><li>Skema Penelitian Terapan</li><li>Skema Pengabdian Masyarakat</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'program-kreativitas-mahasiswa'],
            [
                'title' => 'Program Kreativitas Mahasiswa (PKM)',
                'type' => 'program',
                'icon' => 'Users',
                'hero_desc' => 'Pelaksanaan Riset dan Pengabdian Kepada Masyarakat',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Program Kreativitas Mahasiswa',
                    'hero_desc' => 'Wadah bagi mahasiswa untuk mengembangkan potensi kreativitas dan inovasi.',
                    'body' => '<p>PKM adalah ajang bagi mahasiswa untuk menuangkan ide kreatif dalam bentuk karya tulis, penelitian, pengabdian, kewirausahaan, dan karsa cipta.</p>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'clinic-proposal'],
            [
                'title' => 'Clinic Proposal',
                'type' => 'service',
                'icon' => 'AlertCircle',
                'hero_desc' => 'Bimbingan Teknis Penulisan Proposal',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Clinic Proposal',
                    'hero_desc' => 'Layanan bimbingan teknis untuk meningkatkan kualitas proposal penelitian.',
                    'body' => '<p>Jadwal klinik proposal akan diadakan setiap hari Jumat pukul 09.00 WIB.</p>'
                ]
            ]
        );

        // Pages for Menu Items
        Page::updateOrCreate(
            ['slug' => 'visi-misi'],
            [
                'title' => 'Visi dan Misi LPPM UIM',
                'type' => 'page',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Visi dan Misi',
                    'hero_desc' => 'Lembaga Penelitian dan Pengabdian kepada Masyarakat Universitas Islam Madura',
                    'body' => '<h2>Visi</h2><p>Menjadi lembaga penelitian dan pengabdian kepada masyarakat yang unggul, inovatif, dan berdaya saing tinggi dalam pengembangan ilmu pengetahuan dan teknologi yang berlandaskan nilai-nilai Islam.</p><h2>Misi</h2><ul><li>Menyelenggarakan penelitian berkualitas yang berkontribusi pada pengembangan ilmu pengetahuan</li><li>Melaksanakan pengabdian kepada masyarakat yang berdampak nyata</li><li>Mengembangkan kerjasama dengan berbagai pihak untuk meningkatkan kualitas penelitian dan pengabdian</li><li>Meningkatkan publikasi ilmiah di jurnal nasional dan internasional bereputasi</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'penelitian'],
            [
                'title' => 'Program Penelitian',
                'type' => 'program',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Program Penelitian',
                    'hero_desc' => 'Mendorong penelitian berkualitas dan publikasi ilmiah',
                    'body' => '<p>LPPM UIM mengelola berbagai skema penelitian untuk dosen dan mahasiswa, termasuk penelitian dasar, penelitian terapan, dan penelitian kolaboratif.</p><h3>Skema Penelitian</h3><ul><li>Penelitian Dasar</li><li>Penelitian Terapan</li><li>Penelitian Kolaboratif</li><li>Penelitian Mahasiswa</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'pengabdian-masyarakat'],
            [
                'title' => 'Pengabdian Masyarakat',
                'type' => 'program',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Pengabdian Masyarakat',
                    'hero_desc' => 'Mengabdi untuk kemajuan masyarakat',
                    'body' => '<p>Program pengabdian kepada masyarakat sebagai implementasi Tri Dharma Perguruan Tinggi untuk memberikan kontribusi nyata kepada masyarakat.</p><h3>Bentuk Kegiatan</h3><ul><li>Penyuluhan dan Pelatihan</li><li>Pendampingan Masyarakat</li><li>Pengembangan Produk Unggulan Desa</li><li>Pemberdayaan Ekonomi Masyarakat</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'kebijakan-mutu'],
            [
                'title' => 'Kebijakan Mutu',
                'type' => 'policy',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Kebijakan Mutu LPPM',
                    'hero_desc' => 'Komitmen terhadap kualitas penelitian dan pengabdian',
                    'body' => '<p>LPPM UIM berkomitmen untuk menyelenggarakan penelitian dan pengabdian kepada masyarakat yang berkualitas tinggi dengan menerapkan standar mutu yang ketat.</p><h3>Prinsip Kebijakan Mutu</h3><ul><li>Integritas dan Etika Penelitian</li><li>Relevansi dengan Kebutuhan Masyarakat</li><li>Inovasi dan Keberlanjutan</li><li>Kolaborasi dan Kemitraan</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'panduan-penelitian'],
            [
                'title' => 'Panduan Penelitian dan Pengabdian',
                'type' => 'policy',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Panduan Penelitian dan Pengabdian',
                    'hero_desc' => 'Pedoman pelaksanaan penelitian dan pengabdian kepada masyarakat',
                    'body' => '<p>Panduan lengkap untuk pelaksanaan penelitian dan pengabdian kepada masyarakat di lingkungan Universitas Islam Madura.</p><h3>Dokumen Panduan</h3><ul><li>Pedoman Penelitian Internal</li><li>Pedoman Pengabdian Masyarakat</li><li>Template Proposal dan Laporan</li><li>Kode Etik Penelitian</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'prosedur-aturan'],
            [
                'title' => 'Prosedur dan Aturan',
                'type' => 'policy',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Prosedur dan Aturan',
                    'hero_desc' => 'Tata cara dan ketentuan penelitian dan pengabdian',
                    'body' => '<p>Prosedur dan aturan yang mengatur pelaksanaan penelitian dan pengabdian kepada masyarakat.</p><h3>Prosedur Utama</h3><ul><li>Pengajuan Proposal</li><li>Review dan Seleksi</li><li>Pelaksanaan Kegiatan</li><li>Pelaporan dan Evaluasi</li><li>Publikasi Hasil</li></ul>'
                ]
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'hubungi-kami'],
            [
                'title' => 'Hubungi Kami',
                'type' => 'page',
                'is_published' => true,
                'content' => [
                    'hero_title' => 'Hubungi Kami',
                    'hero_desc' => 'Lembaga Penelitian dan Pengabdian kepada Masyarakat UIM',
                    'body' => '<h3>Alamat</h3><p>Jl. PP. Miftahul Ulum Bettet, Pamekasan, Madura<br>Jawa Timur, Indonesia</p><h3>Kontak</h3><p>Email: lppm@uim.ac.id<br>Telepon: (0324) 322000<br>WhatsApp: 0812-3456-7890</p><h3>Jam Operasional</h3><p>Senin - Jumat: 08.00 - 16.00 WIB<br>Sabtu: 08.00 - 12.00 WIB</p>'
                ]
            ]
        );
    }
}
