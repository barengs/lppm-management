<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'phone',
        'logo_path',
        'favicon_path',
        'theme_color'
    ];
}
