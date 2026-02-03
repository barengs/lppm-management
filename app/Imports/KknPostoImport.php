<?php

namespace App\Imports;

use App\Models\KknPosto;
use App\Models\KknLocation;
use App\Models\FiscalYear;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Str;

class KknPostoImport implements ToModel, WithHeadingRow
{
    private $activeFiscalYearId;

    public function __construct()
    {
        // Get active fiscal year ID once to use as default
        $activeYear = FiscalYear::where('is_active', true)->first();
        $this->activeFiscalYearId = $activeYear ? $activeYear->id : null;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Require Name
        if (empty($row['nama_posko'])) {
            return null;
        }

        // Find Location ID
        $locationId = null;
        if (!empty($row['lokasi_id'])) {
            $locationId = $row['lokasi_id'];
        } elseif (!empty($row['nama_lokasi'])) {
            // Try to find by name loose matching
            $location = KknLocation::where('name', 'LIKE', '%' . $row['nama_lokasi'] . '%')->first();
            $locationId = $location ? $location->id : null;
        }

        // Determine Fiscal Year
        $fiscalYearId = $this->activeFiscalYearId;
        if (!empty($row['tahun_ajaran'])) {
             $year = FiscalYear::where('year', $row['tahun_ajaran'])->first();
             if ($year) {
                 $fiscalYearId = $year->id;
             }
        }

        return KknPosto::updateOrCreate(
            [
                'name' => $row['nama_posko'],
                'fiscal_year_id' => $fiscalYearId,
            ],
            [
                'kkn_location_id' => $locationId,
                'description' => $row['deskripsi'] ?? null,
                'male_capacity' => $row['kapasitas_laki'] ?? 0, // Assuming model has these fields or we ignore if not
                'female_capacity' => $row['kapasitas_perempuan'] ?? 0,
                'status' => 'draft', // Default status
                // Dates could be parsed if added to template, for now keep null or default
            ]
        );
    }
}
