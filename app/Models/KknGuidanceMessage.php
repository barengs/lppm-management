<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknGuidanceMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_guidance_topic_id',
        'user_id',
        'message',
        'attachments',
    ];

    protected $casts = [
        'attachments' => 'array',
    ];

    public function topic()
    {
        return $this->belongsTo(KknGuidanceTopic::class, 'kkn_guidance_topic_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
