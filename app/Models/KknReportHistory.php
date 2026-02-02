<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KknReportHistory extends Model
{
    protected $guarded = ['id'];

    public function report()
    {
        return $this->belongsTo(KknReport::class, 'kkn_report_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
