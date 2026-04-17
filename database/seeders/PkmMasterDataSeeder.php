<?php

namespace Database\Seeders;

use App\Models\PkmMasterData;
use Illuminate\Database\Seeder;

class PkmMasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing
        PkmMasterData::truncate();

        $data = [
            // ── Kelompok Skema ──────────────────────────────────────────
            ['type' => 'scheme_group', 'name' => 'Penelitian Dasar',                    'sort_order' => 1],
            ['type' => 'scheme_group', 'name' => 'Penelitian Terapan',                  'sort_order' => 2],
            ['type' => 'scheme_group', 'name' => 'Penelitian Pengembangan',              'sort_order' => 3],
            ['type' => 'scheme_group', 'name' => 'Pengabdian Berbasis Riset',            'sort_order' => 4],
            ['type' => 'scheme_group', 'name' => 'Pemberdayaan Berbasis Masyarakat',     'sort_order' => 5],
            ['type' => 'scheme_group', 'name' => 'Pemberdayaan Kemitraan',               'sort_order' => 6],
            ['type' => 'scheme_group', 'name' => 'Penugasan',                            'sort_order' => 7],

            // ── Ruang Lingkup ───────────────────────────────────────────
            ['type' => 'scope', 'name' => 'Pemberdayaan Kemitraan Masyarakat',           'sort_order' => 1],
            ['type' => 'scope', 'name' => 'Pemberdayaan Berbasis Masyarakat',            'sort_order' => 2],
            ['type' => 'scope', 'name' => 'Pengembangan Wilayah Terpadu',                'sort_order' => 3],
            ['type' => 'scope', 'name' => 'Hilirisasi Hasil Riset Perguruan Tinggi',     'sort_order' => 4],
            ['type' => 'scope', 'name' => 'Pengembangan Desa Mitra',                     'sort_order' => 5],

            // ── Bidang Fokus ────────────────────────────────────────────
            ['type' => 'focus_area', 'name' => 'Kesehatan',                              'sort_order' =>  1],
            ['type' => 'focus_area', 'name' => 'Pangan',                                 'sort_order' =>  2],
            ['type' => 'focus_area', 'name' => 'Energi',                                 'sort_order' =>  3],
            ['type' => 'focus_area', 'name' => 'Teknologi Informasi',                    'sort_order' =>  4],
            ['type' => 'focus_area', 'name' => 'Lingkungan',                             'sort_order' =>  5],
            ['type' => 'focus_area', 'name' => 'Sosial Humaniora',                       'sort_order' =>  6],
            ['type' => 'focus_area', 'name' => 'Pendidikan',                             'sort_order' =>  7],
            ['type' => 'focus_area', 'name' => 'Ekonomi',                                'sort_order' =>  8],
            ['type' => 'focus_area', 'name' => 'Pertanian',                              'sort_order' =>  9],
            ['type' => 'focus_area', 'name' => 'Kelautan dan Perikanan',                 'sort_order' => 10],
            ['type' => 'focus_area', 'name' => 'Industri Kreatif',                       'sort_order' => 11],
            ['type' => 'focus_area', 'name' => 'Lainnya',                                'sort_order' => 12],

            // ── Kelompok Luaran (referensi BIMA) ───────────────────────
            ['type' => 'output_group', 'name' => 'Artikel di Jurnal Internasional',                          'sort_order' =>  1],
            ['type' => 'output_group', 'name' => 'Artikel di Jurnal Nasional Terakreditasi',                 'sort_order' =>  2],
            ['type' => 'output_group', 'name' => 'Artikel di Prosiding Internasional',                       'sort_order' =>  3],
            ['type' => 'output_group', 'name' => 'Artikel di Prosiding Nasional',                            'sort_order' =>  4],
            ['type' => 'output_group', 'name' => 'Karya audio visual',                                       'sort_order' =>  5],
            ['type' => 'output_group', 'name' => 'Mitra Non Produktif Menjadi Produktif',                    'sort_order' =>  6],
            ['type' => 'output_group', 'name' => 'Peningkatan level keberdayaan mitra: Aspek Produksi',      'sort_order' =>  7],
            ['type' => 'output_group', 'name' => 'Peningkatan level keberdayaan mitra: Aspek Manajemen',     'sort_order' =>  8],
            ['type' => 'output_group', 'name' => 'Peningkatan level keberdayaan mitra: Aspek Sosial Kemasyarakatan', 'sort_order' => 9],
            ['type' => 'output_group', 'name' => 'Buku / Buku Ajar',                                        'sort_order' => 10],
            ['type' => 'output_group', 'name' => 'Hak Kekayaan Intelektual (HKI)',                           'sort_order' => 11],
            ['type' => 'output_group', 'name' => 'Teknologi Tepat Guna',                                     'sort_order' => 12],

            // ── Kelompok Biaya RAB ──────────────────────────────────────
            ['type' => 'cost_group', 'name' => 'Teknologi dan Inovasi',     'sort_order' => 1],
            ['type' => 'cost_group', 'name' => 'Biaya Upah dan Jasa',       'sort_order' => 2],
            ['type' => 'cost_group', 'name' => 'Biaya Pelatihan',           'sort_order' => 3],
            ['type' => 'cost_group', 'name' => 'Biaya Perjalanan',          'sort_order' => 4],
            ['type' => 'cost_group', 'name' => 'Bahan Habis Pakai',         'sort_order' => 5],
            ['type' => 'cost_group', 'name' => 'Sewa',                      'sort_order' => 6],
            ['type' => 'cost_group', 'name' => 'Diseminasi Hasil',          'sort_order' => 7],
            ['type' => 'cost_group', 'name' => 'Lainnya',                   'sort_order' => 8],
        ];

        foreach ($data as $row) {
            PkmMasterData::create(array_merge($row, ['is_active' => true]));
        }

        $this->command->info('PKM Master Data seeded: ' . count($data) . ' records.');
    }
}
