<?php

namespace App\Http\Controllers;

use App\Models\KknPosto;
use App\Models\KknPostoMember;
use App\Models\KknRegistration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KknPostoController extends Controller
{
    /**
     * List all postos (Admin)
     */
    public function index(Request $request)
    {
        $user = auth('api')->user();
        $query = KknPosto::with(['location', 'fiscalYear', 'dpl', 'members']);

        // RESTRICT: Dosen only sees their supervised Postos
        if ($user && $user->role === 'dosen') {
            $query->where('dpl_id', $user->id);
        }

        // Filters - use filled() to ignore empty strings
        if ($request->filled('fiscal_year_id')) {
            $query->where('fiscal_year_id', $request->fiscal_year_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location_id')) {
            $query->where('kkn_location_id', $request->location_id);
        }

        $postos = $query->get()->map(function ($posto) {
            return [
                'id' => $posto->id,
                'name' => $posto->name,
                'location' => $posto->location,
                'fiscal_year' => $posto->fiscalYear,
                'dpl' => $posto->dpl,
                'status' => $posto->status,
                'member_count' => $posto->getMemberCount(),
                'is_complete' => $posto->isComplete(),
                'start_date' => $posto->start_date,
                'end_date' => $posto->end_date,
                'created_at' => $posto->created_at,
            ];
        });

        return response()->json($postos);
    }

    /**
     * Import Postos from Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xls,xlsx'
        ]);

        try {
            DB::beginTransaction();
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\KknPostoImport, $request->file('file'));
            DB::commit();

            return response()->json(['message' => 'Data posko berhasil diimport']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal import data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download Template
     */
    public function downloadTemplate()
    {
        // Simple CSV template generation
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_import_posko.csv"',
        ];

        $columns = ['nama_posko', 'lokasi_id', 'nama_lokasi', 'tahun_ajaran', 'kapasitas_laki', 'kapasitas_perempuan', 'deskripsi'];
        
        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            // Example row
            fputcsv($file, ['Posko Desa A', '1', 'Desa Maju Jaya', date('Y'), '10', '10', 'Deskripsi posko...']);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Create new posto (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'kkn_location_id' => 'required|exists:kkn_locations,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'dpl_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        // Validate DPL is a dosen
        if ($validated['dpl_id']) {
            $dpl = User::find($validated['dpl_id']);
            if ($dpl->role !== 'dosen') {
                return response()->json(['message' => 'DPL harus memiliki role dosen'], 422);
            }
        }

        // Check if posto already exists for this location and fiscal year
        $exists = KknPosto::where('kkn_location_id', $validated['kkn_location_id'])
            ->where('fiscal_year_id', $validated['fiscal_year_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Posko sudah ada untuk lokasi dan tahun ajaran ini'
            ], 422);
        }

        $posto = KknPosto::create($validated);
        $posto->load(['location', 'fiscalYear', 'dpl']);

        return response()->json($posto, 201);
    }

    /**
     * Get posto details
     */
    public function show($id)
    {
        $posto = KknPosto::with([
            'location',
            'fiscalYear',
            'dpl',
            'members.student.mahasiswaProfile.faculty',
            'members.student.mahasiswaProfile.studyProgram',
        ])->findOrFail($id);

        return response()->json([
            'id' => $posto->id,
            'name' => $posto->name,
            'location' => $posto->location,
            'fiscal_year' => $posto->fiscalYear,
            'dpl' => $posto->dpl,
            'status' => $posto->status,
            'start_date' => $posto->start_date,
            'end_date' => $posto->end_date,
            'description' => $posto->description,
            'member_count' => $posto->getMemberCount(),
            'is_complete' => $posto->isComplete(),
            'members' => $posto->members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'student' => $member->student,
                    'position' => $member->position,
                    'position_name' => $member->position_name,
                    'status' => $member->status,
                    'joined_at' => $member->joined_at,
                    'notes' => $member->notes,
                ];
            }),
            'created_at' => $posto->created_at,
            'updated_at' => $posto->updated_at,
        ]);
    }

    /**
     * Update posto (Admin)
     */
    public function update(Request $request, $id)
    {
        $posto = KknPosto::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'kkn_location_id' => 'sometimes|exists:kkn_locations,id',
            'fiscal_year_id' => 'sometimes|exists:fiscal_years,id',
            'dpl_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        // Validate DPL if provided
        if (isset($validated['dpl_id']) && $validated['dpl_id']) {
            $dpl = User::find($validated['dpl_id']);
            if ($dpl->role !== 'dosen') {
                return response()->json(['message' => 'DPL harus memiliki role dosen'], 422);
            }
        }

        $posto->update($validated);
        $posto->load(['location', 'fiscalYear', 'dpl']);

        return response()->json($posto);
    }

    /**
     * Update posto status (Admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $posto = KknPosto::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:draft,active,completed',
        ]);

        // Validate posto is complete before activating
        if ($validated['status'] === 'active' && !$posto->isComplete()) {
            return response()->json([
                'message' => 'Posko harus memiliki Kordes, Sekretaris, dan Bendahara sebelum diaktifkan'
            ], 422);
        }

        $posto->update(['status' => $validated['status']]);

        return response()->json($posto);
    }

    /**
     * Delete posto (Admin)
     */
    public function destroy($id)
    {
        $posto = KknPosto::findOrFail($id);
        $posto->delete();

        return response()->noContent();
    }

    /**
     * Get posto members
     */
    public function members($id)
    {
        $posto = KknPosto::findOrFail($id);
        $members = $posto->members()
            ->with([
                'student.mahasiswaProfile.faculty',
                'student.mahasiswaProfile.studyProgram'
            ])
            ->get();

        return response()->json($members->map(function ($member) {
            return [
                'id' => $member->id,
                'student' => $member->student,
                'position' => $member->position,
                'position_name' => $member->position_name,
                'status' => $member->status,
                'status_badge' => $member->status_badge,
                'joined_at' => $member->joined_at,
                'notes' => $member->notes,
            ];
        }));
    }

    /**
     * Add member to posto (Admin)
     */
    public function addMember(Request $request, $id)
    {
        $posto = KknPosto::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'position' => 'required|in:kordes,sekretaris,bendahara,humas,publikasi,anggota',
            'joined_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Validate student role
        $student = User::find($validated['student_id']);
        if ($student->role !== 'mahasiswa') {
            return response()->json(['message' => 'User harus memiliki role mahasiswa'], 422);
        }

        // Check if student already in this posto
        $exists = KknPostoMember::where('kkn_posto_id', $posto->id)
            ->where('student_id', $validated['student_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Mahasiswa sudah terdaftar di posko ini'], 422);
        }

        // Check position limits
        if (in_array($validated['position'], ['kordes', 'sekretaris', 'bendahara'])) {
            $count = KknPostoMember::where('kkn_posto_id', $posto->id)
                ->where('position', $validated['position'])
                ->count();

            if ($count >= 1) {
                return response()->json([
                    'message' => 'Posisi ' . $validated['position'] . ' sudah terisi'
                ], 422);
            }
        }

        if (in_array($validated['position'], ['humas', 'publikasi'])) {
            $count = KknPostoMember::where('kkn_posto_id', $posto->id)
                ->where('position', $validated['position'])
                ->count();

            if ($count >= 2) {
                return response()->json([
                    'message' => 'Posisi ' . $validated['position'] . ' sudah penuh (max 2)'
                ], 422);
            }
        }

        // Find student's registration
        $registration = KknRegistration::where('student_id', $validated['student_id'])
            ->where('kkn_location_id', $posto->kkn_location_id)
            ->where('fiscal_year_id', $posto->fiscal_year_id)
            ->where('status', 'approved')
            ->first();

        $member = KknPostoMember::create([
            'kkn_posto_id' => $posto->id,
            'student_id' => $validated['student_id'],
            'kkn_registration_id' => $registration?->id,
            'position' => $validated['position'],
            'joined_at' => $validated['joined_at'] ?? now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update registration with posto_id
        if ($registration) {
            $registration->update(['kkn_posto_id' => $posto->id]);
        }

        $member->load('student.mahasiswaProfile');

        return response()->json($member, 201);
    }

    /**
     * Update member position (Admin)
     */
    public function updateMember(Request $request, $postoId, $memberId)
    {
        $member = KknPostoMember::where('kkn_posto_id', $postoId)
            ->findOrFail($memberId);

        $validated = $request->validate([
            'position' => 'sometimes|in:kordes,sekretaris,bendahara,humas,publikasi,anggota',
            'status' => 'sometimes|in:active,inactive,withdrawn',
            'notes' => 'nullable|string',
        ]);

        // Check position limits if changing position
        if (isset($validated['position']) && $validated['position'] !== $member->position) {
            if (in_array($validated['position'], ['kordes', 'sekretaris', 'bendahara'])) {
                $count = KknPostoMember::where('kkn_posto_id', $postoId)
                    ->where('position', $validated['position'])
                    ->where('id', '!=', $memberId)
                    ->count();

                if ($count >= 1) {
                    return response()->json([
                        'message' => 'Posisi ' . $validated['position'] . ' sudah terisi'
                    ], 422);
                }
            }
        }

        $member->update($validated);
        $member->load('student.mahasiswaProfile');

        return response()->json($member);
    }

    /**
     * Remove member from posto (Admin)
     */
    public function removeMember($postoId, $memberId)
    {
        $member = KknPostoMember::where('kkn_posto_id', $postoId)
            ->findOrFail($memberId);

        // Update registration to remove posto_id
        if ($member->kkn_registration_id) {
            KknRegistration::find($member->kkn_registration_id)
                ->update(['kkn_posto_id' => null]);
        }

        $member->delete();

        return response()->noContent();
    }

    /**
     * Get available students for assignment (Admin)
     */
    public function availableStudents(Request $request)
    {
        $validated = $request->validate([
            'kkn_location_id' => 'nullable|exists:kkn_locations,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
        ]);

        // Get approved registrations for this year
        // Filter out students who are already assigned to ANY posto in this fiscal year (checking kkn_posto_members table)
        
        $assignedStudentIds = KknPostoMember::whereHas('posto', function($q) use ($validated) {
            $q->where('fiscal_year_id', $validated['fiscal_year_id']);
        })->pluck('student_id');

        $query = KknRegistration::with(['student.mahasiswaProfile.faculty', 'student.mahasiswaProfile.studyProgram'])
            ->where('fiscal_year_id', $validated['fiscal_year_id'])
            ->where('status', 'approved')
            ->whereNull('kkn_posto_id') // Keep this for redundancy
            ->whereNotIn('student_id', $assignedStudentIds); // Strict check against member table

        // Optionally filter by location if provided
        if (!empty($validated['kkn_location_id'])) {
            $query->where('kkn_location_id', $validated['kkn_location_id']);
        }

        $students = $query->get()->map(function ($reg) {
            return [
                'registration_id' => $reg->id,
                'student' => $reg->student,
            ];
        });

        return response()->json($students);
    }

    /**
     * Bulk assign students to posto (Admin)
     */
    public function bulkAssignStudents(Request $request, $id)
    {
        $posto = KknPosto::findOrFail($id);

        $validated = $request->validate([
            'students' => 'required|array',
            'students.*.student_id' => 'required|exists:users,id',
            'students.*.position' => 'required|in:kordes,sekretaris,bendahara,humas,publikasi,anggota',
        ]);

        $assigned = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($validated['students'] as $studentData) {
                // Check if already exists
                $exists = KknPostoMember::where('kkn_posto_id', $posto->id)
                    ->where('student_id', $studentData['student_id'])
                    ->exists();

                if ($exists) {
                    $errors[] = "Student ID {$studentData['student_id']} sudah terdaftar";
                    continue;
                }

                // Find registration
                $registration = KknRegistration::where('student_id', $studentData['student_id'])
                    ->where('kkn_location_id', $posto->kkn_location_id)
                    ->where('fiscal_year_id', $posto->fiscal_year_id)
                    ->where('status', 'approved')
                    ->first();

                if (!$registration) {
                    $errors[] = "Student ID {$studentData['student_id']} tidak memiliki registrasi approved";
                    continue;
                }

                // Create member
                $member = KknPostoMember::create([
                    'kkn_posto_id' => $posto->id,
                    'student_id' => $studentData['student_id'],
                    'kkn_registration_id' => $registration->id,
                    'position' => $studentData['position'],
                    'joined_at' => now(),
                ]);

                // Update registration
                $registration->update(['kkn_posto_id' => $posto->id]);

                $assigned[] = $member->id;
            }

            DB::commit();

            return response()->json([
                'message' => 'Bulk assignment completed',
                'assigned_count' => count($assigned),
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Bulk assignment failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get student's posto (Student)
     */
    /**
     * Get student's (or DPL's) posto
     */
    public function myPosto()
    {
        $user = auth('api')->user();

        if ($user->role === 'mahasiswa') {
             // Find student's posto membership
            $membership = KknPostoMember::with([
                'posto.location',
                'posto.fiscalYear',
                'posto.dpl',
            ])->where('student_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$membership) {
                return response()->json(['message' => 'Anda belum tergabung dalam posko'], 404);
            }

            $posto = $membership->posto;
            $position = $membership->position;
            $positionName = $membership->position_name;
            $joinedAt = $membership->joined_at;

        } elseif ($user->role === 'dosen') {
             // Find posto managed by DPL
             // DPL should see their posto regardless of status (even draft)
             $posto = KknPosto::with(['location', 'fiscalYear', 'dpl'])
                ->where('dpl_id', $user->id)
                // ->where('status', '!=', 'draft') // Removed to allow access to draft postos
                ->latest()
                ->first();
             
             if (!$posto) {
                 return response()->json(['message' => 'Anda belum ditunjuk sebagai DPL untuk posko manapun'], 404);
             }

             $position = 'dpl';
             $positionName = 'Dosen Pembimbing Lapangan';
             $joinedAt = $posto->created_at; 
        } else {
             return response()->json(['message' => 'Role tidak memiliki akses ke endpoint ini'], 403);
        }

        return response()->json([
            'posto' => [
                'id' => $posto->id,
                'name' => $posto->name,
                'location' => $posto->location,
                'fiscal_year' => $posto->fiscalYear,
                'dpl' => $posto->dpl,
                'status' => $posto->status,
                'start_date' => $posto->start_date,
                'end_date' => $posto->end_date,
                'description' => $posto->description,
            ],
            'my_position' => $position,
            'my_position_name' => $positionName,
            'joined_at' => $joinedAt,
        ]);
    }

    /**
     * Get posto members (Student)
     */
    /**
     * Get posto members (Student or DPL)
     */
    public function myPostoMembers()
    {
        $user = auth('api')->user();

        $postoId = null;

        if ($user->role === 'mahasiswa') {
            $membership = KknPostoMember::where('student_id', $user->id)
                ->where('status', 'active')
                ->first();
            
            if (!$membership) {
                return response()->json(['message' => 'Anda belum tergabung dalam posko'], 404);
            }
            $postoId = $membership->kkn_posto_id;
        } elseif ($user->role === 'dosen') {
             $posto = KknPosto::where('dpl_id', $user->id)
                // ->where('status', '!=', 'draft') // Removed
                ->latest()
                ->first();
             
             if (!$posto) {
                 return response()->json(['message' => 'Anda belum ditunjuk sebagai DPL posko'], 404);
             }
             $postoId = $posto->id;
        } else {
             return response()->json(['message' => 'Role tidak memiliki akses ke endpoint ini'], 403);
        }

        $members = KknPostoMember::with([
            'student.mahasiswaProfile.faculty',
            'student.mahasiswaProfile.studyProgram'
        ])
            ->where('kkn_posto_id', $postoId)
            ->where('status', 'active')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'student' => $member->student,
                    'position' => $member->position,
                    'position_name' => $member->position_name,
                    'joined_at' => $member->joined_at,
                ];
            });

        return response()->json($members);
    }
}
