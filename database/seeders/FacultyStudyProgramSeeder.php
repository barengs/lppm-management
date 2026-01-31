<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faculty;
use App\Models\StudyProgram;

class FacultyStudyProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        StudyProgram::truncate();
        Faculty::truncate();

        // Fakultas Agama Islam
        $fai = Faculty::create([
            'code' => 'FAI',
            'name' => 'Fakultas Agama Islam',
            'description' => 'Fakultas yang menyelenggarakan pendidikan di bidang ilmu-ilmu keislaman',
        ]);

        StudyProgram::create([
            'faculty_id' => $fai->id,
            'code' => 'PAI',
            'name' => 'Pendidikan Agama Islam',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $fai->id,
            'code' => 'HES',
            'name' => 'Hukum Ekonomi Syariah',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $fai->id,
            'code' => 'MPI',
            'name' => 'Manajemen Pendidikan Islam',
            'level' => 'S1',
        ]);

        // Fakultas Ekonomi dan Bisnis
        $feb = Faculty::create([
            'code' => 'FEB',
            'name' => 'Fakultas Ekonomi dan Bisnis',
            'description' => 'Fakultas yang menyelenggarakan pendidikan di bidang ekonomi dan bisnis',
        ]);

        StudyProgram::create([
            'faculty_id' => $feb->id,
            'code' => 'MNJ',
            'name' => 'Manajemen',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $feb->id,
            'code' => 'AKT',
            'name' => 'Akuntansi',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $feb->id,
            'code' => 'ESP',
            'name' => 'Ekonomi Syariah',
            'level' => 'S1',
        ]);

        // Fakultas Teknik
        $ft = Faculty::create([
            'code' => 'FT',
            'name' => 'Fakultas Teknik',
            'description' => 'Fakultas yang menyelenggarakan pendidikan di bidang teknik dan teknologi',
        ]);

        StudyProgram::create([
            'faculty_id' => $ft->id,
            'code' => 'TI',
            'name' => 'Teknik Informatika',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $ft->id,
            'code' => 'SI',
            'name' => 'Sistem Informasi',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $ft->id,
            'code' => 'TS',
            'name' => 'Teknik Sipil',
            'level' => 'S1',
        ]);

        // Fakultas Keguruan dan Ilmu Pendidikan
        $fkip = Faculty::create([
            'code' => 'FKIP',
            'name' => 'Fakultas Keguruan dan Ilmu Pendidikan',
            'description' => 'Fakultas yang mencetak tenaga pendidik profesional',
        ]);

        StudyProgram::create([
            'faculty_id' => $fkip->id,
            'code' => 'PGSD',
            'name' => 'Pendidikan Guru Sekolah Dasar',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $fkip->id,
            'code' => 'PAUD',
            'name' => 'Pendidikan Anak Usia Dini',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $fkip->id,
            'code' => 'PBING',
            'name' => 'Pendidikan Bahasa Inggris',
            'level' => 'S1',
        ]);

        // Fakultas Pertanian
        $fp = Faculty::create([
            'code' => 'FP',
            'name' => 'Fakultas Pertanian',
            'description' => 'Fakultas yang menyelenggarakan pendidikan di bidang pertanian dan agribisnis',
        ]);

        StudyProgram::create([
            'faculty_id' => $fp->id,
            'code' => 'AGR',
            'name' => 'Agroteknologi',
            'level' => 'S1',
        ]);

        StudyProgram::create([
            'faculty_id' => $fp->id,
            'code' => 'AGB',
            'name' => 'Agribisnis',
            'level' => 'S1',
        ]);

        $this->command->info('Faculty and Study Program data seeded successfully!');
        $this->command->info('Total Faculties: ' . Faculty::count());
        $this->command->info('Total Study Programs: ' . StudyProgram::count());
    }
}
