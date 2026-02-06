<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KknRegistration;
use App\Models\KknRegistrationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class KknRegistrationController extends Controller
{
    /**
     * Get all registrations with filters
     */
    public function index(Request $request)
    {
        $query = KknRegistration::with(['student', 'location', 'fiscalYear', 'reviewer'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by name or NIM
        if ($request->has('search') && $request->search) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $registrations = $query->paginate($request->per_page ?? 10);

        return response()->json($registrations);
    }

    /**
     * Get registration detail with logs
     */
    public function show($id)
    {
        $registration = KknRegistration::with([
            'student.mahasiswaProfile',
            'location',
            'fiscalYear',
            'dpl',
            'reviewer',
            'logs.creator',
            'kknRegistrationDocuments'
        ])->findOrFail($id);

        return response()->json($registration);
    }

    /**
     * Approve registration
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'note' => 'nullable|string|max:1000',
        ]);

        $registration = KknRegistration::findOrFail($id);

        // Check if already approved or rejected
        if (in_array($registration->status, ['approved', 'rejected'])) {
            return response()->json([
                'message' => 'Registration sudah diproses sebelumnya'
            ], 422);
        }

        DB::transaction(function () use ($registration, $request) {
            $oldStatus = $registration->status;

            // Update registration
            $registration->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            // Create log
            KknRegistrationLog::create([
                'registration_id' => $registration->id,
                'created_by' => Auth::id(),
                'action' => 'approved',
                'old_status' => $oldStatus,
                'new_status' => 'approved',
                'note' => $request->note ?? 'Pendaftaran disetujui',
            ]);
        });

        return response()->json([
            'message' => 'Pendaftaran berhasil disetujui',
            'registration' => $registration->fresh(['student', 'reviewer'])
        ]);
    }

    /**
     * Reject registration
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $registration = KknRegistration::findOrFail($id);

        // Check if already approved or rejected
        if (in_array($registration->status, ['approved', 'rejected'])) {
            return response()->json([
                'message' => 'Registration sudah diproses sebelumnya'
            ], 422);
        }

        DB::transaction(function () use ($registration, $request) {
            $oldStatus = $registration->status;

            // Update registration
            $registration->update([
                'status' => 'rejected',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            // Create log
            KknRegistrationLog::create([
                'registration_id' => $registration->id,
                'created_by' => Auth::id(),
                'action' => 'rejected',
                'old_status' => $oldStatus,
                'new_status' => 'rejected',
                'note' => $request->note,
            ]);
        });

        return response()->json([
            'message' => 'Pendaftaran ditolak',
            'registration' => $registration->fresh(['student', 'reviewer'])
        ]);
    }

    /**
     * Request revision
     */
    public function requestRevision(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $registration = KknRegistration::findOrFail($id);

        // Check if already approved or rejected
        if (in_array($registration->status, ['approved', 'rejected'])) {
            return response()->json([
                'message' => 'Registration sudah diproses sebelumnya'
            ], 422);
        }

        DB::transaction(function () use ($registration, $request) {
            $oldStatus = $registration->status;

            // Update registration
            $registration->update([
                'status' => 'needs_revision',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            // Create log
            KknRegistrationLog::create([
                'registration_id' => $registration->id,
                'created_by' => Auth::id(),
                'action' => 'needs_revision',
                'old_status' => $oldStatus,
                'new_status' => 'needs_revision',
                'note' => $request->note,
            ]);
        });

        return response()->json([
            'message' => 'Permintaan revisi berhasil dikirim',
            'registration' => $registration->fresh(['student', 'reviewer'])
        ]);
    }

    /**
     * Add comment/note
     */
    public function addNote(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $registration = KknRegistration::findOrFail($id);

        // Create log
        $log = KknRegistrationLog::create([
            'registration_id' => $registration->id,
            'created_by' => Auth::id(),
            'action' => 'comment',
            'old_status' => $registration->status,
            'new_status' => $registration->status,
            'note' => $request->note,
        ]);

        return response()->json([
            'message' => 'Catatan berhasil ditambahkan',
            'log' => $log->load('creator')
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => KknRegistration::count(),
            'pending' => KknRegistration::where('status', 'pending')->count(),
            'approved' => KknRegistration::where('status', 'approved')->count(),
            'rejected' => KknRegistration::where('status', 'rejected')->count(),
            'needs_revision' => KknRegistration::where('status', 'needs_revision')->count(),
        ];

        return response()->json($stats);
    }
}
