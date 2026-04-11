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

        if ($request->has('status')) {
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
            'reviewer_id' => 'required|exists:users,id',
        ]);

        $proposal = Proposal::findOrFail($id);
        
        // Update proposal status to review
        $proposal->update(['status' => 'review']);

        // Create or update review entry
        $review = Review::updateOrCreate(
            ['proposal_id' => $id, 'reviewer_id' => $validated['reviewer_id']],
            ['decision' => 'pending']
        );

        return response()->json([
            'message' => 'Reviewer berhasil ditugaskan.',
            'proposal' => $proposal->load('reviews.reviewer')
        ]);
    }

    /**
     * Get list of available reviewers
     */
    public function reviewers()
    {
        $reviewers = User::role('reviewer')->get(['id', 'name', 'email']);
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
