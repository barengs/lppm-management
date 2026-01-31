<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MahasiswaProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'npm',
        'prodi',
        'ips',
        'fakultas',
        'gender',
        'place_of_birth',
        'date_of_birth',
        'address',
        'phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'fakultas');
    }

    public function studyProgram()
    {
        return $this->belongsTo(StudyProgram::class, 'prodi');
    }
}
