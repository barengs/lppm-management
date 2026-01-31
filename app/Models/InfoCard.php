<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;

class InfoCard extends Model
{
    protected $fillable = ['title', 'description', 'icon', 'url', 'order', 'is_active', 'slug', 'content', 'image'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($card) {
            if (empty($card->slug)) {
                $card->slug = Str::slug($card->title);
            }
        });
    }
}
