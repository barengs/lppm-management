<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display a listing of proposals available for review.
     */
    public function index()
    {
        $user = auth('api')->user();

        // For MVP: Show all 'submitted' proposals or proposals already reviewed by this reviewer
        $proposals = Proposal::with(['scheme', 'fiscalYear', 'user'])
            ->with(['reviews' => function($q) use ($user) {
                $q->where('reviewer_id', $user->id);
            }])
            ->where('status', 'submitted')
            ->orWhereHas('reviews', function($q) use ($user) {
                $q->where('reviewer_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($proposals);
    }

    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'proposal_id' => 'required|exists:proposals,id',
            'score' => 'required|integer|min:0|max:100',
            'comment' => 'required|string',
            'decision' => 'required|in:accepted,rejected,revision',
        ]);

        $validated['reviewer_id'] = auth('api')->id();

        // Save Review
        $review = Review::updateOrCreate(
            [
                'proposal_id' => $validated['proposal_id'],
                'reviewer_id' => $validated['reviewer_id']
            ],
            $validated
        );

        // Auto-update Proposal Status if decision is made (MVP Logic)
        // In a real system, this might require all reviewers to finish.
        // For now, if decision is Accepted/Rejected, we update the proposal status.
        $proposal = Proposal::find($validated['proposal_id']);
        if ($validated['decision'] === 'accepted') {
            $proposal->update(['status' => 'accepted']);
        } elseif ($validated['decision'] === 'rejected') {
            $proposal->update(['status' => 'rejected']);
        } elseif ($validated['decision'] === 'revision') {
            $proposal->update(['status' => 'review']); // Or back to draft? Let's use 'review' to indicate needs revision or ongoing
        }

        return response()->json($review, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Get review details
    }
}
