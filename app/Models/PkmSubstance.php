<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmSubstance extends Model
{
    protected $fillable = [
        'pkm_proposal_id',
        'sdg_goals',
        'strategic_fields',
    ];

    protected $casts = [
        'sdg_goals'        => 'array',
        'strategic_fields' => 'array',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }
}
