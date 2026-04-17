<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewDetail extends Model
{
    use HasFactory;

    protected $fillable = ['review_id', 'criteria_id', 'score', 'comment'];

    public function criteria()
    {
        return $this->belongsTo(MasterReviewCriteria::class, 'criteria_id');
    }

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}
