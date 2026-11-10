<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'category',
        'thumbnail',
        'video_url',
        'is_published',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title) . '-' . Str::random(5);
            }
        });
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getThumbnailAttribute($value)
    {
        if (!$value || str_contains($value, 'source.unsplash.com')) {
            return null;
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
            $urlHost = parse_url($value, PHP_URL_HOST);

            // Jika URL mengarah ke domain sendiri dengan http://, ubah menjadi path relatif
            if ($appHost && $urlHost === $appHost && Str::startsWith($value, 'http://')) {
                $path = parse_url($value, PHP_URL_PATH) ?? '';
                return '/' . ltrim($path, '/');
            }

            return $value;
        }

        return '/' . ltrim($value, '/');
    }
}
