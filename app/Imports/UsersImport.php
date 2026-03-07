<?php

namespace App\Imports;

use App\Models\User;
use App\Models\DosenProfile;
use App\Models\Faculty;
use App\Models\StudyProgram;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Facades\Hash;

class UsersImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    private $faculties;
    private $prodis;

    public function __construct()
    {
        $this->faculties = Faculty::pluck('name', 'code')->toArray();
        $this->prodis = StudyProgram::pluck('name', 'code')->toArray();
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        if (!isset($row['email'])) {
            return null;
        }

        $user = User::firstOrCreate(
            ['email' => $row['email']],
            [
                'name' => $row['name'],
                'password' => Hash::make($row['password'] ?? '12345678'),
            ]
        );

        // Assign Role
        $role = $row['role'] ?? 'dosen';
        if (!$user->hasRole($role)) {
            $user->assignRole($role);
        }

        // Handle Dosen Profile
        if (in_array($role, ['dosen', 'staff', 'admin'])) {
            // Resolve Faculty & Prodi Names from Codes using Cache
            $facultyCode = $row['faculty_code'] ?? null;
            $prodiCode = $row['prodi_code'] ?? null;
            
            $facultyName = $facultyCode && isset($this->faculties[$facultyCode]) ? $this->faculties[$facultyCode] : $facultyCode;
            $prodiName = $prodiCode && isset($this->prodis[$prodiCode]) ? $this->prodis[$prodiCode] : $prodiCode;

            DosenProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nidn' => $row['nidn'] ?? null,
                    'fakultas' => $facultyName,
                    'prodi' => $prodiName,
                    'scopus_id' => $row['scopus_id'] ?? null,
                    'sinta_id' => $row['sinta_id'] ?? null,
                    'google_scholar_id' => $row['google_scholar_id'] ?? null,
                ]
            );
        }

        return clone $user;
    }

    public function batchSize(): int
    {
        return 100;
    }
    
    public function chunkSize(): int
    {
        return 500;
    }
}
