<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterReviewCriteria extends Model
{
    use HasFactory;

    protected $table = 'master_review_criteria';

    protected $fillable = ['criteria_name', 'description', 'weight', 'type', 'sort_order'];
}
