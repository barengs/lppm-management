<?php

namespace App\Http\Controllers;

use App\Models\KknRegistration;
use App\Models\KknLocation;
use Illuminate\Http\Request;

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
        
        $validated = $request->validate([
            // Registration Data (location is now optional)
            'kkn_location_id' => 'nullable|exists:kkn_locations,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            
            // Profile Data Update
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
            
            // Documents
            'krs_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'health_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'transcript_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Check Quota only if location is selected
        if (!empty($validated['kkn_location_id'])) {
            $location = KknLocation::find($validated['kkn_location_id']);
            $count = KknRegistration::where('kkn_location_id', $location->id)->count();
            if ($count >= $location->quota) {
                return response()->json(['message' => 'Quota penuh for this location.'], 400);
            }
        }

        // Check duplicate
        $exists = KknRegistration::where('student_id', $user->id)
            ->where('fiscal_year_id', $validated['fiscal_year_id'])
            ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'You are already registered for this period.'], 400);
        }

        // 1. Update User Data (Name)
        $user->update(['name' => $validated['name']]);

        // 2. Update Profile Data
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
            ]
        );

        // 3. Handle File Uploads
        $documents = [];
        if ($request->hasFile('krs_file')) {
            $documents['krs'] = $request->file('krs_file')->store('kkn_documents', 'public');
        }
        if ($request->hasFile('health_file')) {
            $documents['health'] = $request->file('health_file')->store('kkn_documents', 'public');
        }
        if ($request->hasFile('transcript_file')) {
            $documents['transcript'] = $request->file('transcript_file')->store('kkn_documents', 'public');
        }
        if ($request->hasFile('photo')) {
            $documents['photo'] = $request->file('photo')->store('kkn_photos', 'public');
        }

        $data = [
            'student_id' => $user->id,
            'kkn_location_id' => $validated['kkn_location_id'] ?? null,
            'fiscal_year_id' => $validated['fiscal_year_id'],
            'status' => 'pending',
            'documents' => $documents,
        ];

        $reg = KknRegistration::create($data);
        return response()->json($reg, 201);
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

        $kknRegistration->update($validated);
        return response()->json($kknRegistration);
    }
    
    public function destroy(string $id)
    {
        $kknRegistration = KknRegistration::findOrFail($id);
        $kknRegistration->delete();
        return response()->noContent();
    }
}
