<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KknPostoMember extends Model
{
    protected $fillable = [
        'kkn_posto_id',
        'student_id',
        'kkn_registration_id',
        'position',
        'status',
        'joined_at',
        'notes',
    ];

    protected $casts = [
        'joined_at' => 'date',
    ];

    // Relations
    public function posto()
    {
        return $this->belongsTo(KknPosto::class, 'kkn_posto_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function registration()
    {
        return $this->belongsTo(KknRegistration::class, 'kkn_registration_id');
    }

    // Accessors
    public function getPositionNameAttribute()
    {
        $positions = [
            'kordes' => 'Koordinator Desa',
            'sekretaris' => 'Sekretaris',
            'bendahara' => 'Bendahara',
            'humas' => 'Humas',
            'publikasi' => 'Publikasi',
            'anggota' => 'Anggota',
        ];
        
        return $positions[$this->position] ?? $this->position;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'active' => ['text' => 'Aktif', 'color' => 'green'],
            'inactive' => ['text' => 'Tidak Aktif', 'color' => 'gray'],
            'withdrawn' => ['text' => 'Mengundurkan Diri', 'color' => 'red'],
        ];
        
        return $badges[$this->status] ?? ['text' => $this->status, 'color' => 'gray'];
    }
}
