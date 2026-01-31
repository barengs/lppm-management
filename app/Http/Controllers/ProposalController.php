<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProposalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth('api')->user();

        // If admin (or reviewer), show all. For now assuming admin check or just returning user's proposals.
        // We'll filter by user_id for basic users.
        
        $proposals = Proposal::with(['scheme', 'fiscalYear', 'user'])
            ->where('user_id', $user->id)
            ->get();

        return response()->json($proposals);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|exists:schemes,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'budget' => 'required|numeric|min:0',
            'file_proposal' => 'required|file|mimes:pdf|max:10240', // Max 10MB JSON, PDF
            'location' => 'nullable|string',
            // 'kkn_location_id' => 'nullable|exists:kkn_locations,id', 
            // 'dpl_id' => 'nullable|exists:users,id', 
        ]);

        $validated['user_id'] = auth('api')->id();
        $validated['status'] = 'draft';

        if ($request->hasFile('file_proposal')) {
            $path = $request->file('file_proposal')->store('proposals', 'public');
            $validated['file_proposal'] = $path;
        }

        $proposal = Proposal::create($validated);

        return response()->json($proposal, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Proposal $proposal)
    {
        $this->authorize('view', $proposal);
        return response()->json($proposal->load(['scheme', 'fiscalYear', 'reviews']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Proposal $proposal)
    {
        $this->authorize('update', $proposal);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'abstract' => 'sometimes|string',
            'location' => 'nullable|string',
            'status' => 'sometimes|in:draft,submitted',
        ]);

        $proposal->update($validated);

        return response()->json($proposal);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Proposal $proposal)
    {
        $this->authorize('delete', $proposal);
        $proposal->delete();
        return response()->json(['message' => 'Proposal deleted']);
    }
}
