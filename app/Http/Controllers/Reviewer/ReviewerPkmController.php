<?php

namespace App\Http\Controllers\Reviewer;

use App\Http\Controllers\Controller;
use App\Models\PkmProposal;
use App\Models\PkmReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewerPkmController extends Controller
{
    /**
     * List PKM proposals assigned to the current reviewer
     */
    public function index()
    {
        $user = auth('api')->user();
        
        // If user is a PKM reviewer, they see all proposals in 'submitted' or 'review' status (Pool)
        if ($user->hasRole(['admin', 'reviewer_pkm'])) {
            $proposals = PkmProposal::with(['fiscalYear', 'user'])
                ->whereIn('status', ['submitted', 'review'])
                ->get();
        } else {
            // Traditional Plotting fallback
            $proposals = PkmProposal::with(['fiscalYear', 'user'])
                ->whereHas('pkmReviews', function($q) use ($user) {
                    $q->where('reviewer_id', $user->id);
                })
                ->get();
        }

        return response()->json($proposals);
    }

    /**
     * Show PKM proposal for review
     */
    public function show($id)
    {
        $user = auth('api')->user();
        $proposal = PkmProposal::with([
            'fiscalYear', 'user', 'partners', 
            'substance', 'outputs', 'budgetItems', 'documents'
        ])->findOrFail($id);
        
        // Find or create a PKM review record for this reviewer/proposal
        $review = PkmReview::firstOrCreate(
            ['pkm_proposal_id' => $id, 'reviewer_id' => $user->id],
            ['status' => 'pending', 'score' => 0]
        );

        // Fetch PKM criteria
        $criteria = \DB::table('master_review_criteria')
            ->where('type', 'pkm')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'proposal' => $proposal,
            'review' => $review,
            'criteria' => $criteria
        ]);
    }

    /**
     * Submit PKM Review
     */
    public function submitReview(Request $request, $id)
    {
        $user = auth('api')->user();
        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'comment' => 'nullable|string',
            'decision' => 'required|in:accepted,rejected,revision'
        ]);

        try {
            $review = PkmReview::where('pkm_proposal_id', $id)
                ->where('reviewer_id', $user->id)
                ->first();

            if (!$review) {
                $review = PkmReview::create([
                    'pkm_proposal_id' => $id,
                    'reviewer_id' => $user->id,
                    'status' => 'pending'
                ]);
            }

            $review->update([
                'score' => $validated['score'],
                'comment' => $validated['comment'],
                'decision' => $validated['decision']
            ]);

            return response()->json(['message' => 'Penilaian PKM berhasil disimpan.', 'review' => $review]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menyimpan penilaian: ' . $e->getMessage()], 500);
        }
    }
}
