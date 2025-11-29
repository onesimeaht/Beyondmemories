<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Memory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MemoryController extends Controller
{
    /**
     * Upload une ou plusieurs photos/vidéos
     * POST /api/upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:51200', // 50MB max
            'taken_at' => 'nullable|date',
        ]);

        $memories = [];

        foreach ($request->file('files') as $file) {
            // Stocker le fichier dans storage/app/public/memories
            $path = $file->store('memories', 'public');

            // Déterminer le type (image ou video)
            $type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image';

            // Créer l'entrée dans la DB
            $memory = Memory::create([
                'user_id' => 1, // En dur pour le prototype
                'path' => $path,
                'type' => $type,
                'taken_at' => $request->taken_at ?? now(),
                'is_featured' => false, // Par défaut, pas dans la timeline
            ]);

            $memories[] = $memory;
        }

        return response()->json([
            'success' => true,
            'message' => count($memories) . ' fichier(s) uploadé(s)',
            'memories' => $memories,
        ], 201);
    }

    /**
     * Récupérer la timeline (souvenirs featured uniquement)
     * GET /api/timeline
     */
    public function timeline()
    {
        $memories = Memory::where('user_id', 1)
            ->featured()
            ->get()
            ->map(function ($memory) {
                return [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at->format('Y-m-d'),
                ];
            });

        return response()->json([
            'success' => true,
            'timeline' => $memories,
        ]);
    }

    /**
     * Marquer un souvenir comme "featured" (dans la timeline)
     * POST /api/memories/{id}/feature
     */
    public function toggleFeature($id)
    {
        $memory = Memory::findOrFail($id);
        $memory->is_featured = !$memory->is_featured;
        $memory->save();

        return response()->json([
            'success' => true,
            'memory' => $memory,
        ]);
    }

    /**
     * Récupérer tous les souvenirs (pour l'étape 1)
     * GET /api/memories
     */
    public function index()
    {
        $memories = Memory::where('user_id', 1)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($memory) {
                return [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at->format('Y-m-d'),
                    'is_featured' => $memory->is_featured,
                ];
            });

        return response()->json([
            'success' => true,
            'memories' => $memories,
        ]);
    }
}