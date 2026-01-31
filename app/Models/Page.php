<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'icon',
        'hero_desc',
        'content',
        'type',
        'is_published',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
