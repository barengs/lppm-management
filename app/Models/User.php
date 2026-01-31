<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, \Spatie\Permission\Traits\HasRoles;

    // Backward compatibility for frontend checking user.role
    protected $appends = ['role'];

    public function getRoleAttribute()
    {
        return $this->roles->first()?->name ?? 'mahasiswa';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function mahasiswaProfile()
    {
        return $this->hasOne(MahasiswaProfile::class);
    }

    public function dosenProfile()
    {
        return $this->hasOne(DosenProfile::class);
    }


    public function scholarStats()
    {
        return $this->hasOne(ScholarStats::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class, 'created_by');
    }

    public function kknRegistration()
    {
        return $this->hasOne(KknRegistration::class, 'student_id');
    }

    public function organizationMember()
    {
        return $this->hasOne(OrganizationMember::class);
    }
}
