<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithHeadings;

class StudyProgramsTemplateExport implements WithHeadings
{
    public function headings(): array
    {
        return [
            'code',
            'name',
            'level',
            'faculty_code',
        ];
    }
}
