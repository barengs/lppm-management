<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknFieldMonitoring extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_posto_id',
        'user_id',
        'description',
        'latitude',
        'longitude',
        'monitored_at',
        'status',
    ];

    protected $casts = [
        'monitored_at' => 'datetime',
    ];

    public function posto()
    {
        return $this->belongsTo(KknPosto::class, 'kkn_posto_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(KknFieldMonitoringImage::class);
    }
}
