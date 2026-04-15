<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmPersonnel extends Model
{
    protected $table = 'pkm_personnel';

    protected $fillable = [
        'pkm_proposal_id',
        'user_id',
        'type',
        'role',
        'sinta_id',
        'institution',
        'study_program',
        'science_cluster',
        'task_description',
        'student_nim',
        'student_name',
        'student_prodi',
        'student_university',
        'is_confirmed',
    ];

    protected $casts = [
        'is_confirmed' => 'boolean',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
