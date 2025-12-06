<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Memory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MemoryController extends Controller
{
    /**
     * Upload une ou plusieurs photos/vidéos
     * POST /api/upload
     */
    public function upload(Request $request)
    {
        try {
            Log::info('📤 Requête upload reçue', [
                'files_count' => $request->hasFile('files') ? count($request->file('files')) : 0,
                'taken_at' => $request->input('taken_at'),
                'name' => $request->input('name'),
                'description' => $request->input('description'),
            ]);

            $request->validate([
                'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:51200', // 50MB max
                'taken_at' => 'nullable|date|before_or_equal:today',
                'name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
            ]);

            $memories = [];
            $takenAt = $request->input('taken_at');
            $name = $request->input('name');
            $description = $request->input('description');

            // Convertir la date si elle existe
            $parsedDate = null;
            if ($takenAt) {
                try {
                    $parsedDate = \Carbon\Carbon::parse($takenAt);
                    // Double vérification : ne pas accepter les dates futures
                    if ($parsedDate->isFuture()) {
                        Log::warning('Date future refusée: ' . $takenAt);
                        return response()->json([
                            'success' => false,
                            'message' => 'La date ne peut pas être dans le futur',
                        ], 422);
                    }
                } catch (\Exception $e) {
                    Log::warning('Date invalide: ' . $takenAt);
                    $parsedDate = now();
                }
            } else {
                $parsedDate = now();
            }

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
                    'taken_at' => $parsedDate,
                    'name' => $name ?: null,
                    'description' => $description ?: null,
                    'is_featured' => false,
                    'parent_id' => null, // C'est un souvenir principal
                ]);

                Log::info('✅ Souvenir créé:', [
                    'id' => $memory->id,
                    'name' => $memory->name,
                    'description' => $memory->description,
                    'taken_at' => $memory->taken_at,
                ]);

                $memories[] = [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at->format('Y-m-d'),
                    'name' => $memory->name,
                    'description' => $memory->description,
                    'is_featured' => $memory->is_featured,
                ];
            }

            return response()->json([
                'success' => true,
                'message' => count($memories) . ' fichier(s) uploadé(s)',
                'memories' => $memories,
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ Erreur upload: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Récupérer tous les souvenirs principaux (sans parent_id)
     * GET /api/memories
     */
    public function index()
    {
        $memories = Memory::where('user_id', 1)
            ->whereNull('parent_id') // Uniquement les souvenirs principaux
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($memory) {
                return [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at ? $memory->taken_at->format('Y-m-d') : null,
                    'name' => $memory->name,
                    'description' => $memory->description,
                    'is_featured' => $memory->is_featured,
                ];
            });

        return response()->json([
            'success' => true,
            'memories' => $memories,
        ]);
    }

    /**
     * Récupérer la galerie d'un souvenir
     * GET /api/memories/{id}/gallery
     */
    public function getGallery($id)
    {
        try {
            // Vérifier que le souvenir principal existe
            $memory = Memory::findOrFail($id);
            
            // Récupérer toutes les photos de la galerie
            $gallery = Memory::where('parent_id', $id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($photo) {
                    return [
                        'id' => $photo->id,
                        'url' => $photo->url,
                        'type' => $photo->type,
                        'taken_at' => $photo->taken_at ? $photo->taken_at->format('Y-m-d') : null,
                        'name' => $photo->name,
                        'description' => $photo->description,
                    ];
                });
            
            Log::info("🖼️ Galerie du souvenir $id récupérée: " . count($gallery) . " photos");
            
            return response()->json([
                'success' => true,
                'gallery' => $gallery
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getGallery: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la galerie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ajouter des photos à la galerie d'un souvenir
     * POST /api/memories/{id}/gallery
     */
    public function addToGallery(Request $request, $id)
    {
        try {
            Log::info("📸 Ajout de photos à la galerie du souvenir $id");
            
            // Vérifier que le souvenir parent existe
            $parentMemory = Memory::findOrFail($id);
            
            $request->validate([
                'files' => 'required|array',
                'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:51200'
            ]);

            $uploadedPhotos = [];
            
            foreach ($request->file('files') as $file) {
                // Stocker le fichier
                $path = $file->store('memories', 'public');
                
                // Déterminer le type
                $mimeType = $file->getMimeType();
                $type = str_starts_with($mimeType, 'video') ? 'video' : 'image';
                
                // Créer l'entrée dans la BDD avec parent_id
                $memory = Memory::create([
                    'user_id' => 1,
                    'path' => $path,
                    'type' => $type,
                    'taken_at' => now(),
                    'is_featured' => false,
                    'parent_id' => $id, // Lier à la galerie du souvenir parent
                    'name' => $request->input('name'),
                    'description' => $request->input('description')
                ]);
                
                Log::info("✅ Photo ajoutée à la galerie: " . $memory->id);
                
                $uploadedPhotos[] = [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at->format('Y-m-d'),
                    'name' => $memory->name,
                    'description' => $memory->description,
                ];
            }
            
            return response()->json([
                'success' => true,
                'message' => count($uploadedPhotos) . ' photo(s) ajoutée(s) à la galerie',
                'photos' => $uploadedPhotos
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erreur addToGallery: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout à la galerie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un souvenir
     * DELETE /api/memories/{id}
     */
    public function destroy($id)
    {
        try {
            Log::info("🗑️ Tentative de suppression du souvenir ID: $id");

            // Trouver le souvenir
            $memory = Memory::where('user_id', 1)->find($id);

            if (!$memory) {
                Log::warning("❌ Souvenir $id non trouvé");
                return response()->json([
                    'success' => false,
                    'message' => 'Souvenir non trouvé'
                ], 404);
            }

            Log::info("📄 Souvenir trouvé: " . json_encode($memory));

            // Supprimer les photos de la galerie si c'est un souvenir principal
            if ($memory->parent_id === null) {
                $galleryPhotos = Memory::where('parent_id', $id)->get();
                foreach ($galleryPhotos as $photo) {
                    if ($photo->path && Storage::disk('public')->exists($photo->path)) {
                        Storage::disk('public')->delete($photo->path);
                    }
                    $photo->delete();
                }
                Log::info("✅ " . count($galleryPhotos) . " photos de galerie supprimées");
            }

            // Supprimer le fichier physique du souvenir principal
            if ($memory->path && Storage::disk('public')->exists($memory->path)) {
                Storage::disk('public')->delete($memory->path);
                Log::info("✅ Fichier supprimé: " . $memory->path);
            } else {
                Log::warning("⚠️ Fichier non trouvé: " . ($memory->path ?? 'pas de path'));
            }

            // Supprimer de la base de données
            $memory->delete();
            Log::info("✅ Souvenir $id supprimé de la base de données");

            return response()->json([
                'success' => true,
                'message' => 'Souvenir supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error("💥 Erreur lors de la suppression: " . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer un souvenir comme "featured" (dans la timeline)
     * POST /api/memories/{id}/feature
     */
    public function toggleFeature($id)
    {
        try {
            $memory = Memory::findOrFail($id);
            $memory->is_featured = !$memory->is_featured;
            $memory->save();

            return response()->json([
                'success' => true,
                'memory' => [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at ? $memory->taken_at->format('Y-m-d') : null,
                    'name' => $memory->name,
                    'description' => $memory->description,
                    'is_featured' => $memory->is_featured,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur toggleFeature: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
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
            ->where('is_featured', true)
            ->whereNull('parent_id') // Uniquement les souvenirs principaux
            ->orderBy('taken_at', 'asc')
            ->get()
            ->map(function ($memory) {
                return [
                    'id' => $memory->id,
                    'url' => $memory->url,
                    'type' => $memory->type,
                    'taken_at' => $memory->taken_at ? $memory->taken_at->format('Y-m-d') : null,
                ];
            });

        return response()->json([
            'success' => true,
            'timeline' => $memories,
        ]);
    }

    /**
     * Auto-générer la timeline (Mock IA)
     * Sélectionne automatiquement ~5 memories comme "featured"
     * POST /api/generate-timeline
     */
    public function generateTimeline()
    {
        try {
            // Réinitialiser tous les is_featured à false
            Memory::where('user_id', 1)->update(['is_featured' => false]);

            // Sélectionner max 5 memories aléatoires (uniquement les principaux) et les marquer comme featured
            $selectedMemories = Memory::where('user_id', 1)
                ->whereNull('parent_id')
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
                        'taken_at' => $memory->taken_at ? $memory->taken_at->format('Y-m-d') : null,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur generateTimeline: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }
}