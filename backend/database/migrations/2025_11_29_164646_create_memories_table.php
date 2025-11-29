<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->default(1)->constrained()->onDelete('cascade');
            $table->string('path'); // Chemin du fichier (photo/vidéo)
            $table->string('type')->default('image'); // 'image' ou 'video'
            $table->date('taken_at')->nullable(); // Date de prise (optionnelle)
            $table->boolean('is_featured')->default(false); // Pour la timeline
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memories');
    }
};