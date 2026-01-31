<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Clear existing data
        OrganizationMember::truncate();

        // Create or find users for organization members
        $ketuaUser = User::firstOrCreate(
            ['email' => 'ketua.lppm@uim.ac.id'],
            [
                'name' => 'Dr. Ahmad Fauzi, M.Si.',
                'password' => Hash::make('password'),
            ]
        );

        $sekretarisUser = User::firstOrCreate(
            ['email' => 'sekretaris.lppm@uim.ac.id'],
            [
                'name' => 'Dr. Siti Aminah, M.Pd.',
                'password' => Hash::make('password'),
            ]
        );

        $bendaharaUser = User::firstOrCreate(
            ['email' => 'bendahara.lppm@uim.ac.id'],
            [
                'name' => 'Ir. Budi Santoso, M.T.',
                'password' => Hash::make('password'),
            ]
        );

        $kepalaPenelitianUser = User::firstOrCreate(
            ['email' => 'p2m@uim.ac.id'],
            [
                'name' => 'Dr. Muhammad Rizki, M.Kom.',
                'password' => Hash::make('password'),
            ]
        );

        $kepalaPengabdianUser = User::firstOrCreate(
            ['email' => 'pengabdian@uim.ac.id'],
            [
                'name' => 'Dr. Fatimah Zahra, M.Sos.',
                'password' => Hash::make('password'),
            ]
        );

        $kepalaPublikasiUser = User::firstOrCreate(
            ['email' => 'publikasi@uim.ac.id'],
            [
                'name' => 'Dr. Hasan Basri, M.Hum.',
                'password' => Hash::make('password'),
            ]
        );

        // Staff users
        $staff1User = User::firstOrCreate(
            ['email' => 'andi.wijaya@uim.ac.id'],
            [
                'name' => 'Andi Wijaya, S.Kom.',
                'password' => Hash::make('password'),
            ]
        );

        $staff2User = User::firstOrCreate(
            ['email' => 'dewi.lestari@uim.ac.id'],
            [
                'name' => 'Dewi Lestari, S.T.',
                'password' => Hash::make('password'),
            ]
        );

        $staff3User = User::firstOrCreate(
            ['email' => 'rudi.hartono@uim.ac.id'],
            [
                'name' => 'Rudi Hartono, S.Sos.',
                'password' => Hash::make('password'),
            ]
        );

        $staff4User = User::firstOrCreate(
            ['email' => 'sari.indah@uim.ac.id'],
            [
                'name' => 'Sari Indah, S.Pd.',
                'password' => Hash::make('password'),
            ]
        );

        $staff5User = User::firstOrCreate(
            ['email' => 'yusuf.rahman@uim.ac.id'],
            [
                'name' => 'Yusuf Rahman, S.S.',
                'password' => Hash::make('password'),
            ]
        );

        $staff6User = User::firstOrCreate(
            ['email' => 'nur.azizah@uim.ac.id'],
            [
                'name' => 'Nur Azizah, S.I.Kom.',
                'password' => Hash::make('password'),
            ]
        );

        // Assign roles (assuming dosen and staff roles exist)
        $ketuaUser->assignRole('dosen');
        $sekretarisUser->assignRole('dosen');
        $bendaharaUser->assignRole('dosen');
        $kepalaPenelitianUser->assignRole('dosen');
        $kepalaPengabdianUser->assignRole('dosen');
        $kepalaPublikasiUser->assignRole('dosen');
        
        $staff1User->assignRole('dosen');
        $staff2User->assignRole('dosen');
        $staff3User->assignRole('dosen');
        $staff4User->assignRole('dosen');
        $staff5User->assignRole('dosen');
        $staff6User->assignRole('dosen');

        // Level 1: Ketua LPPM
        $ketua = OrganizationMember::create([
            'user_id' => $ketuaUser->id,
            'parent_id' => null,
            'position' => 'Ketua LPPM',
            'level' => 1,
            'order_index' => 1,
        ]);

        // Level 2: Sekretaris & Bendahara
        $sekretaris = OrganizationMember::create([
            'user_id' => $sekretarisUser->id,
            'parent_id' => $ketua->id,
            'position' => 'Sekretaris LPPM',
            'level' => 2,
            'order_index' => 1,
        ]);

        $bendahara = OrganizationMember::create([
            'user_id' => $bendaharaUser->id,
            'parent_id' => $ketua->id,
            'position' => 'Bendahara LPPM',
            'level' => 2,
            'order_index' => 2,
        ]);

        // Level 2: Kepala Divisi P2M
        $kepalaPenelitian = OrganizationMember::create([
            'user_id' => $kepalaPenelitianUser->id,
            'parent_id' => $ketua->id,
            'position' => 'Kepala Divisi Penelitian & Pengabdian Masyarakat',
            'level' => 2,
            'order_index' => 3,
        ]);

        // Level 3: Staff P2M
        OrganizationMember::create([
            'user_id' => $staff1User->id,
            'parent_id' => $kepalaPenelitian->id,
            'position' => 'Staff Penelitian',
            'level' => 3,
            'order_index' => 1,
        ]);

        OrganizationMember::create([
            'user_id' => $staff2User->id,
            'parent_id' => $kepalaPenelitian->id,
            'position' => 'Staff Penelitian',
            'level' => 3,
            'order_index' => 2,
        ]);

        // Level 2: Kepala Divisi Pengabdian
        $kepalaPengabdian = OrganizationMember::create([
            'user_id' => $kepalaPengabdianUser->id,
            'parent_id' => $ketua->id,
            'position' => 'Kepala Divisi Pengabdian Masyarakat',
            'level' => 2,
            'order_index' => 4,
        ]);

        // Level 3: Staff Pengabdian
        OrganizationMember::create([
            'user_id' => $staff3User->id,
            'parent_id' => $kepalaPengabdian->id,
            'position' => 'Staff Pengabdian Masyarakat',
            'level' => 3,
            'order_index' => 1,
        ]);

        OrganizationMember::create([
            'user_id' => $staff4User->id,
            'parent_id' => $kepalaPengabdian->id,
            'position' => 'Staff Pengabdian Masyarakat',
            'level' => 3,
            'order_index' => 2,
        ]);

        // Level 2: Kepala Divisi Publikasi
        $kepalaPublikasi = OrganizationMember::create([
            'user_id' => $kepalaPublikasiUser->id,
            'parent_id' => $ketua->id,
            'position' => 'Kepala Divisi Publikasi & Jurnal',
            'level' => 2,
            'order_index' => 5,
        ]);

        // Level 3: Staff Publikasi
        OrganizationMember::create([
            'user_id' => $staff5User->id,
            'parent_id' => $kepalaPublikasi->id,
            'position' => 'Staff Publikasi & Jurnal',
            'level' => 3,
            'order_index' => 1,
        ]);

        OrganizationMember::create([
            'user_id' => $staff6User->id,
            'parent_id' => $kepalaPublikasi->id,
            'position' => 'Staff Publikasi & Jurnal',
            'level' => 3,
            'order_index' => 2,
        ]);

        $this->command->info('Organization structure seeded successfully with user relations!');
    }
}
