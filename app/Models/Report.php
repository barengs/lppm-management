<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = ['proposal_id', 'type', 'file_path', 'status', 'comments'];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }
}
