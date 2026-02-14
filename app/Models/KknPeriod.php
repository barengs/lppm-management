<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'year',
        'start_date',
        'end_date',
        'is_active',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'year' => 'integer',
    ];

    // Relationships

    public function registrationPeriods()
    {
        return $this->hasMany(RegistrationPeriod::class);
    }

    public function kknLocations()
    {
        return $this->hasMany(KknLocation::class);
    }

    public function kknPostos()
    {
        return $this->hasMany(KknPosto::class);
    }

    public function kknRegistrations()
    {
        return $this->hasMany(KknRegistration::class);
    }

    public function documentTemplates()
    {
        return $this->hasMany(KknDocumentTemplate::class);
    }

    // scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
