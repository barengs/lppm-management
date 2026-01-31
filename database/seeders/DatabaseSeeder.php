<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Laravolt\Indonesia\Seeds\CitiesSeeder;
use Laravolt\Indonesia\Seeds\DistrictsSeeder;
use Laravolt\Indonesia\Seeds\ProvincesSeeder;
use Laravolt\Indonesia\Seeds\VillagesSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // 1. Super Admin
        $admin = User::create([
            'name' => 'Administrator LPPM',
            'email' => 'admin@uim.ac.id',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('admin');

        // 2. Dosen (Researcher)
        $dosen = User::create([
            'name' => 'Dr. Ahmad Fauzi, M.Kom',
            'email' => 'dosen@uim.ac.id',
            'password' => Hash::make('password'),
        ]);
        $dosen->assignRole('dosen');
        $dosen->dosenProfile()->create([
            'nidn' => '0701018901',
            'prodi' => 'Teknik Informatika',
            'fakultas' => 'Teknik',
        ]);

        // 3. Reviewer
        $reviewer = User::create([
            'name' => 'Prof. Dr. Budi Santoso',
            'email' => 'reviewer@uim.ac.id',
            'password' => Hash::make('password'),
        ]);
        $reviewer->assignRole('reviewer');
        $reviewer->dosenProfile()->create([
            'nidn' => '0702027501',
            'prodi' => 'Pertanian',
            'fakultas' => 'Pertanian',
        ]);

        // 4. Mahasiswa (KKN Participant)
        $mahasiswa = User::create([
            'name' => 'Siti Aminah',
            'email' => 'mahasiswa@uim.ac.id',
            'password' => Hash::make('password'),
        ]);
        $mahasiswa->assignRole('mahasiswa');
        $mahasiswa->mahasiswaProfile()->create([
            'npm' => '2023001001',
            'prodi' => 'Hukum',
            'fakultas' => 'Hukum',
        ]);
        $mahasiswa->assignRole('mahasiswa');

        // Seed Faculties and Study Programs
        $this->call(FacultyStudyProgramSeeder::class);
        $this->call(MasterDataSeeder::class);
        $this->call(LandingPageSeeder::class);
        $this->call(InfoCardSeeder::class);
        $this->call(MenuSeeder::class);
        $this->call([
            ProvincesSeeder::class,
            CitiesSeeder::class,
            DistrictsSeeder::class,
            VillagesSeeder::class,
            PageSeeder::class
        ]);
    }
}
