<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalIdentity extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'duration_years',
        'science_cluster_level_3',
        'focus_area',
        'research_theme',
        'research_topic',
        'tkt_initial',
        'tkt_target',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
