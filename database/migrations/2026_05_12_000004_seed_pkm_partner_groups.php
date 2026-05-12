<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $groups = [
            [
                'type' => 'partner_group',
                'name' => 'Kelompok masyarakat yang tidak produktif secara ekonomi',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'partner_group',
                'name' => 'Kelompok masyarakat yang produktif secara ekonomi',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('pkm_master_data')->insert($groups);
    }

    public function down(): void
    {
        DB::table('pkm_master_data')->where('type', 'partner_group')->delete();
    }
};
