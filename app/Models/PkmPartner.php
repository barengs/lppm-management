<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmPartner extends Model
{
    protected $fillable = [
        'pkm_proposal_id',
        'partner_category',
        'partner_name',
        'partner_description',
        'group_name',
        'leader_name',
        'group_type',
        'member_count',
        'problem_scope_1',
        'problem_scope_2',
        'province',
        'city',
        'district',
        'village',
        'address',
        'distance_proof_file',
        'cooperation_letter_file',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }
}
