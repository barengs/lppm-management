<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scheme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'type', 'max_budget', 'guideline_file', 'eligible_clusters',
        'abstract_limit', 'background_limit', 'methodology_limit', 'objective_limit', 'reference_limit'
    ];

    protected $casts = [
        'eligible_clusters' => 'array',
    ];
}
