<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\KknRegistration;
use App\Models\User;

class KknRegistrationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id',
        'created_by',
        'action',
        'old_status',
        'new_status',
        'note',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function registration()
    {
        return $this->belongsTo(KknRegistration::class, 'registration_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
