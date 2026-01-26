<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = ['title', 'description'];

    public function items()
    {
        return $this->hasMany(GalleryItem::class);
    }
}
