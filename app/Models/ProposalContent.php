<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'abstract',
        'keywords',
        'background',
        'methodology',
        'objectives',
        'references'
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
