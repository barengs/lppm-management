<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_period_id',
        'name',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Relationships

    public function kknPeriod()
    {
        return $this->belongsTo(KknPeriod::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOpen($query)
    {
        $now = now();
        return $query->where('is_active', true)
                     ->whereDate('start_date', '<=', $now)
                     ->whereDate('end_date', '>=', $now);
    }
}
