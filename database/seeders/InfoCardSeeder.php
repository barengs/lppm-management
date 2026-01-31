<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InfoCard;

class InfoCardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate table to avoid duplicates or old data
        InfoCard::truncate();

        $cards = [
            [
                'title' => 'INFO PENERIMAAN PROPOSAL',
                'description' => 'Grant / Hibah Riset dan Penyelenggaraan Seminar',
                'icon' => 'FileText',
                'url' => '/pages/penerimaan-proposal-2026',
                'order' => 1,
                'is_active' => true,
                'slug' => 'penerimaan-proposal-2026', // Matching Page Slug
                'content' => null, // Content moved to Page
            ],
            [
                'title' => 'INFO PKM',
                'description' => 'Pelaksanaan Riset dan Pengabdian Kepada Masyarakat',
                'icon' => 'Users',
                'url' => '/pages/program-kreativitas-mahasiswa',
                'order' => 2,
                'is_active' => true,
                'slug' => 'program-kreativitas-mahasiswa', // Matching Page Slug
                'content' => null, // Content moved to Page
            ],
            [
                'title' => 'SIM PENGABDIAN',
                'description' => 'Sistem Informasi Manajemen Pengabdian',
                'icon' => 'BookOpen',
                'url' => '/pages/sim-pengabdian', 
                'order' => 3,
                'is_active' => true,
                'slug' => 'sim-pengabdian', // Matching Page Slug
                'content' => null, // Content moved to Page
            ],
            [
                'title' => 'INFO KULIAH KERJA NYATA',
                'description' => 'Informasi pelaksanaan KKN Reguler & Tematik',
                'icon' => 'Users',
                'url' => '/kkn/register', // Functional Link
                'order' => 4,
                'is_active' => true,
                'slug' => 'kkn',
                'content' => null, // KKN Page has its own dynamic content loading
            ],
            [
                'title' => 'INFO PUBLIKASI',
                'description' => 'Jurnal Ilmiah dan Prosiding Seminar',
                'icon' => 'BookOpen',
                'url' => 'https://jurnal.uim.ac.id', // External Link
                'order' => 5,
                'is_active' => true,
                'slug' => 'info-publikasi',
                'content' => null,
            ],
            [
                'title' => 'BERKAS UNDUHAN',
                'description' => 'Template Proposal dan Panduan',
                'icon' => 'Download',
                'url' => '/documents', // Functional Link
                'order' => 6,
                'is_active' => true,
                'slug' => 'berkas-unduhan',
                'content' => null,
            ],
            [
                'title' => 'SURVEI PELAYANAN',
                'description' => 'Kepuasan Layanan LPPM UIM',
                'icon' => 'BarChart2',
                'url' => '/survey', // Functional Link
                'order' => 7,
                'is_active' => true,
                'slug' => 'survei-pelayanan',
                'content' => null,
            ],
            [
                'title' => 'CLINIC PROPOSAL',
                'description' => 'Bimbingan Teknis Penulisan Proposal',
                'icon' => 'AlertCircle',
                'url' => null, // No explicit URL, will fallback to /pages/clinic-proposal if logic updated
                'order' => 8,
                'is_active' => true,
                'slug' => 'clinic-proposal',
                'content' => null,
            ],
        ];

        foreach ($cards as $card) {
            InfoCard::create($card);
        }
    }
}
