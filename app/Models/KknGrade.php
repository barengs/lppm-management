<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KknGrade extends Model
{
    protected $fillable = [
        'kkn_registration_id',
        'graded_by',
        'dpl_id',
        'article_graded_by',
        // Score breakdown
        'w1_score', 'w2_score', 'w3_score', 'w4_score',
        'secondary_score',
        'article_score',
        // Calculated fields
        'total_weight',
        'final_score',
        'numeric_score', // Legacy alias for final_score
        'grade',
        'certificate_number',
        'is_finalized',
    ];

    protected $casts = [
        'w1_score' => 'double', 'w2_score' => 'double',
        'w3_score' => 'double', 'w4_score' => 'double',
        'secondary_score' => 'double',
        'article_score' => 'double',
        'total_weight' => 'double',
        'final_score' => 'double',
        'numeric_score' => 'double',
        'is_finalized' => 'boolean',
    ];

    // ─── Relations ──────────────────────────────────────────────────────────

    public function registration()
    {
        return $this->belongsTo(KknRegistration::class, 'kkn_registration_id');
    }

    public function gradedBy()
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function dpl()
    {
        return $this->belongsTo(User::class, 'dpl_id');
    }

    public function articleGradedBy()
    {
        return $this->belongsTo(User::class, 'article_graded_by');
    }

    // ─── Core Calculation ──────────────────────────────────────────────────

    /**
     * Recalculate total_weight and final_score, then map to letter grade.
     * Called after saving DPL score or article score.
     */
    public function recalculate(): void
    {
        $primer   = ($this->w1_score ?? 0) + ($this->w2_score ?? 0)
                  + ($this->w3_score ?? 0) + ($this->w4_score ?? 0);
        $secondary = $this->secondary_score ?? 0;
        $article   = $this->article_score ?? 0;

        $totalWeight = $primer + $secondary;

        // Nilai Akhir = (Total Bobot + Artikel) / 2
        // Only calculate if both sides have been filled
        $finalScore = null;
        if ($this->hasDplScores() && $this->article_score !== null) {
            $finalScore = ($totalWeight + $article) / 2;
        } elseif ($this->hasDplScores()) {
            // partial: DPL done, article pending
            $finalScore = null;
        }

        $this->total_weight  = $totalWeight;
        $this->final_score   = $finalScore;
        $this->numeric_score = $finalScore ?? $this->numeric_score;
        $this->grade         = $finalScore !== null ? static::scoreToGrade($finalScore) : $this->grade;

        $this->saveQuietly();
    }

    /**
     * Check if all DPL scores have been submitted.
     */
    public function hasDplScores(): bool
    {
        return $this->w1_score !== null
            && $this->w2_score !== null
            && $this->w3_score !== null
            && $this->w4_score !== null
            && $this->secondary_score !== null;
    }

    /**
     * Check if article score has been submitted.
     */
    public function hasArticleScore(): bool
    {
        return $this->article_score !== null;
    }

    /**
     * Convert numeric score to letter grade.
     */
    public static function scoreToGrade(float $score): string
    {
        if ($score >= 85) return 'A';
        if ($score >= 80) return 'A-';
        if ($score >= 75) return 'B+';
        if ($score >= 70) return 'B';
        if ($score >= 65) return 'B-';
        if ($score >= 60) return 'C+';
        if ($score >= 55) return 'C';
        if ($score >= 40) return 'D';
        return 'E';
    }
}
