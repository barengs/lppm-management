<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithHeadings;

class UsersTemplateExport implements WithHeadings
{
    public function headings(): array
    {
        return [
            'name',
            'email', 
            'role', 
            'password', 
            'nidn', 
            'faculty_code', 
            'prodi_code', 
            'scopus_id', 
            'sinta_id', 
            'google_scholar_id'
        ];
    }
}
