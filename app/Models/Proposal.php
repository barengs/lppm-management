<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'scheme_id',
        'fiscal_year_id',
        'title',
        'location',
        'abstract',
        'file_proposal',
        'budget',
        'status',
        'current_step',
        'tkt_level',
        'tkt_score',
        'rejection_reason',
    ];

    public function identity()
    {
        return $this->hasOne(ProposalIdentity::class);
    }

    public function personnel()
    {
        return $this->hasMany(ProposalPersonnel::class);
    }

    public function outputs()
    {
        return $this->hasMany(ProposalOutput::class);
    }

    public function budgetItems()
    {
        return $this->hasMany(ProposalBudgetItem::class);
    }

    public function content()
    {
        return $this->hasOne(ProposalContent::class);
    }

    public function schedules()
    {
        return $this->hasMany(ProposalSchedule::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scheme()
    {
        return $this->belongsTo(Scheme::class);
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function notes()
    {
        return $this->hasMany(ProposalNote::class);
    }
}
