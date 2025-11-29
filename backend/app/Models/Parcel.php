<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Parcel extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'template_id',
        'name',
        'share_uuid',
    ];

    // Générer automatiquement un UUID lors de la création
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($parcel) {
            if (empty($parcel->share_uuid)) {
                $parcel->share_uuid = Str::uuid();
            }
        });
    }

    // Relation avec User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Récupérer les souvenirs associés (via user_id)
    public function memories()
    {
        return $this->hasMany(Memory::class, 'user_id', 'user_id')
                    ->where('is_featured', true)
                    ->orderBy('taken_at', 'asc');
    }

    // Accessor pour l'URL de partage
    public function getShareUrlAttribute()
    {
        return url('/parcel/' . $this->share_uuid);
    }
}