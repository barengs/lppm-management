<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MasterScienceCluster;
use App\Models\MasterResearchPriority;
use App\Models\MasterSelection;

class MasterDataController extends Controller
{
    /**
     * Get Science Clusters based on level/parent
     */
    public function scienceClusters(Request $request)
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

    /**
     * Get Research Priorities (Focus, Theme, Topic)
     */
    public function researchPriorities(Request $request)
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

    /**
     * Get Master Selections by Type
     */
    public function selections($type)
    {
        $data = MasterSelection::where('type', $type)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($data);
    }
}
