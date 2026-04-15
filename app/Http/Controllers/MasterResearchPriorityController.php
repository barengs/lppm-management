<?php

namespace App\Http\Controllers;

use App\Models\MasterResearchPriority;
use Illuminate\Http\Request;

class MasterResearchPriorityController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterResearchPriority::query();
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:focus_area,theme,topic',
            'parent_id' => 'nullable|exists:master_research_priorities,id'
        ]);

        $priority = MasterResearchPriority::create($validated);
        return response()->json($priority, 201);
    }

    public function update(Request $request, MasterResearchPriority $priority)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:focus_area,theme,topic',
            'parent_id' => 'nullable|exists:master_research_priorities,id'
        ]);

        $priority->update($validated);
        return response()->json($priority);
    }

    public function destroy(MasterResearchPriority $priority)
    {
        $priority->delete();
        return response()->noContent();
    }
}
