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
    /**
     * Batch Auto-Assign Reviewers to all submitted PKM proposals (Round-Robin)
     */
    public function batchAssign()
    {
        $submittedProposals = PkmProposal::where('status', 'submitted')->get();
        $reviewers = User::role('reviewer_pkm')->get();

        if ($reviewers->isEmpty()) {
            $reviewers = User::role('reviewer')->get();
        }

        if ($reviewers->isEmpty()) {
            return response()->json(['message' => 'Tidak ada reviewer yang tersedia dengan role reviewer_pkm.'], 422);
        }

        if ($submittedProposals->isEmpty()) {
            return response()->json(['message' => 'Tidak ada usulan baru (Submitted) yang perlu diplot.'], 200);
        }

        $count = 0;
        $reviewerCount = $reviewers->count();

        foreach ($submittedProposals as $index => $proposal) {
            $reviewer = $reviewers[$index % $reviewerCount];

            PkmReview::updateOrCreate(
                ['pkm_proposal_id' => $proposal->id, 'reviewer_id' => $reviewer->id],
                ['status' => 'pending']
            );

            $proposal->update(['status' => 'review']);
            $count++;
        }

        return response()->json([
            'message' => "Berhasil memplotting {$count} proposal PKM secara otomatis.",
            'processed_count' => $count
        ]);
    }

    /**
     * LPPM Head Approval
     */
    public function approveLppm(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'note'   => 'nullable|string'
        ]);

        $proposal = PkmProposal::findOrFail($id);
        $proposal->update([
            'lppm_approval_status' => $validated['status'],
            'lppm_approval_date'   => now(),
            'lppm_approval_note'   => $validated['note']
        ]);

        return response()->json([
            'message' => 'Persetujuan Ketua LPPM berhasil disimpan.',
            'proposal' => $proposal
        ]);
    }

    /**
     * Soft Delete a PKM Proposal (Admin)
     */
    public function destroy($id)
    {
        if (!auth()->user()->can('manage_pkm_trash')) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus proposal PKM.');
        }

        $proposal = PkmProposal::findOrFail($id);
        $proposal->delete();

        return response()->json(['message' => 'Proposal PKM berhasil dihapus ke tempat sampah.']);
    }

    /**
     * List trashed PKM proposals
     */
    public function trash(Request $request)
    {
        if (!auth()->user()->can('manage_pkm_trash')) {
            abort(403, 'Anda tidak memiliki akses untuk melihat tempat sampah PKM.');
        }

        $proposals = PkmProposal::onlyTrashed()
            ->with(['fiscalYear', 'user'])
            ->orderBy('deleted_at', 'desc')
            ->get();

        return response()->json($proposals);
    }

    /**
     * Restore a soft-deleted PKM proposal
     */
    public function restore($id)
    {
        if (!auth()->user()->can('manage_pkm_trash')) {
            abort(403, 'Anda tidak memiliki akses untuk memulihkan proposal PKM.');
        }

        $proposal = PkmProposal::onlyTrashed()->findOrFail($id);
        $proposal->restore();

        return response()->json(['message' => 'Proposal PKM berhasil dipulihkan.']);
    }

    /**
     * Force delete a PKM proposal
     */
    public function forceDelete($id)
    {
        if (!auth()->user()->can('manage_pkm_trash')) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus permanen proposal PKM.');
        }

        $proposal = PkmProposal::onlyTrashed()->findOrFail($id);
        
        // Optionally, delete related files from storage here if needed
        // e.g., Storage::disk('public')->deleteDirectory("pkm_documents/{$proposal->id}");

        $proposal->forceDelete();

        return response()->json(['message' => 'Proposal PKM berhasil dihapus secara permanen.']);
    }

    /**
     * Batch Force Delete PKM proposals
     */
    public function batchForceDelete(Request $request)
    {
        if (!auth()->user()->can('manage_pkm_trash')) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus permanen proposal PKM.');
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        $proposals = PkmProposal::onlyTrashed()->whereIn('id', $validated['ids'])->get();
        
        foreach ($proposals as $proposal) {
            $proposal->forceDelete();
        }

        return response()->json(['message' => count($proposals) . ' proposal PKM berhasil dihapus secara permanen.']);
    }
}
