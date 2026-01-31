<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithHeadings;

class FacultiesTemplateExport implements WithHeadings
{
    public function headings(): array
    {
        return [
            'code',
            'name',
            'description',
        ];
    }
}
