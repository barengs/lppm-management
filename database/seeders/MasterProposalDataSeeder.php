<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MasterScienceCluster;
use App\Models\MasterResearchPriority;
use App\Models\MasterSelection;

class MasterProposalDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Master Selections (Simple Lists)
        $selections = [
            // Personnel Roles
            ['type' => 'personnel_role', 'key' => 'anggota', 'label' => 'Anggota Dosen', 'sort_order' => 1],
            ['type' => 'personnel_role', 'key' => 'mahasiswa', 'label' => 'Mahasiswa', 'sort_order' => 2],
            ['type' => 'personnel_role', 'key' => 'teknisi', 'label' => 'Teknisi / Laboran', 'sort_order' => 3],
            ['type' => 'personnel_role', 'key' => 'admin', 'label' => 'Staf Administrasi', 'sort_order' => 4],

            // Output Types
            ['type' => 'output_type', 'key' => 'jurnal_nasional_terakreditasi', 'label' => 'Publikasi Jurnal Nasional Terakreditasi (SINTA)', 'sort_order' => 1],
            ['type' => 'output_type', 'key' => 'jurnal_internasional_bereputasi', 'label' => 'Publikasi Jurnal Internasional Bereputasi', 'sort_order' => 2],
            ['type' => 'output_type', 'key' => 'prosiding_seminar_nasional', 'label' => 'Prosiding Seminar Nasional', 'sort_order' => 3],
            ['type' => 'output_type', 'key' => 'prosiding_seminar_internasional', 'label' => 'Prosiding Seminar Internasional', 'sort_order' => 4],
            ['type' => 'output_type', 'key' => 'buku_ber_isbn', 'label' => 'Buku Ber-ISBN', 'sort_order' => 5],
            ['type' => 'output_type', 'key' => 'hak_kekayaan_intelektual', 'label' => 'Hak Kekayaan Intelektual (Paten/Hak Cipta)', 'sort_order' => 6],
            ['type' => 'output_type', 'key' => 'produk_iptek_ttg', 'label' => 'Produk Iptek / Teknologi Tepat Guna', 'sort_order' => 7],

            // Cost Groups
            ['type' => 'cost_group', 'key' => 'honorarium', 'label' => 'Honorarium', 'sort_order' => 1],
            ['type' => 'cost_group', 'key' => 'bahan_habis_pakai', 'label' => 'Bahan Habis Pakai (Material)', 'sort_order' => 2],
            ['type' => 'cost_group', 'key' => 'pengumpulan_data', 'label' => 'Pengumpulan Data / Survei', 'sort_order' => 3],
            ['type' => 'cost_group', 'key' => 'sewa_peralatan', 'label' => 'Sewa Peralatan / Laboratorium', 'sort_order' => 4],
            ['type' => 'cost_group', 'key' => 'perjalanan_dinas', 'label' => 'Perjalanan Dinas', 'sort_order' => 5],
            ['type' => 'cost_group', 'key' => 'publikasi_seminar', 'label' => 'Biaya Publikasi & Seminar', 'sort_order' => 6],

            // Institution Clusters (Klaster PT)
            ['type' => 'institution_cluster', 'key' => 'mandiri', 'label' => 'Klaster Mandiri', 'sort_order' => 1],
            ['type' => 'institution_cluster', 'key' => 'utama', 'label' => 'Klaster Utama', 'sort_order' => 2],
            ['type' => 'institution_cluster', 'key' => 'madya', 'label' => 'Klaster Madya', 'sort_order' => 3],
            ['type' => 'institution_cluster', 'key' => 'binaan', 'label' => 'Klaster Binaan', 'sort_order' => 4],

            // RAB Units
            ['type' => 'rab_unit', 'key' => 'org_bln', 'label' => 'Org/Bln', 'sort_order' => 1],
            ['type' => 'rab_unit', 'key' => 'org_kali', 'label' => 'Org/Kali', 'sort_order' => 2],
            ['type' => 'rab_unit', 'key' => 'paket', 'label' => 'Paket', 'sort_order' => 3],
            ['type' => 'rab_unit', 'key' => 'unit', 'label' => 'Unit', 'sort_order' => 4],
            ['type' => 'rab_unit', 'key' => 'eksamplar', 'label' => 'Eksamplar', 'sort_order' => 5],
            ['type' => 'rab_unit', 'key' => 'rim', 'label' => 'Rim', 'sort_order' => 6],
            ['type' => 'rab_unit', 'key' => 'jam', 'label' => 'Jam', 'sort_order' => 7],
            ['type' => 'rab_unit', 'key' => 'hari', 'label' => 'Hari', 'sort_order' => 8],

            // SDG Goals
            ['type' => 'sdg_goal', 'key' => 'sdg_1', 'label' => 'SDG 1: Tanpa Kemiskinan', 'sort_order' => 1],
            ['type' => 'sdg_goal', 'key' => 'sdg_2', 'label' => 'SDG 2: Tanpa Kelaparan', 'sort_order' => 2],
            ['type' => 'sdg_goal', 'key' => 'sdg_3', 'label' => 'SDG 3: Kehidupan Sehat dan Sejahtera', 'sort_order' => 3],
            ['type' => 'sdg_goal', 'key' => 'sdg_4', 'label' => 'SDG 4: Pendidikan Berkualitas', 'sort_order' => 4],
            ['type' => 'sdg_goal', 'key' => 'sdg_5', 'label' => 'SDG 5: Kesetaraan Gender', 'sort_order' => 5],
            ['type' => 'sdg_goal', 'key' => 'sdg_6', 'label' => 'SDG 6: Air Bersih dan Sanitasi Layak', 'sort_order' => 6],
            ['type' => 'sdg_goal', 'key' => 'sdg_7', 'label' => 'SDG 7: Energi Bersih dan Terjangkau', 'sort_order' => 7],
            ['type' => 'sdg_goal', 'key' => 'sdg_8', 'label' => 'SDG 8: Pekerjaan Layak dan Pertumbuhan Ekonomi', 'sort_order' => 8],
            ['type' => 'sdg_goal', 'key' => 'sdg_9', 'label' => 'SDG 9: Industri, Inovasi dan Infrastruktur', 'sort_order' => 9],

            // Document Types
            ['type' => 'document_type', 'key' => 'proposal_substansi', 'label' => 'Proposal Substansi', 'sort_order' => 1],
            ['type' => 'document_type', 'key' => 'surat_pernyataan_ketua', 'label' => 'Surat Pernyataan Ketua Pengusul', 'sort_order' => 2],
            ['type' => 'document_type', 'key' => 'cv_mitra', 'label' => 'CV Mitra (Jika Ada)', 'sort_order' => 3],
        ];

        foreach ($selections as $sel) {
            MasterSelection::updateOrCreate(
                ['type' => $sel['type'], 'key' => $sel['key']],
                ['label' => $sel['label'], 'sort_order' => $sel['sort_order']]
            );
        }

        // 2. Science Clusters (Hierarchical)
        $it = MasterScienceCluster::firstOrCreate(['name' => 'Matematika dan Ilmu Pengetahuan Alam', 'level' => 1]);
        $comp = MasterScienceCluster::firstOrCreate(['name' => 'Ilmu Komputer dan Informatika', 'level' => 2, 'parent_id' => $it->id]);
        MasterScienceCluster::firstOrCreate(['name' => 'Kecerdasan Buatan', 'level' => 3, 'parent_id' => $comp->id]);
        MasterScienceCluster::firstOrCreate(['name' => 'Rekayasa Perangkat Lunak', 'level' => 3, 'parent_id' => $comp->id]);
        MasterScienceCluster::firstOrCreate(['name' => 'Keamanan Jaringan', 'level' => 3, 'parent_id' => $comp->id]);

        $health = MasterScienceCluster::firstOrCreate(['name' => 'Kesehatan', 'level' => 1]);
        $med = MasterScienceCluster::firstOrCreate(['name' => 'Kedokteran', 'level' => 2, 'parent_id' => $health->id]);
        MasterScienceCluster::firstOrCreate(['name' => 'Kedokteran Gigi', 'level' => 3, 'parent_id' => $med->id]);

        // 3. Research Priorities (Hierarchical)
        $focusTIK = MasterResearchPriority::firstOrCreate(['name' => 'Teknologi Informasi dan Komunikasi', 'type' => 'focus_area']);
        $themeAI = MasterResearchPriority::firstOrCreate(['name' => 'Artificial Intelligence & Big Data', 'type' => 'theme', 'parent_id' => $focusTIK->id]);
        MasterResearchPriority::firstOrCreate(['name' => 'Deep Learning for Medical Imaging', 'type' => 'topic', 'parent_id' => $themeAI->id]);
        MasterResearchPriority::firstOrCreate(['name' => 'Predictive Analytics for Logistics', 'type' => 'topic', 'parent_id' => $themeAI->id]);

        $focusHealth = MasterResearchPriority::firstOrCreate(['name' => 'Kesehatan dan Obat', 'type' => 'focus_area']);
        $themeDrug = MasterResearchPriority::firstOrCreate(['name' => 'Pengembangan Vaksin Nasional', 'type' => 'theme', 'parent_id' => $focusHealth->id]);
        MasterResearchPriority::firstOrCreate(['name' => 'Vaksin Generasi Baru mRNA', 'type' => 'topic', 'parent_id' => $themeDrug->id]);
    }
}
