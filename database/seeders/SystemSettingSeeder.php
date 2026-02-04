<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\SystemSetting::firstOrCreate(
            ['id' => 1],
            [
                'system_name' => 'LPPM UIM',
                'description' => 'Lembaga Penelitian dan Pengabdian kepada Masyarakat Universitas Islam Madura',
                'address' => 'Jl. PP. Miftahul Ulum Bettet Pamekasan',
                'email' => 'lppm@uim.ac.id',
                'phone' => '081234567890',
            ]
        );
    }
}
