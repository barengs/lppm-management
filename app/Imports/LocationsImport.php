<?php

namespace App\Imports;

use App\Models\KknLocation;
use App\Models\FiscalYear;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;

class LocationsImport implements ToCollection, WithHeadingRow
{
    protected $fiscalYearId;

    public function __construct($fiscalYearId)
    {
        $this->fiscalYearId = $fiscalYearId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Find Province ID by Name
            $province = Province::where('name', 'LIKE', '%' . $row['province'] . '%')->first();
            $provinceId = $province ? $province->id : null;

            // Find City ID by Name (and Province Code if available for accuracy)
            $cityQuery = City::where('name', 'LIKE', '%' . $row['city'] . '%');
            if ($province) {
                $cityQuery->where('province_code', $province->code);
            }
            $city = $cityQuery->first();
            $cityId = $city ? $city->id : null;

            // Find District ID by Name
            $districtQuery = District::where('name', 'LIKE', '%' . $row['district'] . '%');
            if ($city) {
                $districtQuery->where('city_code', $city->code);
            }
            $district = $districtQuery->first();
            $districtId = $district ? $district->id : null;

            KknLocation::updateOrCreate(
                [
                    'name' => $row['name'],
                    'fiscal_year_id' => $this->fiscalYearId
                ],
                [
                    'quota' => $row['quota'],
                    'description' => $row['description'],
                    'province_id' => $provinceId,
                    'city_id' => $cityId,
                    'district_id' => $districtId,
                    'latitude' => $row['latitude'] ?? null,
                    'longitude' => $row['longitude'] ?? null,
                ]
            );
        }
    }
}
