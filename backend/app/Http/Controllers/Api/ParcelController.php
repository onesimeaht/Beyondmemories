<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use Illuminate\Http\Request;

class ParcelController extends Controller
{
    /**
     * Créer une nouvelle parcelle 3D
     * POST /api/parcel
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'template_id' => 'required|integer|between:1,5', // 1 à 5 templates
                'name' => 'nullable|string|max:255',
            ]);

            // Vérifier qu'il y a au moins une memory featured
            $hasFeaturedMemories = \App\Models\Memory::where('user_id', 1)
                ->where('is_featured', true)
                ->exists();

            if (!$hasFeaturedMemories) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez avoir au moins un souvenir dans votre timeline avant de créer une parcelle.',
                ], 400);
            }

            $parcel = Parcel::create([
                'user_id' => 1, // En dur pour le prototype
                'template_id' => $request->template_id,
                'name' => $request->name ?? 'Mon mémorial',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Parcelle créée avec succès',
                'parcel' => [
                    'id' => $parcel->id,
                    'name' => $parcel->name,
                    'template_id' => $parcel->template_id,
                    'share_uuid' => $parcel->share_uuid,
                    'share_url' => $parcel->share_url,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la parcelle',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Voir une parcelle via son UUID (pour le partage public)
     * GET /api/parcel/{uuid}
     */
    public function show($uuid)
    {
        $parcel = Parcel::where('share_uuid', $uuid)->firstOrFail();

        // Charger les souvenirs featured
        $memories = $parcel->memories->map(function ($memory) {
            return [
                'id' => $memory->id,
                'url' => $memory->url,
                'type' => $memory->type,
                'taken_at' => $memory->taken_at->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'parcel' => [
                'id' => $parcel->id,
                'name' => $parcel->name,
                'template_id' => $parcel->template_id,
                'created_at' => $parcel->created_at->format('d/m/Y'),
            ],
            'memories' => $memories,
        ]);
    }

    /**
     * Lister toutes les parcelles (optionnel, pour debug)
     * GET /api/parcels
     */
    public function index()
    {
        $parcels = Parcel::where('user_id', 1)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($parcel) {
                return [
                    'id' => $parcel->id,
                    'name' => $parcel->name,
                    'template_id' => $parcel->template_id,
                    'share_uuid' => $parcel->share_uuid,
                    'share_url' => $parcel->share_url,
                    'created_at' => $parcel->created_at->format('d/m/Y'),
                ];
            });

        return response()->json([
            'success' => true,
            'parcels' => $parcels,
        ]);
    }
}