<?php

namespace App\Http\Controllers;

use App\Models\Profile;
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
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'scopus_id' => 'nullable|string',
            'sinta_id' => 'nullable|string',
            'google_scholar_id' => 'nullable|string'
        ]);

        $user->update([
            'nidn' => $request->nidn
        ]);

        $profile = Profile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'prodi' => $request->prodi,
                'fakultas' => $request->fakultas,
                'scopus_id' => $request->scopus_id,
                'sinta_id' => $request->sinta_id,
                'google_scholar_id' => $request->google_scholar_id
            ]
        );

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
