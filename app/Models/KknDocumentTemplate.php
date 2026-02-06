<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class KknDocumentTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'fiscal_year_id',
        'name',
        'slug',
        'is_required',
        'order',
        'description',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Relationship with FiscalYear
     */
    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    /**
     * Scope to get templates for a specific fiscal year
     * If fiscal_year_id is null, returns global templates
     */
    public function scopeForFiscalYear($query, $fiscalYearId)
    {
        return $query->where(function ($q) use ($fiscalYearId) {
            $q->where('fiscal_year_id', $fiscalYearId)
              ->orWhereNull('fiscal_year_id');
        })->orderBy('order');
    }

    /**
     * Scope to get only required templates
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope to get only optional templates
     */
    public function scopeOptional($query)
    {
        return $query->where('is_required', false);
    }

    /**
     * Boot method to auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($template) {
            if (empty($template->slug)) {
                $template->slug = Str::slug($template->name);
            }
        });

        static::updating(function ($template) {
            if ($template->isDirty('name') && empty($template->slug)) {
                $template->slug = Str::slug($template->name);
            }
        });
    }
}
