<?php

namespace App\Http\Controllers\Reviewer;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\ReviewDetail;
use App\Models\MasterReviewCriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewerProposalController extends Controller
{
    /**
     * List proposals assigned to current reviewer
     */
    public function index()
    {
        $user = auth('api')->user();
        
        $proposals = Proposal::with(['scheme', 'user'])
            ->whereHas('reviews', function($q) use ($user) {
                $q->where('reviewer_id', $user->id);
            })
            ->get();

        return response()->json($proposals);
    }

    /**
     * Get criteria and current scores for a proposal
     */
    public function show($id)
    {
        $user = auth('api')->user();
        $proposal = Proposal::with(['scheme', 'user', 'identity', 'content', 'outputs', 'budgetItems'])->findOrFail($id);
        
        $review = Review::where('proposal_id', $id)
            ->where('reviewer_id', $user->id)
            ->with('details.criteria')
            ->firstOrFail();

        $criteria = MasterReviewCriteria::orderBy('sort_order')->get();

        return response()->json([
            'proposal' => $proposal,
            'review' => $review,
            'criteria' => $criteria
        ]);
    }

    /**
     * Submit Review Scores and Comments
     */
    public function submitReview(Request $request, $id)
    {
        $user = auth('api')->user();
        $validated = $request->validate([
            'scores' => 'required|array', // { criteria_id: score }
            'comment' => 'nullable|string',
            'decision' => 'required|in:accepted,rejected,revision'
        ]);

        try {
            DB::beginTransaction();

            $review = Review::where('proposal_id', $id)
                ->where('reviewer_id', $user->id)
                ->firstOrFail();

            $totalWeightedScore = 0;
            
            foreach ($validated['scores'] as $criteriaId => $scoreValue) {
                $criteria = MasterReviewCriteria::findOrFail($criteriaId);
                
                ReviewDetail::updateOrCreate(
                    ['review_id' => $review->id, 'criteria_id' => $criteriaId],
                    ['score' => $scoreValue]
                );

                $totalWeightedScore += ($scoreValue * ($criteria->weight / 100));
            }

            $review->update([
                'score' => $totalWeightedScore,
                'comment' => $validated['comment'],
                'decision' => $validated['decision']
            ]);

            // Save to Proposal Notes for Revision history
            if ($validated['decision'] === 'revision' && !empty($validated['comment'])) {
                $review->proposal->notes()->create([
                    'user_id' => $user->id,
                    'type' => 'revision',
                    'content' => $validated['comment']
                ]);

                // Send Notification to Pengusul
                $review->proposal->user->notify(new \App\Notifications\ProposalNotification(
                    $review->proposal,
                    "Usulan Anda '" . $review->proposal->title . "' memerlukan revisi dari reviewer."
                ));
            }

            DB::commit();
            return response()->json(['message' => 'Penilaian berhasil disimpan.', 'review' => $review]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan penilaian: ' . $e->getMessage()], 500);
        }
    }
}
