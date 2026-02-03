<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalConsultationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_consultation_id',
        'user_id',
        'message',
        'file_path',
        'file_name',
    ];

    public function consultation()
    {
        return $this->belongsTo(JournalConsultation::class, 'journal_consultation_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
