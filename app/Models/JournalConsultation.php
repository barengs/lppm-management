<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalConsultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'abstract',
        'target_publisher',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(JournalConsultationMessage::class);
    }
}
