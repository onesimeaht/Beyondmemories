<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->default(1)->constrained()->onDelete('cascade');
            $table->integer('template_id'); // 1 à 5 (les 5 templates 3D)
            $table->string('name')->default('Mon mémorial'); // Nom de la parcelle
            $table->uuid('share_uuid')->unique(); // UUID pour le partage public
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parcels');
    }
};