<?php

namespace App\Http\Controllers;

use App\Models\KknRegistration;
use App\Models\KknLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KknRegistrationController extends Controller
{
    /**
     * List registrations.
     * Admin: See all.
     * Student: See own.
     */
    public function index()
    {
        $user = auth('api')->user();

        // Students only see their own registrations
        if ($user->role === 'mahasiswa') {
            return response()->json(KknRegistration::with(['location', 'dpl', 'kknRegistrationDocuments'])->where('student_id', $user->id)->get());
        }

        // Admin sees all submitted registrations, formatted for table
        return response()->json(
            KknRegistration::with(['student.mahasiswaProfile.faculty', 'student.mahasiswaProfile.studyProgram', 'location', 'dpl', 'kknRegistrationDocuments'])
                ->where('status', '!=', 'draft')
                ->get()
        );
    }

    /**
     * Student registers for a location.
     */
    public function store(Request $request)
    {
        $user = auth('api')->user();
        $isAdmin = $user->role === 'admin' || $user->role === 'staff'; // Assuming staff can also register?? Let's stick to admin for now based on request.
        
        $isDraft = $request->input('is_draft', false);
        $currentStep = $request->input('current_step', 1);

        $rules = [
            // Registration Data
            'kkn_location_id' => 'nullable|exists:kkn_locations,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'registration_type' => $isDraft ? 'nullable|in:reguler,program_khusus,santri' : 'required|in:reguler,program_khusus,santri',
            
            // Profile Data
            'name' => $isDraft ? 'nullable|string|max:255' : 'required|string|max:255',
            'npm' => $isDraft ? 'nullable|string|max:255' : 'required|string|max:255',
            'prodi' => $isDraft ? 'nullable|string' : 'required|string',
            'fakultas' => $isDraft ? 'nullable|string' : 'required|string',
            'phone' => $isDraft ? 'nullable|string' : 'required|string',
            'address' => $isDraft ? 'nullable|string' : 'required|string',
            'ips' => $isDraft ? 'nullable|numeric|min:0|max:4.00' : 'required|numeric|min:0|max:4.00',
            'gender' => $isDraft ? 'nullable|in:L,P' : 'required|in:L,P',
            'place_of_birth' => $isDraft ? 'nullable|string' : 'required|string',
            'date_of_birth' => $isDraft ? 'nullable|date' : 'required|date',
            'jacket_size' => $isDraft ? 'nullable|in:S,M,L,XL,XXL,XXXL' : 'required|in:S,M,L,XL,XXL,XXXL',
            
            // Documents & Photo
            'documents' => 'array',
            'documents.*.name' => $isDraft ? 'nullable|string' : 'required|string',
            'documents.*.file' => $isDraft ? 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120' : 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];

        // Extended validation for Admin creating new user (Admins don't usually create drafts)
        if ($isAdmin) {
             $rules['email'] = 'required|email|unique:users,email';
             $rules['password'] = 'required|string|min:6';
        }

        $validated = $request->validate($rules);

        // Check Quota only if location is selected
        if (!empty($validated['kkn_location_id'])) {
            $location = KknLocation::find($validated['kkn_location_id']);
            $count = KknRegistration::where('kkn_location_id', $location->id)->count();
            if ($count >= $location->quota) {
                return response()->json(['message' => 'Quota penuh for this location.'], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Determine Target User
            if ($isAdmin) {
                // Create New User
                $targetUser = \App\Models\User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => bcrypt($validated['password']),
                    'role' => 'mahasiswa',
                ]);
            } else {
                // Student registering themselves
                $targetUser = $user;
                
                // Get Fiscal Year and corresponding KKN Period
                $fiscalYear = \App\Models\FiscalYear::find($validated['fiscal_year_id']);
                $kknPeriod = \App\Models\KknPeriod::where('year', $fiscalYear->year)->first();

                if (!$kknPeriod) {
                     // Auto-create if not exists (safety net for transition)
                     $kknPeriod = \App\Models\KknPeriod::create([
                        'name' => 'KKN ' . $fiscalYear->year,
                        'year' => $fiscalYear->year,
                        'start_date' => $fiscalYear->year . '-01-01',
                        'end_date' => $fiscalYear->year . '-12-31',
                        'is_active' => $fiscalYear->is_active,
                     ]);
                }

                // Check for Active Registration Wave (RegistrationPeriod)
                $now = now();
                $activeWave = $kknPeriod->registrationPeriods()
                    ->where('is_active', true)
                    ->whereDate('start_date', '<=', $now)
                    ->whereDate('end_date', '>=', $now)
                    ->first();

                if (!$activeWave && !$isAdmin) {
                    return response()->json(['message' => 'Pendaftaran KKN saat ini ditutup. Tidak ada gelombang pendaftaran yang aktif.'], 400);
                }

                // Check for existing registration/draft
                $existingReg = KknRegistration::where('student_id', $targetUser->id)
                    ->where('fiscal_year_id', $validated['fiscal_year_id'])
                    ->first();
                
                if ($existingReg) {
                    if (!$isDraft && $existingReg->status !== 'draft') {
                        return response()->json(['message' => 'You are already registered for this period.'], 400);
                    }
                    // For drafts, we will update the existing record later in the flow
                    $reg = $existingReg;
                }

                // Update User Data (Name) - only if provided
                if (isset($validated['name'])) {
                    $targetUser->update(['name' => $validated['name']]);
                }
            }

            // Update/Create Profile Data - only if fields are present
            $profileUpdate = array_filter([
                'npm' => $validated['npm'] ?? null,
                'prodi' => $validated['prodi'] ?? null,
                'fakultas' => $validated['fakultas'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'ips' => $validated['ips'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'place_of_birth' => $validated['place_of_birth'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'jacket_size' => $validated['jacket_size'] ?? null,
            ], fn($value) => !is_null($value));

            if (!empty($profileUpdate)) {
                $targetUser->mahasiswaProfile()->updateOrCreate(
                    ['user_id' => $targetUser->id],
                    $profileUpdate
                );
            }

            // Handle Photo (Shared logic)
            if ($request->hasFile('photo')) {
                 $photoPath = $request->file('photo')->store('kkn_photos', 'public');
                 $targetUser->mahasiswaProfile()->update(['avatar' => $photoPath]); 
            }
            
            // Resolve KKN Period ID again for saving (in case it wasn't resolved in student block)
            if (!isset($kknPeriod)) {
                $fiscalYear = \App\Models\FiscalYear::find($validated['fiscal_year_id']);
                $kknPeriod = \App\Models\KknPeriod::where('year', $fiscalYear->year)->first();
            }

            // Create or Update Registration
            $data = [
                'student_id' => $targetUser->id,
                'kkn_location_id' => $validated['kkn_location_id'] ?? ($reg->kkn_location_id ?? null),
                'fiscal_year_id' => $validated['fiscal_year_id'],
                'kkn_period_id' => $kknPeriod ? $kknPeriod->id : ($reg->kkn_period_id ?? null),
                'registration_type' => $validated['registration_type'] ?? ($reg->registration_type ?? null),
                'status' => $isDraft ? 'draft' : 'pending',
                'current_step' => $currentStep,
            ];
            
            if (isset($reg)) {
                $reg->update($data);
            } else {
                $reg = KknRegistration::create($data);
            }

            // Handle Dynamic Documents
            if ($request->has('documents')) {
                $docs = $request->documents;
                foreach ($docs as $index => $docData) {
                    if ($request->hasFile("documents.{$index}.file")) {
                        $file = $request->file("documents.{$index}.file");
                        $path = $file->store('kkn_documents', 'public');
                        
                        // Delete old document with same type/name if exists
                        $reg->kknRegistrationDocuments()
                            ->where('doc_type', $docData['type'] ?? 'custom')
                            ->where('name', $docData['name'] ?? 'Dokumen')
                            ->delete();

                        $reg->kknRegistrationDocuments()->create([
                            'name' => $docData['name'] ?? 'Dokumen',
                            'file_path' => $path,
                            'file_type' => $file->extension(),
                            'doc_type' => $docData['type'] ?? 'custom', 
                        ]);
                    }
                }
            }
            
            // Handle standalone photo if needed (legacy/fallback)
            if ($request->hasFile('photo')) {
                 $path = $request->file('photo')->store('kkn_photos', 'public');
                 $reg->kknRegistrationDocuments()->create([
                    'name' => 'Pas Foto',
                    'file_path' => $path,
                    'file_type' => $request->file('photo')->extension(),
                    'doc_type' => 'required_photo',
                ]);
            }
            
            DB::commit();
            return response()->json($reg, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, KknRegistration $kknRegistration)
    {
        $user = auth('api')->user();

        // Admin updates status or assigns DPL
        if ($user->role !== 'mahasiswa') {
            $validated = $request->validate([
                'dpl_id' => 'nullable|exists:users,id',
                'status' => 'in:pending,approved,rejected,needs_revision',
                'notes' => 'nullable|string',
                'validation_notes' => 'nullable|string',
            ]);

            DB::beginTransaction();
            try {
                $kknRegistration->update($validated);
                DB::commit();
                return response()->json($kknRegistration);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Update failed: ' . $e->getMessage()], 500);
            }
        }

        // Student updates their own registration
        if ($kknRegistration->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($kknRegistration->status, ['pending', 'needs_revision'])) {
            return response()->json(['message' => 'Hanya pendaftaran dengan status Pending atau Perlu Revisi yang dapat diedit.'], 403);
        }

        $rules = [
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'registration_type' => 'required|in:reguler,program_khusus,santri',
            
            // Profile Data
            'name' => 'required|string|max:255',
            'npm' => 'required|string|max:255',
            'prodi' => 'required|string',
            'fakultas' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
            'ips' => 'required|numeric|min:0|max:4.00',
            'gender' => 'required|in:L,P',
            'place_of_birth' => 'required|string',
            'date_of_birth' => 'required|date',
            'jacket_size' => 'required|in:S,M,L,XL,XXL,XXXL',
            
            // Documents & Photo
            'documents' => 'array',
            'documents.*.name' => 'required|string',
            'documents.*.file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            // Update User Data
            $user->update(['name' => $validated['name']]);

            // Update Profile Data
            $user->mahasiswaProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'npm' => $validated['npm'],
                    'prodi' => $validated['prodi'],
                    'fakultas' => $validated['fakultas'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'ips' => $validated['ips'],
                    'gender' => $validated['gender'],
                    'place_of_birth' => $validated['place_of_birth'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'jacket_size' => $validated['jacket_size'],
                ]
            );

            // Fetch KKN Period based on Fiscal Year
            $fiscalYear = \App\Models\FiscalYear::find($validated['fiscal_year_id']);
            $kknPeriod = \App\Models\KknPeriod::where('year', $fiscalYear->year)->first();

            // Update Registration details
            $kknRegistration->update([
                'fiscal_year_id' => $validated['fiscal_year_id'],
                'kkn_period_id' => $kknPeriod ? $kknPeriod->id : $kknRegistration->kkn_period_id,
                'registration_type' => $validated['registration_type'],
                'status' => 'pending', // Reset to pending
            ]);

            // Handle Photo
            if ($request->hasFile('photo')) {
                 $photoPath = $request->file('photo')->store('kkn_photos', 'public');
                 $user->mahasiswaProfile()->update(['avatar' => $photoPath]); 

                 $kknRegistration->kknRegistrationDocuments()->where('doc_type', 'required_photo')->delete();
                 $kknRegistration->kknRegistrationDocuments()->create([
                    'name' => 'Pas Foto',
                    'file_path' => $photoPath,
                    'file_type' => $request->file('photo')->extension(),
                    'doc_type' => 'required_photo',
                ]);
            }

            // Handle Dynamic Documents
            if ($request->has('documents')) {
                $docs = $request->documents;
                foreach ($docs as $index => $docData) {
                    if ($request->hasFile("documents.{$index}.file")) {
                        $file = $request->file("documents.{$index}.file");
                        $path = $file->store('kkn_documents', 'public');
                        
                        // Delete old document with same name
                        $kknRegistration->kknRegistrationDocuments()
                            ->where('name', $docData['name'])
                            ->delete();
                        
                        $kknRegistration->kknRegistrationDocuments()->create([
                            'name' => $docData['name'] ?? 'Dokumen',
                            'file_path' => $path,
                            'file_type' => $file->extension(),
                            'doc_type' => $docData['type'] ?? 'custom', 
                        ]);
                    } elseif (isset($docData['name']) && $request->has("documents.{$index}.type")) {
                        // If only name changed? Not strictly handled yet but keeping simple
                    }
                }
            }

            DB::commit();
            return response()->json($kknRegistration->load(['location', 'dpl', 'kknRegistrationDocuments']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }
    
    public function destroy(string $id)
    {
        $kknRegistration = KknRegistration::findOrFail($id);
        $kknRegistration->delete();
        return response()->noContent();
    }
}
