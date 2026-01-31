<?php

namespace App\Imports;

use App\Models\StudyProgram;
use App\Models\Faculty;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudyProgramsImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $faculty = Faculty::where('code', $row['faculty_code'])->first();
        
        if (!$faculty) {
            return null; // Skip if faculty code is invalid
        }

        return StudyProgram::updateOrCreate(
            ['code' => $row['code']],
            [
                'name' => $row['name'],
                'level' => $row['level'],
                'faculty_id' => $faculty->id,
            ]
        );
    }
}
