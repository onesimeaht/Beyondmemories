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
        try {
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

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload',
                'error' => $e->getMessage(),
            ], 500);
        }
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

    /**
     * Auto-générer la timeline (Mock IA)
     * Sélectionne automatiquement ~5 memories comme "featured"
     * POST /api/generate-timeline
     */
    public function generateTimeline()
    {
        // Réinitialiser tous les is_featured à false
        Memory::where('user_id', 1)->update(['is_featured' => false]);

        // Sélectionner max 5 memories aléatoires et les marquer comme featured
        $selectedMemories = Memory::where('user_id', 1)
            ->inRandomOrder()
            ->limit(5)
            ->get();

        foreach ($selectedMemories as $memory) {
            $memory->is_featured = true;
            $memory->save();
        }

        return response()->json([
            'success' => true,
            'message' => count($selectedMemories) . ' souvenirs sélectionnés pour la timeline',
            'timeline' => $selectedMemories->map(function ($memory) {
                return [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at->format('Y-m-d'),
                ];
            }),
        ]);
    }
}