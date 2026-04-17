<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmDocument extends Model
{
    protected $fillable = [
        'pkm_proposal_id',
        'document_type',
        'file_path',
        'original_name',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }
}
