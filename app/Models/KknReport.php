<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_posto_id',
        'user_id',
        'type',
        'reporter_type',
        'week',
        'title',
        'description',
        'status',
        'submitted_at',
        'notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function posto()
    {
        return $this->belongsTo(KknPosto::class, 'kkn_posto_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attachments()
    {
        return $this->hasMany(KknReportAttachment::class);
    }

    public function histories()
    {
        return $this->hasMany(KknReportHistory::class)->latest();
    }
}
