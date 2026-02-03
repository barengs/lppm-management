<?php

namespace App\Http\Controllers;

use App\Models\ScholarStats;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function me()
    {
        $user = auth('api')->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        // Load appropriate profile based on user role with nested relations
        $user->load([
            'mahasiswaProfile.faculty', 
            'mahasiswaProfile.studyProgram',
            'dosenProfile', 
            'scholarStats'
        ]);
        
        return response()->json($user);
    }


    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = auth('api')->user();
        
        $validated = $request->validate([
            'nidn' => 'nullable|string',
            'npm' => 'nullable|string',
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'scopus_id' => 'nullable|string',
            'sinta_id' => 'nullable|string',
            'google_scholar_id' => 'nullable|string',
            'jacket_size' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'place_of_birth' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:L,P',
        ]);

        $profile = null;

        if ($user->role === 'mahasiswa') {
            $profile = $user->mahasiswaProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'npm' => $request->npm ?? $user->mahasiswaProfile?->npm, // Keep existing if not provided
                    'prodi' => $request->prodi,
                    'fakultas' => $request->fakultas,
                    'jacket_size' => $request->jacket_size,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'place_of_birth' => $request->place_of_birth,
                    'date_of_birth' => $request->date_of_birth,
                    'gender' => $request->gender,
                ]
            );
        } else {
            // Dosen & Reviewer
            $profile = $user->dosenProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nidn' => $request->nidn ?? $user->dosenProfile?->nidn,
                    'prodi' => $request->prodi,
                    'fakultas' => $request->fakultas,
                    'scopus_id' => $request->scopus_id,
                    'sinta_id' => $request->sinta_id,
                    'google_scholar_id' => $request->google_scholar_id,
                ]
            );
        }

        return response()->json($profile);
    }

    /**
     * Update scholar stats (usually by admin or background job, but exposed here for simplicity).
     */
    public function updateStats(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'h_index' => 'required|integer',
            'total_citations' => 'required|integer',
            'total_documents' => 'required|integer',
            'year' => 'required|integer'
        ]);

        $stats = ScholarStats::updateOrCreate(
            [
                'user_id' => $user->id,
                'year' => $request->year
            ],
            [
                'h_index' => $request->h_index,
                'total_citations' => $request->total_citations,
                'total_documents' => $request->total_documents
            ]
        );

        return response()->json($stats);
    }
}
