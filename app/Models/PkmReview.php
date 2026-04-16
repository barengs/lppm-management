<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PkmReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'pkm_proposal_id',
        'reviewer_id',
        'score',
        'comment',
        'decision',
    ];

    public function pkmProposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
