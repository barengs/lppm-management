<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknRegistrationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_registration_id',
        'name',
        'file_path',
        'file_type',
        'doc_type', // 'required', 'optional', 'custom'
    ];

    public function registration()
    {
        return $this->belongsTo(KknRegistration::class, 'kkn_registration_id');
    }
}
