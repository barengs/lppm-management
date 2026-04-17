<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Proposal;
use App\Models\PkmProposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * List reports for researcher (filtered by proposal or PKM)
     */
    public function index(Request $request)
    {
        $query = Report::query();
        
        if ($request->has('proposal_id')) {
            $query->where('proposal_id', $request->proposal_id);
        } elseif ($request->has('pkm_proposal_id')) {
            $query->where('pkm_proposal_id', $request->pkm_proposal_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Submit/Upload progress or final report
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'proposal_id' => 'nullable|exists:proposals,id',
            'pkm_proposal_id' => 'nullable|exists:pkm_proposals,id',
            'type' => 'required|in:progress,final,monev,logbook',
            'file' => 'required|file|mimes:pdf|max:10240', // Limit to 10MB PDF
            'comments' => 'nullable|string',
        ]);

        $user = auth('api')->user();

        // Security check
        if ($validated['proposal_id']) {
            $prop = Proposal::findOrFail($validated['proposal_id']);
            if ($prop->user_id !== $user->id) return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($validated['pkm_proposal_id']) {
            $pkm = PkmProposal::findOrFail($validated['pkm_proposal_id']);
            if ($pkm->user_id !== $user->id) return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Handle File Upload
        $dest = ($validated['proposal_id']) 
            ? "reports/research/{$validated['proposal_id']}" 
            : "reports/pkm/{$validated['pkm_proposal_id']}";

        $path = $request->file('file')->store($dest, 'public');

        $report = Report::create([
            'proposal_id'     => $validated['proposal_id'],
            'pkm_proposal_id' => $validated['pkm_proposal_id'],
            'type'            => $validated['type'],
            'file_path'       => $path,
            'original_name'   => $request->file('file')->getClientOriginalName(),
            'status'          => 'submitted',
            'comments'        => $validated['comments']
        ]);

        return response()->json($report, 201);
    }

    /**
     * Admin: List all reports for monitoring
     */
    public function adminIndex()
    {
        $reports = Report::with(['proposal.user', 'pkmProposal.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reports);
    }

    /**
     * Admin/Reviewer: Update report status
     */
    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:approved,revision',
            'comments' => 'nullable|string'
        ]);

        $report->update($validated);

        return response()->json([
            'message' => 'Status laporan berhasil diupdate.',
            'report' => $report
        ]);
    }

    /**
     * Download Report
     */
    public function download($id)
    {
        $report = Report::findOrFail($id);
        if (!Storage::disk('public')->exists($report->file_path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }
        
        return Storage::disk('public')->download($report->file_path, $report->original_name);
    }
}
