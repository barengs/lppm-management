<?php

namespace App\Imports;

use App\Models\User;
use App\Models\DosenProfile;
use App\Models\Faculty;
use App\Models\StudyProgram;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Hash;

class UsersImport implements ToModel, WithHeadingRow
{
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
            // Resolve Faculty & Prodi Names from Codes
            $facultyName = $row['faculty_code'] ? Faculty::where('code', $row['faculty_code'])->value('name') : null;
            $prodiName = $row['prodi_code'] ? StudyProgram::where('code', $row['prodi_code'])->value('name') : null;

            DosenProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nidn' => $row['nidn'] ?? null,
                    'fakultas' => $facultyName ?? $row['faculty_code'], // Fallback to code if name not found
                    'prodi' => $prodiName ?? $row['prodi_code'],     // Fallback to code
                    'scopus_id' => $row['scopus_id'] ?? null,
                    'sinta_id' => $row['sinta_id'] ?? null,
                    'google_scholar_id' => $row['google_scholar_id'] ?? null,
                ]
            );
        }

        return $user;
    }
}
