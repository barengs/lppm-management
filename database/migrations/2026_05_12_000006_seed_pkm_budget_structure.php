<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Clear existing cost_group if any (optional, but requested 5 specific groups)
        // DB::table('pkm_master_data')->where('type', 'cost_group')->delete();

        // 2. Insert Groups
        $groups = [
            ['name' => 'Biaya Upah dan Jasa', 'cap' => 10, 'prefix' => 'A'],
            ['name' => 'Teknologi dan Inovasi', 'cap' => 50, 'prefix' => 'B'],
            ['name' => 'Perjalanan', 'cap' => 20, 'prefix' => 'C'],
            ['name' => 'Biaya Pelatihan', 'cap' => 15, 'prefix' => 'D'],
            ['name' => 'Biaya Lain-Lain', 'cap' => 5, 'prefix' => 'E'],
        ];

        foreach ($groups as $idx => $g) {
            $groupId = DB::table('pkm_master_data')->insertGetId([
                'type' => 'cost_group',
                'name' => $g['name'],
                'metadata' => json_encode(['cap' => $g['cap'], 'prefix' => $g['prefix']]),
                'sort_order' => $idx + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Insert Components for each group
            $components = [];
            if ($g['name'] === 'Biaya Upah dan Jasa') {
                $components = ['Honorarium Narasumber', 'Honorarium Pembantu lapangan', 'Honorarium Pembantu teknis/Asisten Pelaksanaan kegiatan', 'Honorarium Pembawa Acara', 'Honorarium Moderator', 'Honorarium Panitia'];
            } elseif ($g['name'] === 'Teknologi dan Inovasi') {
                $components = ['Bahan Baku Produksi', 'Barang komponen produksi', 'Alat Teknologi Tepat Guna'];
            } elseif ($g['name'] === 'Perjalanan') {
                $components = ['Transport Lokal', 'Tiket', 'Taksi Perjalanan Dalam Negeri', 'Uang Harian', 'Penginapan'];
            } elseif ($g['name'] === 'Biaya Pelatihan') {
                $components = ['Biaya Konsumsi', 'Uang Saku', 'Biaya Paket Ruangan dan Konsumsi'];
            } elseif ($g['name'] === 'Biaya Lain-Lain') {
                $components = ['Biaya Publikasi artikel di Jurnal Nasional', 'Biaya Publikasi artikel di Jurnal Internasional'];
            }

            foreach ($components as $cIdx => $cName) {
                DB::table('pkm_master_data')->insert([
                    'type' => 'budget_component',
                    'parent_id' => $groupId,
                    'name' => $cName,
                    'sort_order' => $cIdx + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('pkm_master_data')->whereIn('type', ['cost_group', 'budget_component'])->delete();
    }
};
