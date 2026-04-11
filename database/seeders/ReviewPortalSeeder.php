<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MasterReviewCriteria;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class ReviewPortalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Test Users
        $admin = User::updateOrCreate(
            ['email' => 'admin_lppm@admin.com'],
            [
                'name' => 'Admin LPPM Unitomo',
                'password' => Hash::make('password'),
                'role' => 'admin'
            ]
        );
        $admin->assignRole('admin');

        $rev1 = User::updateOrCreate(
            ['email' => 'reviewer_a@reviewer.com'],
            [
                'name' => 'Dr. Reviewer Handal, M.T.',
                'password' => Hash::make('password'),
                'role' => 'reviewer'
            ]
        );
        $rev1->assignRole('reviewer');

        // 2. Default Review Criteria (Standard research)
        $criteria = [
            [
                'criteria_name' => 'Rekam Jejak Pengusul', 
                'weight' => 20, 
                'type' => 'research',
                'description' => 'Kualitas publikasi, H-index, dan relevansi kepakaran tim pengusul.'
            ],
            [
                'criteria_name' => 'Urgensi & Perumusan Masalah', 
                'weight' => 25, 
                'type' => 'research',
                'description' => 'Ketajaman masalah, kemutakhiran pustaka, dan orisinalitas ide.'
            ],
            [
                'criteria_name' => 'Metodologi & Kesesuaian TKT', 
                'weight' => 30, 
                'type' => 'research',
                'description' => 'Ketepatan metode penelitian dan kesesuaian target tingkat kesiapterapan teknologi.'
            ],
            [
                'criteria_name' => 'Luaran & Dampak', 
                'weight' => 25, 
                'type' => 'research',
                'description' => 'Potensi publikasi jurnal bereputasi, HAKI, atau dampak sosial ekonomi.'
            ],
        ];

        foreach ($criteria as $index => $c) {
            MasterReviewCriteria::updateOrCreate(
                ['criteria_name' => $c['criteria_name'], 'type' => $c['type']],
                ['weight' => $c['weight'], 'description' => $c['description'], 'sort_order' => $index + 1]
            );
        }
    }
}
