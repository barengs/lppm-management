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
            return response()->json(KknRegistration::with(['location', 'dpl'])->where('student_id', $user->id)->get());
        }

        // Admin sees all, formatted for table
        return response()->json(KknRegistration::with(['student.mahasiswaProfile', 'location', 'dpl'])->get());
    }

    /**
     * Student registers for a location.
     */
    public function store(Request $request)
    {
        $user = auth('api')->user();
        $isAdmin = $user->role === 'admin' || $user->role === 'staff'; // Assuming staff can also register?? Let's stick to admin for now based on request.
        
        $rules = [
            // Registration Data
            'kkn_location_id' => 'nullable|exists:kkn_locations,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            
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
            'documents.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];

        // Extended validation for Admin creating new user
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
                
                // Check duplicate
                $exists = KknRegistration::where('student_id', $targetUser->id)
                    ->where('fiscal_year_id', $validated['fiscal_year_id'])
                    ->exists();
                
                if ($exists) {
                    return response()->json(['message' => 'You are already registered for this period.'], 400);
                }

                // Update User Data (Name)
                $targetUser->update(['name' => $validated['name']]);
            }

            // Update/Create Profile Data
            $targetUser->mahasiswaProfile()->updateOrCreate(
                ['user_id' => $targetUser->id],
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

            // Handle Photo (Shared logic)
            if ($request->hasFile('photo')) {
                 $photoPath = $request->file('photo')->store('kkn_photos', 'public');
                 $targetUser->mahasiswaProfile()->update(['avatar' => $photoPath]); 
            }

            // Create Registration
            $data = [
                'student_id' => $targetUser->id,
                'kkn_location_id' => $validated['kkn_location_id'] ?? null,
                'fiscal_year_id' => $validated['fiscal_year_id'],
                'status' => 'pending',
            ];
            
            $reg = KknRegistration::create($data);

            // Handle Dynamic Documents
            if ($request->has('documents')) {
                $docs = $request->documents;
                foreach ($docs as $index => $docData) {
                    if ($request->hasFile("documents.{$index}.file")) {
                        $file = $request->file("documents.{$index}.file");
                        $path = $file->store('kkn_documents', 'public');
                        
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
        // Admin updates status or assigns DPL
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
    
    public function destroy(string $id)
    {
        $kknRegistration = KknRegistration::findOrFail($id);
        $kknRegistration->delete();
        return response()->noContent();
    }
}
