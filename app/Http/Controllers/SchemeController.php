<?php

namespace App\Http\Controllers;

use App\Models\Scheme;
use Illuminate\Http\Request;

class SchemeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Scheme::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:research,abmas,kkn',
            'max_budget' => 'required|numeric',
            'guideline_file' => 'nullable|string'
        ]);

        $scheme = Scheme::create($validated);
        return response()->json($scheme, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Scheme $scheme)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:research,abmas,kkn',
            'max_budget' => 'numeric',
            'guideline_file' => 'nullable|string'
        ]);

        $scheme->update($validated);
        return response()->json($scheme);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Scheme $scheme)
    {
        $scheme->delete();
        return response()->noContent();
    }
}
