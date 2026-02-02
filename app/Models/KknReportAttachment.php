<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknReportAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_report_id',
        'file_path',
        'file_name',
        'file_type',
        'description',
    ];

    public function report()
    {
        return $this->belongsTo(KknReport::class, 'kkn_report_id');
    }
}
