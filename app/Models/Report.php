<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'proposal_id', 
        'pkm_proposal_id',
        'type', 
        'file_path', 
        'original_name',
        'status', 
        'comments'
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function pkmProposal()
    {
        return $this->belongsTo(PkmProposal::class);
    }
}
