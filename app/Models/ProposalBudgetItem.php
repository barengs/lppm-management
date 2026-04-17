<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalBudgetItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'execution_year',
        'cost_group',
        'item_name',
        'quantity',
        'unit',
        'unit_cost',
        'total_cost',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
