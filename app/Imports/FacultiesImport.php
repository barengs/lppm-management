<?php

namespace App\Imports;

use App\Models\Faculty;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class FacultiesImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return Faculty::updateOrCreate(
            ['code' => $row['code']],
            [
                'name' => $row['name'],
                'description' => $row['description'] ?? null,
            ]
        );
    }
}
