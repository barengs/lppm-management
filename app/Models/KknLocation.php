<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'fiscal_year_id',
        'name',
        'quota',
        'description',
        'province_id',
        'city_id',
        'district_id',
        'village_id',
        'latitude',
        'longitude',
        'location_type',
        'country',
    ];

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function registrations()
    {
        return $this->hasMany(KknRegistration::class);
    }

    public function province()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Province::class, 'province_id');
    }

    public function city()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\City::class, 'city_id');
    }

    public function district()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\District::class, 'district_id');
    }

    public function village()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Village::class, 'village_id');
    }
}
