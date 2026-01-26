<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScholarStats extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'h_index',
        'total_citations',
        'total_documents',
        'year',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
