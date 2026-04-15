<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PkmProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fiscal_year_id',
        'title',
        'summary',
        'substance_summary',
        'keywords',
        'scheme_group',
        'scope',
        'focus_area',
        'duration_years',
        'first_year',
        'status',
        'current_step',
        'budget',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function partners()
    {
        return $this->hasMany(PkmPartner::class);
    }

    public function personnel()
    {
        return $this->hasMany(PkmPersonnel::class);
    }

    public function substance()
    {
        return $this->hasOne(PkmSubstance::class);
    }

    public function outputs()
    {
        return $this->hasMany(PkmOutput::class);
    }

    public function budgetItems()
    {
        return $this->hasMany(PkmBudgetItem::class);
    }

    public function documents()
    {
        return $this->hasMany(PkmDocument::class);
    }
}
