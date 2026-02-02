<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KknGuidanceTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'kkn_posto_id',
        'user_id',
        'title',
        'status',
    ];

    public function posto()
    {
        return $this->belongsTo(KknPosto::class, 'kkn_posto_id');
    }

    public function user() // Creator
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(KknGuidanceMessage::class);
    }
}
