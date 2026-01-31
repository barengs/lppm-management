<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = ['name', 'location', 'is_active'];

    public function items()
    {
        return $this->hasMany(MenuItem::class)->orderBy('order');
    }

    // Helper to get hierarchical tree
    public function tree()
    {
        return $this->items()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get();
    }
}
