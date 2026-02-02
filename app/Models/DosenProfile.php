<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DosenProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nidn',
        'prodi',
        'fakultas',
        'scopus_id',
        'sinta_id',
        'google_scholar_id',
        'avatar',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
