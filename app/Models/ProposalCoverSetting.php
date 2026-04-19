<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalCoverSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title_top',
        'logo_path',
        'title_bottom_prodi',
        'title_bottom_faculty',
        'title_bottom_university'
    ];
}
