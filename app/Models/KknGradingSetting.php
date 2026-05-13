<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KknGradingSetting extends Model
{
    protected $table = 'kkn_grading_settings';

    protected $fillable = [
        'kkn_period_id',
        'w1_max', 'w2_max', 'w3_max', 'w4_max',
        'secondary_max',
        'article_max',
    ];

    protected $casts = [
        'w1_max' => 'integer', 'w2_max' => 'integer',
        'w3_max' => 'integer', 'w4_max' => 'integer',
        'secondary_max' => 'integer',
        'article_max' => 'integer',
    ];

    public function period()
    {
        return $this->belongsTo(KknPeriod::class, 'kkn_period_id');
    }

    /**
     * Max total possible weight = W1+W2+W3+W4+Secondary
     */
    public function getMaxTotalWeightAttribute(): int
    {
        return $this->w1_max + $this->w2_max + $this->w3_max + $this->w4_max + $this->secondary_max;
    }
}
