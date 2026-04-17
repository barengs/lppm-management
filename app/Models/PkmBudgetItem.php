<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmBudgetItem extends Model
{
    protected $fillable = [
        'pkm_proposal_id',
        'year',
        'cost_group',
        'component',
        'item_name',
        'unit',
        'volume',
        'unit_cost',
        'total_cost',
        'url_price',
    ];

    public function proposal()
    {
        return $this->belongsTo(PkmProposal::class, 'pkm_proposal_id');
    }
}
