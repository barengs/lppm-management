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
            'dosenProfile.faculty',
            'dosenProfile.studyProgram',
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
            // User fields
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            
            // Profile fields
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

        return \Illuminate\Support\Facades\DB::transaction(function () use ($user, $request) {
            // Update User
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];
            
            if ($request->filled('password')) {
                $userData['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
            }
            
            $user->update($userData);

            $profileData = [
                'prodi' => $request->prodi,
                'fakultas' => $request->fakultas,
            ];

            // Handle Avatar Upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                $oldAvatar = ($user->role === 'mahasiswa') 
                    ? $user->mahasiswaProfile?->avatar 
                    : $user->dosenProfile?->avatar;
                
                if ($oldAvatar) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldAvatar);
                }
                
                $profileData['avatar'] = $request->file('avatar')->store('profile_avatars', 'public');
            }

            if ($user->role === 'mahasiswa') {
                $profileData = array_merge($profileData, [
                    'npm' => $request->npm,
                    'jacket_size' => $request->jacket_size,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'place_of_birth' => $request->place_of_birth,
                    'date_of_birth' => $request->date_of_birth,
                    'gender' => $request->gender,
                ]);
                
                $user->mahasiswaProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $profileData
                );
            } else {
                // Dosen & Reviewer
                $profileData = array_merge($profileData, [
                    'nidn' => $request->nidn,
                    'scopus_id' => $request->scopus_id,
                    'sinta_id' => $request->sinta_id,
                    'google_scholar_id' => $request->google_scholar_id,
                ]);
                
                $user->dosenProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $profileData
                );
            }

            return response()->json([
                'message' => 'Profil berhasil diperbarui',
                'user' => $user->fresh([
                    'mahasiswaProfile.faculty', 
                    'mahasiswaProfile.studyProgram', 
                    'dosenProfile.faculty', 
                    'dosenProfile.studyProgram'
                ])
            ]);
        });
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
