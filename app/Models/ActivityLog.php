<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'date',
        'activity_description',
        'proof_file',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
