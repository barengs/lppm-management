<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;

class EmptyPostoSheet implements FromCollection, WithTitle
{
    public function title(): string
    {
        return 'Tidak Ada Posko';
    }

    public function collection()
    {
        return collect([
            ['Tidak ada data posko ditemukan']
        ]);
    }
}
