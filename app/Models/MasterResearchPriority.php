<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterResearchPriority extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'parent_id'];

    public function children()
    {
        return $this->hasMany(MasterResearchPriority::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(MasterResearchPriority::class, 'parent_id');
    }
}
