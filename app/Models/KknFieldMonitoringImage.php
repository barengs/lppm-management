<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknFieldMonitoringImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_field_monitoring_id',
        'file_path',
        'file_name',
    ];

    public function monitoring()
    {
        return $this->belongsTo(KknFieldMonitoring::class, 'kkn_field_monitoring_id');
    }
}
