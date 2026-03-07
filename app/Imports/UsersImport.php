<?php

namespace App\Imports;

use App\Models\User;
use App\Models\DosenProfile;
use App\Models\Faculty;
use App\Models\StudyProgram;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsersImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    private $faculties;
    private $prodis;

    public function __construct()
    {
        $this->faculties = Faculty::pluck('name', 'code')->toArray();
        $this->prodis = StudyProgram::pluck('name', 'code')->toArray();
    }

    public function collection(Collection $rows)
    {
        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                if (!isset($row['email'])) {
                    continue;
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
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function chunkSize(): int
    {
        return 500;
    }
}
