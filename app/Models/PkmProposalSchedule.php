<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmProposalSchedule extends Model
{
    protected $table = 'pkm_proposal_schedules';

    protected $fillable = [
        'pkm_proposal_id',
        'execution_year',
        'activity',
        'months',
    ];

    protected $casts = [
        'months' => 'array',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }
}
