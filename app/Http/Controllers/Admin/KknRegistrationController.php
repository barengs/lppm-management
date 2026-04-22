<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KknRegistration;
use App\Models\KknRegistrationLog;
use App\Exports\KknParticipantsExport;
use App\Exports\KknJacketSizeExport;
use App\Exports\KknGenderExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

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

        // Filter by Prodi
        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->whereHas('student.mahasiswaProfile', function($q) use ($request) {
                $q->where('prodi', $request->prodi_id);
            });
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
            'student.mahasiswaProfile.faculty',
            'student.mahasiswaProfile.studyProgram',
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
     * Update registration details (e.g. registration type)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'registration_type' => 'required|string|in:reguler,progsus,santri',
            // Or add any other fields you want Admin to be able to edit later
        ]);

        $registration = KknRegistration::findOrFail($id);

        DB::transaction(function () use ($registration, $request) {
            $oldType = $registration->registration_type;
            
            $registration->update([
                'registration_type' => $request->registration_type,
            ]);

            // Create log if type changed
            if ($oldType !== $request->registration_type) {
                KknRegistrationLog::create([
                    'registration_id' => $registration->id,
                    'created_by' => Auth::id(),
                    'action' => 'updated',
                    'old_status' => $registration->status,
                    'new_status' => $registration->status,
                    'note' => "Admin mengubah jenis pendaftaran dari '{$oldType}' menjadi '{$request->registration_type}'",
                ]);
            }
        });

        return response()->json([
            'message' => 'Data pendaftaran berhasil diperbarui',
            'registration' => $registration->fresh(['student', 'reviewer'])
        ]);
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

            // Notify student
            $registration->student->notify(new \App\Notifications\KknStatusNotification($registration, 'approved', $request->note));
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

            // Notify student
            $registration->student->notify(new \App\Notifications\KknStatusNotification($registration, 'rejected', $request->note));
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

            // Notify student
            $registration->student->notify(new \App\Notifications\KknStatusNotification($registration, 'needs_revision', $request->note));
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
        $registrations = KknRegistration::with(['student.mahasiswaProfile.faculty', 'student.mahasiswaProfile.studyProgram', 'location'])->get();

        $stats = [
            'total' => $registrations->count(),
            'pending' => $registrations->where('status', 'pending')->count(),
            'approved' => $registrations->where('status', 'approved')->count(),
            'rejected' => $registrations->where('status', 'rejected')->count(),
            'needs_revision' => $registrations->where('status', 'needs_revision')->count(),
            'by_faculty' => [],
            'by_prodi' => [],
            'by_jacket_size' => [],
            'by_location' => [],
            'map_data' => []
        ];

        $byFaculty = [];
        $byProdi = [];
        $byJacketSize = [];
        $byLocation = [];

        foreach ($registrations as $reg) {
            $profile = $reg->student->mahasiswaProfile ?? null;

            // Faculty
            $facultyName = ($profile && $profile->faculty) ? $profile->faculty->name : ($profile->fakultas ?? 'Tidak Diketahui');
            $byFaculty[$facultyName] = ($byFaculty[$facultyName] ?? 0) + 1;

            // Prodi
            $prodiName = ($profile && $profile->studyProgram) ? $profile->studyProgram->name : ($profile->prodi ?? 'Tidak Diketahui');
            $byProdi[$prodiName] = ($byProdi[$prodiName] ?? 0) + 1;

            // Jacket Size
            $jacket = ($profile && $profile->jacket_size) ? $profile->jacket_size : 'Tidak Diketahui';
            $byJacketSize[$jacket] = ($byJacketSize[$jacket] ?? 0) + 1;

            // Location
            $locationName = $reg->location ? $reg->location->name : 'Belum Ditentukan';
            $byLocation[$locationName] = ($byLocation[$locationName] ?? 0) + 1;
        }

        // Format for Recharts
        $formatChartData = function($counts) {
            $data = [];
            foreach ($counts as $name => $val) {
                $data[] = ['name' => (string)$name, 'value' => $val];
            }
            usort($data, fn($a, $b) => $b['value'] <=> $a['value']);
            return $data;
        };

        $stats['by_faculty'] = $formatChartData($byFaculty);
        $stats['by_prodi'] = $formatChartData($byProdi);
        $stats['by_jacket_size'] = $formatChartData($byJacketSize);
        $stats['by_location'] = $formatChartData($byLocation);

        $locationsWithCoords = \App\Models\KknLocation::whereNotNull('latitude')->whereNotNull('longitude')->withCount('registrations')->get();
        $stats['map_data'] = $locationsWithCoords->map(function($loc) {
            return [
                'id' => $loc->id,
                'name' => $loc->name,
                'latitude' => $loc->latitude,
                'longitude' => $loc->longitude,
                'participants_count' => $loc->registrations_count,
            ];
        });

        return response()->json($stats);
    }

    /**
     * Export registrations as PDF
     */
    public function exportPdf(Request $request)
    {
        $query = KknRegistration::with(['student.mahasiswaProfile.faculty', 'student.mahasiswaProfile.studyProgram', 'location', 'fiscalYear'])
            ->orderBy('created_at', 'desc');

        // Apply same filters as Index
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->whereHas('student.mahasiswaProfile', function($q) use ($request) {
                $q->where('prodi', $request->prodi_id);
            });
        }

        if ($request->has('search') && $request->search) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $registrations = $query->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.kkn_registrations', [
            'registrations' => $registrations,
            'filters' => [
                'status' => $request->status ?? 'semua',
                'prodi' => $request->prodi_id ? \App\Models\StudyProgram::find($request->prodi_id)?->name : 'Semua Prodi',
                'search' => $request->search ?? null,
            ]
        ]);
        
        $pdf->setPaper('A4', 'landscape');
        return $pdf->stream('Rekap-Pendaftar-KKN.pdf');
    }

    /**
     * Export registrations as Excel
     */
    public function exportExcel(Request $request)
    {
        $filename = 'Rekap-Peserta-KKN-' . now()->format('Ymd-His') . '.xlsx';
        return Excel::download(new KknParticipantsExport($request), $filename);
    }

    /**
     * Export jacket size recap as Excel
     */
    public function exportJacketSize(Request $request)
    {
        $filename = 'Rekap-Ukuran-Jaket-KKN-' . now()->format('Ymd-His') . '.xlsx';
        return Excel::download(new KknJacketSizeExport($request), $filename);
    }

    /**
     * Export gender recap as Excel
     */
    public function exportGender(Request $request)
    {
        $filename = 'Rekap-Jenis-Kelamin-KKN-' . now()->format('Ymd-His') . '.xlsx';
        return Excel::download(new KknGenderExport($request), $filename);
    }
}
