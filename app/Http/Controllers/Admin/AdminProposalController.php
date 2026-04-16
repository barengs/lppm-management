<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminProposalController extends Controller
{
    /**
     * List all submitted proposals
     */
    public function index(Request $request)
    {
        $query = Proposal::with(['scheme', 'user', 'reviews.reviewer'])
            ->where('status', '!=', 'draft');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Get Stats for Admin Dashboard
     */
    public function stats()
    {
        return response()->json([
            'total_submitted' => Proposal::where('status', 'submitted')->count(),
            'total_review' => Proposal::where('status', 'review')->count(),
            'total_accepted' => Proposal::where('status', 'accepted')->count(),
            'per_scheme' => Proposal::select('scheme_id', DB::raw('count(*) as count'))
                ->with('scheme:id,name')
                ->groupBy('scheme_id')
                ->get()
        ]);
    }

    /**
     * Assign a reviewer to a proposal
     */
    public function assignReviewer(Request $request, $id)
    {
        $validated = $request->validate([
            'reviewer_id' => 'nullable|exists:users,id',
        ]);

        $proposal = Proposal::findOrFail($id);
        
        // Update proposal status to review
        $proposal->update(['status' => 'review']);

        if (!empty($validated['reviewer_id'])) {
            // Traditional explicit mapping if provided
            $review = Review::updateOrCreate(
                ['proposal_id' => $id, 'reviewer_id' => $validated['reviewer_id']],
                ['status' => 'pending']
            );
        }

        return response()->json([
            'message' => 'Proposal berhasil dibuka untuk penelaahan.',
            'proposal' => $proposal->load('reviews.reviewer')
        ]);
    }

    /**
     * Get list of available reviewers
     */
    public function reviewers()
    {
        // Fetch users specifically with reviewer_penelitian role
        $reviewers = User::role('reviewer_penelitian')->get(['id', 'name', 'email']);
        
        // Fallback to legacy 'reviewer' role if no specialty reviewers found yet
        if ($reviewers->isEmpty()) {
            $reviewers = User::role('reviewer')->get(['id', 'name', 'email']);
        }

        return response()->json($reviewers);
    }

    /**
     * Finalize Proposal Status (Accepted/Rejected)
     */
    public function finalize(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected',
            'notes' => 'nullable|string'
        ]);

        $proposal->update([
            'status' => $validated['status'],
        ]);

        // Send Notification if Accepted
        if ($validated['status'] === 'accepted') {
            $proposal->user->notify(new \App\Notifications\ProposalNotification(
                $proposal,
                "Selamat! Usulan Anda '" . $proposal->title . "' telah diterima oleh LPPM.",
                "/proposals" // Redirect to proposals list
            ));
        }

        return response()->json([
            'message' => 'Status proposal berhasil diupdate menjadi ' . $validated['status'],
            'proposal' => $proposal
        ]);
    }
}
