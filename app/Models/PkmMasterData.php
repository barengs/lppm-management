<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PkmMasterData extends Model
{
    protected $table = 'pkm_master_data';

    protected $fillable = ['type', 'name', 'is_active', 'sort_order', 'parent_id', 'metadata'];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Valid types for PKM master data
     */
    const TYPES = [
        'scheme_group' => 'Kelompok Skema',
        'scope'        => 'Ruang Lingkup',
        'output_group' => 'Kelompok Luaran',
        'cost_group'   => 'Kelompok Biaya (RAB)',
        'sdg_goal'     => 'Tujuan SDGs',
        'partner_group' => 'Kelompok Mitra Sasaran',
        'budget_component' => 'Komponen Biaya',
    ];

    /**
     * Scope: only active records, ordered
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Scope: filter by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
