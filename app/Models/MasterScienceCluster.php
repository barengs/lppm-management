<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterScienceCluster extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'level', 'parent_id'];

    public function children()
    {
        return $this->hasMany(MasterScienceCluster::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(MasterScienceCluster::class, 'parent_id');
    }
}
