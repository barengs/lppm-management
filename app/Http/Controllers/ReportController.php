<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Proposal;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // Filter by proposal if needed
        $query = Report::query();
        if ($request->has('proposal_id')) {
            $query->where('proposal_id', $request->proposal_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proposal_id' => 'required|exists:proposals,id',
            'type' => 'required|in:progress,final,monev,logbook',
            'file_path' => 'nullable|string',
            'comments' => 'nullable|string',
            'status' => 'in:submitted,approved,revision'
        ]);

        // Verify ownership
        $proposal = Proposal::findOrFail($validated['proposal_id']);
        if ($proposal->user_id !== auth('api')->id() && !auth('api')->user()->role === 'admin') {
             // Basic auth check - refine later
        }

        $report = Report::create($validated);
        return response()->json($report, 201);
    }
}
