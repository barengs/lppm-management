<?php

namespace App\Http\Controllers;

use App\Models\PkmMasterData;
use Illuminate\Http\Request;

class PkmMasterDataController extends Controller
{
    /**
     * List items — public for dropdown consumption in forms
     * GET /api/pkm-master-data?type=scheme_group
     */
    public function index(Request $request)
    {
        $type = $request->get('type');

        // Validate type if supplied
        if ($type && !array_key_exists($type, PkmMasterData::TYPES)) {
            return response()->json(['message' => 'Tipe tidak valid.'], 422);
        }

        $query = PkmMasterData::active();

        if ($type) {
            $query->ofType($type);
        }

        return response()->json($query->get());
    }

    /**
     * List all available types (for admin UI)
     * GET /api/pkm-master-data/types
     */
    public function types()
    {
        return response()->json(PkmMasterData::TYPES);
    }

    /**
     * List all data grouped by type (for admin UI)
     * GET /api/pkm-master-data/all
     */
    public function all()
    {
        $data = PkmMasterData::orderBy('type')->orderBy('sort_order')->orderBy('name')->get();
        return response()->json($data);
    }

    /**
     * Create new item
     * POST /api/pkm-master-data
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'       => 'required|in:' . implode(',', array_keys(PkmMasterData::TYPES)),
            'name'       => 'required|string|max:255',
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item = PkmMasterData::create($validated);
        return response()->json($item, 201);
    }

    /**
     * Update item
     * PUT /api/pkm-master-data/{id}
     */
    public function update(Request $request, $id)
    {
        $item = PkmMasterData::findOrFail($id);

        $validated = $request->validate([
            'type'       => 'sometimes|in:' . implode(',', array_keys(PkmMasterData::TYPES)),
            'name'       => 'sometimes|string|max:255',
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    /**
     * Delete item
     * DELETE /api/pkm-master-data/{id}
     */
    public function destroy($id)
    {
        $item = PkmMasterData::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
