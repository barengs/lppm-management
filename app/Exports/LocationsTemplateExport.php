<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithHeadings;

class LocationsTemplateExport implements WithHeadings
{
    public function headings(): array
    {
        return [
            'name',
            'quota',
            'description',
            'province', // Text name, will be looked up
            'city', // Text name, will be looked up
            'district', // Text name, will be looked up
            'latitude',
            'longitude',
        ];
    }
}
