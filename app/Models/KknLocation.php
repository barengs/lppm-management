<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KknLocation extends Model
{
    protected $fillable = ['fiscal_year_id', 'name', 'quota', 'description'];

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }
}
