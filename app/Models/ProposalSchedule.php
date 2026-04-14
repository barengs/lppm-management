<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'execution_year',
        'activity',
        'months',
    ];

    protected $casts = [
        'months' => 'array',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
