<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KknPosto extends Model
{
    protected $fillable = [
        'name',
        'kkn_location_id',
        'kkn_period_id',
        'fiscal_year_id',
        'dpl_id',
        'status',
        'start_date',
        'end_date',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relations
    public function location()
    {
        return $this->belongsTo(KknLocation::class, 'kkn_location_id');
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function kknPeriod()
    {
        return $this->belongsTo(KknPeriod::class);
    }

    public function dpl()
    {
        return $this->belongsTo(User::class, 'dpl_id');
    }

    public function members()
    {
        return $this->hasMany(KknPostoMember::class);
    }

    public function registrations()
    {
        return $this->hasMany(KknRegistration::class);
    }

    // Helper methods
    public function getKordes()
    {
        return $this->members()->where('position', 'kordes')->with('student.mahasiswaProfile')->first();
    }

    public function getOfficers()
    {
        return $this->members()
            ->whereIn('position', ['kordes', 'sekretaris', 'bendahara', 'humas', 'publikasi'])
            ->with('student.mahasiswaProfile')
            ->get();
    }

    public function getRegularMembers()
    {
        return $this->members()
            ->where('position', 'anggota')
            ->with('student.mahasiswaProfile')
            ->get();
    }

    public function getMemberCount()
    {
        return $this->members()->where('status', 'active')->count();
    }

    public function isComplete()
    {
        $hasKordes = $this->members()->where('position', 'kordes')->exists();
        $hasSekretaris = $this->members()->where('position', 'sekretaris')->exists();
        $hasBendahara = $this->members()->where('position', 'bendahara')->exists();
        
        return $hasKordes && $hasSekretaris && $hasBendahara;
    }
}
