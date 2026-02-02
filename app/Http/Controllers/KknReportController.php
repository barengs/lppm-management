<?php

namespace App\Http\Controllers;

use App\Models\KknReport;
use App\Models\KknReportAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KknReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = KknReport::with(['user', 'attachments', 'posto', 'histories.user']);

        // Filtering
        if ($request->has('kkn_posto_id')) {
            $query->where('kkn_posto_id', $request->kkn_posto_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('reporter_type')) {
            $query->where('reporter_type', $request->reporter_type);
        }

        // Access Control
        // Access Control
        if ($user->hasRole('mahasiswa')) {
            // Students only see their own reports
             if (!$request->has('all_group')) {
                $query->where('user_id', $user->id);
            }
        } elseif ($user->hasRole('dosen')) {
            // Dosen sees their own reports OR reports from Postos they supervise
            if ($request->target === 'self') {
                $query->where('user_id', $user->id);
            } else {
                // Fetching student reports for supervised postos
                // Find IDs of Postos where this user is DPL
                $postoIds = \App\Models\KknPosto::where('dpl_id', $user->id)->pluck('id');
                $query->whereIn('kkn_posto_id', $postoIds);
            }
        } elseif ($user->hasRole('admin') || $user->can('kkn_reports.view')) {
            // Admin or Staff with permission can view all (filtered by request params)
            // No additional restriction needed
        } else {
            // Fallback for others - block or show empty
             $query->whereRaw('0 = 1'); 
        }

        return response()->json($query->latest()->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kkn_posto_id' => 'required|exists:kkn_postos,id',
            'type' => 'required|in:weekly,final',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240', // 10MB
        ]);

        $user = Auth::user();
        $params = $request->only(['kkn_posto_id', 'type', 'week', 'title', 'description']);
        $params['user_id'] = $user->id;
        $params['reporter_type'] = $user->hasRole('dosen') ? 'dosen' : 'student';
        $params['status'] = 'submitted'; // Auto submit? or draft? Let's say submitted for now.
        $params['submitted_at'] = now();

        $report = KknReport::create($params);

        // Handle Attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                // Store file
                $path = $file->store('kkn-reports/' . $report->id, 'public');
                
                KknReportAttachment::create([
                    'kkn_report_id' => $report->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json($report->load('attachments'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $report = KknReport::with(['user', 'attachments', 'posto', 'histories.user'])->findOrFail($id);
        // Add Authorization policy check here
        return response()->json($report);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $report = KknReport::findOrFail($id);
        
        // Ensure only owner can update, and only if not approved?
        if ($report->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($report->status === 'approved') {
             return response()->json(['message' => 'Cannot edit approved report'], 403);
        }

        $report->update($request->only(['title', 'description', 'week']));

        // Handle new attachments if any (append) or replace? 
        // For simplicity, let's allow adding more.
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('kkn-reports/' . $report->id, 'public');
                KknReportAttachment::create([
                    'kkn_report_id' => $report->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json($report->load('attachments'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $report = KknReport::findOrFail($id);
        if ($report->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Delete attachments files
        foreach ($report->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }
        
        $report->delete();
        return response()->noContent();
    }

    // Custom Action: Update Status (Review)
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,revised',
            'notes' => 'nullable|string'
        ]);

        // Check permission (Dosen or Admin)
        if (!Auth::user()->can('kkn_reports.review')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $report = KknReport::findOrFail($id);
        
        // 1. Update Main Report Status & Latest Note
        $report->update([
            'status' => $request->status,
            'notes' => $request->notes
        ]);

        // 2. Create History Record
        \App\Models\KknReportHistory::create([
            'kkn_report_id' => $report->id,
            'user_id' => Auth::id(),
            'status' => $request->status,
            'note' => $request->notes
        ]);

        return response()->json($report->load('histories.user'));
    }
}
