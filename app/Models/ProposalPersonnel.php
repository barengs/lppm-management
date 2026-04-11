<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalPersonnel extends Model
{
    use HasFactory;

    protected $table = 'proposal_personnel';

    protected $fillable = [
        'proposal_id',
        'user_id',
        'nidn_nik',
        'role',
        'is_confirmed',
        'sinta_score_3_years',
        'task_description',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
