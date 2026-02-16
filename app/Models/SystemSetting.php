<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'system_name',
        'description',
        'address',
        'email',
        'phone',
        'logo_path',
        'favicon_path',
        'theme_color'
    ];
}
