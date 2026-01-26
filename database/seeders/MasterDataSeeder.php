<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Fiscal Years
        DB::table('fiscal_years')->insert([
            ['year' => 2024, 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ['year' => 2025, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['year' => 2026, 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Schemes
        DB::table('schemes')->insert([
            [
                'name' => 'Penelitian Dosen Pemula',
                'type' => 'research',
                'max_budget' => 20000000, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'name' => 'Penelitian Dasar', 
                'type' => 'research', 
                'max_budget' => 50000000, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'name' => 'Pengabdian Masyarakat (PKM)', 
                'type' => 'abmas', 
                'max_budget' => 15000000, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'name' => 'KKN Reguler', 
                'type' => 'kkn', 
                'max_budget' => 0, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
        ]);
    }
}
