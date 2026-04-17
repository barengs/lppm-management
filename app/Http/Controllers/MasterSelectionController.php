<?php

namespace App\Http\Controllers;

use App\Models\MasterSelection;
use Illuminate\Http\Request;

class MasterSelectionController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterSelection::query();
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->orderBy('sort_order')->orderBy('label')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $selection = MasterSelection::create($validated);
        return response()->json($selection, 201);
    }

    public function update(Request $request, MasterSelection $selection)
    {
        $validated = $request->validate([
            'type' => 'string|max:255',
            'key' => 'string|max:255',
            'label' => 'string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $selection->update($validated);
        return response()->json($selection);
    }

    public function destroy(MasterSelection $selection)
    {
        $selection->delete();
        return response()->noContent();
    }
}
