<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'kkn_location_id',
        'fiscal_year_id',
        'dpl_id',
        'status',
        'notes',
        'documents',
        'validation_notes',
    ];

    protected $casts = [
        'documents' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function location()
    {
        return $this->belongsTo(KknLocation::class, 'kkn_location_id');
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function dpl()
    {
        return $this->belongsTo(User::class, 'dpl_id');
    }

    public function logs()
    {
        return $this->hasMany(KknRegistrationLog::class, 'registration_id')->orderBy('created_at', 'desc');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
