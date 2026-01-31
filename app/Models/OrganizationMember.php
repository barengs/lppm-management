<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;


class OrganizationMember extends Model
{
    protected $fillable = [
        'user_id',
        'position',
        'parent_id',
        'level',
        'order_index',
        'image',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent member
     */
    public function parent()
    {
        return $this->belongsTo(OrganizationMember::class, 'parent_id');
    }

    /**
     * Get all children members
     */
    public function children()
    {
        return $this->hasMany(OrganizationMember::class, 'parent_id')->orderBy('order_index');
    }

    /**
     * Get all descendants recursively
     */
    public function descendants()
    {
        return $this->children()->with('descendants');
    }
}
