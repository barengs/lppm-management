<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function studyPrograms()
    {
        return $this->hasMany(StudyProgram::class);
    }
}
