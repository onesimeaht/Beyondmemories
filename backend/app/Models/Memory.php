<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Memory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'path',
        'type',
        'taken_at',
        'is_featured',
    ];

    protected $casts = [
        'taken_at' => 'date',
        'is_featured' => 'boolean',
    ];

    // Relation avec User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope pour récupérer uniquement les souvenirs "featured" (timeline)
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->orderBy('taken_at', 'asc');
    }

    // Accessor pour obtenir l'URL complète du fichier
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }
}