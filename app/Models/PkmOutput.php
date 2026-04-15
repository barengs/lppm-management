<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmOutput extends Model
{
    protected $fillable = [
        'pkm_proposal_id',
        'year',
        'output_group',
        'output_type',
        'target_status',
        'notes',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }
}
