<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalOutput extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'category',
        'type',
        'target_description',
        'status_target',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
