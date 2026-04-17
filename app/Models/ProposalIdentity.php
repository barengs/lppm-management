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
        'sdg_goal',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function focusArea()
    {
        return $this->belongsTo(MasterResearchPriority::class, 'focus_area');
    }

    public function researchTopic()
    {
        return $this->belongsTo(MasterResearchPriority::class, 'research_topic');
    }

    public function researchTheme()
    {
        return $this->belongsTo(MasterResearchPriority::class, 'research_theme');
    }

    public function scienceCluster()
    {
        return $this->belongsTo(MasterScienceCluster::class, 'science_cluster_level_3');
    }
}
