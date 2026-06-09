<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\FiscalYear;
use App\Models\KknPeriod;
use App\Models\KknLocation;
use App\Models\KknPosto;
use App\Models\KknPostoMember;
use App\Models\KknRegistration;
use Illuminate\Support\Facades\Hash;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Village;

class KknTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get Active Fiscal Year
        $fiscalYear = FiscalYear::where('is_active', true)->first();
        if (!$fiscalYear) {
            $fiscalYear = FiscalYear::create([
                'year' => 2026,
                'is_active' => true,
            ]);
        }

        // 2. Create KKN Period
        $period = KknPeriod::create([
            'name' => 'KKN Reguler Angkatan XLII',
            'year' => 2026,
            'start_date' => '2026-07-01',
            'end_date' => '2026-08-15',
            'is_active' => true,
            'description' => 'Periode KKN Reguler Semester Antara Tahun Akademik 2026',
        ]);

        // 3. Create geographic location
        $province = Province::first();
        $city = $province ? City::where('province_code', $province->code)->first() : null;
        $district = $city ? District::where('city_code', $city->code)->first() : null;
        $village = $district ? Village::where('district_code', $district->code)->first() : null;

        $location = KknLocation::create([
            'fiscal_year_id' => $fiscalYear->id,
            'name' => 'Desa Sukamaju',
            'quota' => 20,
            'description' => 'Kecamatan Sukasari, Kabupaten Sukadamai',
            'province_id' => $province?->id,
            'city_id' => $city?->id,
            'district_id' => $district?->id,
            'village_id' => $village?->id,
            'latitude' => '-7.1568',
            'longitude' => '113.4746',
            'location_type' => 'domestic',
        ]);

        // 4. Create 1 Dosen (DPL)
        $dplUser = User::create([
            'name' => 'Dr. H. Mulyono, M.Pd.',
            'email' => 'dpl.kkn@umi.ac.id',
            'password' => Hash::make('password'),
        ]);
        $dplUser->assignRole('dosen');
        $dplUser->assignRole('dpl_kkn');
        $dplUser->dosenProfile()->create([
            'nidn' => '0701019002',
            'prodi' => 'Pendidikan Bahasa Indonesia',
            'fakultas' => 'Keguruan dan Ilmu Pendidikan',
        ]);

        // 5. Create 1 LPPM Staff
        $staffUser = User::create([
            'name' => 'Rahmat Hidayat (LPPM Staff)',
            'email' => 'staffkkn@umi.ac.id',
            'password' => Hash::make('password'),
        ]);
        $staffUser->assignRole('staff_kkn');

        // 6. Create KKN Posko (Posto)
        $posto = KknPosto::create([
            'name' => 'Posko Desa Sukamaju 1',
            'kkn_location_id' => $location->id,
            'kkn_period_id' => $period->id,
            'fiscal_year_id' => $fiscalYear->id,
            'dpl_id' => $dplUser->id,
            'status' => 'draft', // DPL will change this status in tests
            'description' => 'Posko KKN Sukamaju 1 untuk mahasiswa lintas fakultas',
        ]);

        // 7. Create 10 Students (Mahasiswa)
        $positions = ['kordes', 'sekretaris', 'bendahara', 'humas', 'publikasi', 'anggota', 'anggota', 'anggota', 'anggota', 'anggota'];
        
        for ($i = 1; $i <= 10; $i++) {
            $student = User::create([
                'name' => "Mahasiswa KKN {$i}",
                'email' => "mhs{$i}@umi.ac.id",
                'password' => Hash::make('password'),
            ]);
            $student->assignRole('mahasiswa');
            
            // Create student profile
            $npm = '2023002' . str_pad($i, 3, '0', STR_PAD_LEFT);
            $student->mahasiswaProfile()->create([
                'npm' => $npm,
                'prodi' => 'Teknik Informatika',
                'fakultas' => 'Teknik',
                'phone' => '0812345678' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'address' => "Alamat Mahasiswa {$i}",
                'gender' => ($i % 2 == 0) ? 'P' : 'L',
                'place_of_birth' => 'Surabaya',
                'date_of_birth' => '2003-01-01',
                'jacket_size' => 'L',
            ]);

            // Create approved registration
            $registration = KknRegistration::create([
                'student_id' => $student->id,
                'kkn_location_id' => $location->id,
                'fiscal_year_id' => $fiscalYear->id,
                'kkn_period_id' => $period->id,
                'registration_type' => 'reguler',
                'dpl_id' => $dplUser->id,
                'status' => 'approved',
                'current_step' => 4,
                'kkn_posto_id' => $posto->id,
            ]);

            // Assign to Posko (Posto)
            KknPostoMember::create([
                'kkn_posto_id' => $posto->id,
                'student_id' => $student->id,
                'kkn_registration_id' => $registration->id,
                'position' => $positions[$i - 1],
                'joined_at' => now(),
                'status' => 'active',
            ]);
        }
    }
}
