<?php

namespace App\Http\Controllers;

use App\Models\MasterScienceCluster;
use Illuminate\Http\Request;

class MasterScienceClusterController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterScienceCluster::query();
        if ($request->has('level')) {
            $query->where('level', $request->level);
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
            'level' => 'required|integer|in:1,2,3',
            'parent_id' => 'nullable|exists:master_science_clusters,id'
        ]);

        $cluster = MasterScienceCluster::create($validated);
        return response()->json($cluster, 201);
    }

    public function update(Request $request, MasterScienceCluster $cluster)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'level' => 'integer|in:1,2,3',
            'parent_id' => 'nullable|exists:master_science_clusters,id'
        ]);

        $cluster->update($validated);
        return response()->json($cluster);
    }

    public function destroy(MasterScienceCluster $cluster)
    {
        $cluster->delete();
        return response()->noContent();
    }
}
