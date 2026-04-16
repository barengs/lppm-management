<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PkmProposal;
use App\Models\PkmReview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPkmController extends Controller
{
    /**
     * List all submitted PKM proposals
     */
    public function index(Request $request)
    {
        $query = PkmProposal::with(['fiscalYear', 'user', 'pkmReviews.reviewer'])
            ->where('status', '!=', 'draft');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Get Stats for PKM Monitoring
     */
    public function stats()
    {
        return response()->json([
            'total_submitted' => PkmProposal::where('status', 'submitted')->count(),
            'total_review' => PkmProposal::where('status', 'review')->count(),
            'total_accepted' => PkmProposal::where('status', 'accepted')->count(),
            'per_scheme' => PkmProposal::select('scheme_group', DB::raw('count(*) as count'))
                ->groupBy('scheme_group')
                ->get()
        ]);
    }

    /**
     * Assign a reviewer to a PKM proposal
     */
    public function assignReviewer(Request $request, $id)
    {
        $validated = $request->validate([
            'reviewer_id' => 'nullable|exists:users,id',
        ]);

        $proposal = PkmProposal::findOrFail($id);
        
        // Update proposal status to review
        $proposal->update(['status' => 'review']);

        if (!empty($validated['reviewer_id'])) {
            // Traditional explicit mapping if provided
            $review = PkmReview::updateOrCreate(
                ['pkm_proposal_id' => $id, 'reviewer_id' => $validated['reviewer_id']],
                ['status' => 'pending']
            );
        }

        return response()->json([
            'message' => 'Proposal PKM berhasil dibuka untuk penelaahan.',
            'proposal' => $proposal->load('pkmReviews.reviewer')
        ]);
    }

    /**
     * Get list of available reviewers (lecturers with reviewer role)
     */
    public function reviewers()
    {
        // Fetch users specifically with reviewer_pkm role
        $reviewers = User::role('reviewer_pkm')->get(['id', 'name', 'email']);
        
        // Fallback to legacy 'reviewer' role if no pkm reviewers found yet
        if ($reviewers->isEmpty()) {
            $reviewers = User::role('reviewer')->get(['id', 'name', 'email']);
        }

        return response()->json($reviewers);
    }

    /**
     * Finalize PKM Status (Accepted/Rejected)
     */
    public function finalize(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $proposal = PkmProposal::findOrFail($id);
        $proposal->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Status proposal PKM berhasil diupdate menjadi ' . $validated['status'],
            'proposal' => $proposal
        ]);
    }
}
