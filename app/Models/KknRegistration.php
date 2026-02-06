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

    // protected $casts = [
    //     'documents' => 'array',
    // ];

    public function kknRegistrationDocuments()
    {
        return $this->hasMany(KknRegistrationDocument::class, 'kkn_registration_id');
    }

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

    protected $appends = ['documents'];

    public function getDocumentsAttribute()
    {
        $docs = $this->kknRegistrationDocuments;
        $mapped = [];

        foreach ($docs as $doc) {
            $key = $doc->doc_type;
            
            // Map legacy/indonesian keys to frontend expected keys
            switch ($key) {
                case 'transkrip':
                    $key = 'transcript';
                    break;
                case 'sehat':
                    $key = 'health';
                    break;
                case 'required_photo':
                    $key = 'photo';
                    break;
                case 'krs':
                    $key = 'krs';
                    break;
            }
            
            $mapped[$key] = $doc;
        }

        return (object) $mapped;
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
