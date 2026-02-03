<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     * Shows Staff (Admin, Dosen, Reviewer) - Excludes 'mahasiswa'.
     */
    public function index()
    {
        return response()->json(User::whereDoesntHave('roles', function ($q) {
            $q->where('name', 'mahasiswa');
        })->with('dosenProfile')->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|exists:roles,name', // Allow any valid role
            'avatar' => 'nullable|image|max:2048', // 2MB Max
            // Profile fields
            'nidn' => 'nullable|string|unique:dosen_profiles,nidn',
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'scopus_id' => 'nullable|string',
            'sinta_id' => 'nullable|string',
            'google_scholar_id' => 'nullable|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ];

            // Avatar handling moved to profile creation below

            $user = User::create($userData);
            
            // Assign role by name, let Spatie handle guard
            $user->assignRole($validated['role']);

            $avatarPath = null;
            if ($request->hasFile('avatar')) {
                 $avatarPath = $request->file('avatar')->store('avatars', 'public');
            }

            if (in_array($validated['role'], ['dosen', 'reviewer', 'admin', 'tendik', 'staff_kkn'])) {
                 // Create or update DosenProfile (assuming staff also use this or a similar profile, 
                 // but schema implies this table is for lecturers. However, current controller logic uses it for staff too).
                 // Based on current logic, we create dosenProfile for these roles.
                $user->dosenProfile()->create([
                    'nidn' => $validated['nidn'] ?? null,
                    'prodi' => $validated['prodi'] ?? null,
                    'fakultas' => $validated['fakultas'] ?? null,
                    'scopus_id' => $validated['scopus_id'] ?? null,
                    'sinta_id' => $validated['sinta_id'] ?? null,
                    'google_scholar_id' => $validated['google_scholar_id'] ?? null,
                    'avatar' => $avatarPath, // Save avatar here
                ]);
            }
            
            \Illuminate\Support\Facades\DB::commit();

            return response()->json($user->load('dosenProfile'), 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            // Delete uploaded avatar if failed
            if (isset($avatarPath) && \Storage::disk('public')->exists($avatarPath)) {
                \Storage::disk('public')->delete($avatarPath);
            }
            return response()->json(['message' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = User::with('dosenProfile')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::with('dosenProfile')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'exists:roles,name', // Allow any valid role
            'avatar' => 'nullable|image|max:2048',
            'nidn' => ['nullable', 'string', \Illuminate\Validation\Rule::unique('dosen_profiles')->ignore($user->dosenProfile->id ?? null)],
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'scopus_id' => 'nullable|string',
            'sinta_id' => 'nullable|string',
            'google_scholar_id' => 'nullable|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            if ($request->has('name')) $user->name = $validated['name'];
            if ($request->has('email')) $user->email = $validated['email'];
            if ($request->has('password') && !empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
            
            $user->save();
            
            if (isset($validated['role'])) {
                // Pass string directly, Spatie handles guard resolution
                $user->syncRoles($validated['role']);
            }

            // Handle Avatar Logic
            $avatarPath = $user->dosenProfile->avatar ?? null;
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists in profile
                if ($user->dosenProfile && $user->dosenProfile->avatar && \Storage::disk('public')->exists($user->dosenProfile->avatar)) {
                    \Storage::disk('public')->delete($user->dosenProfile->avatar);
                }
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
            }

            // Update Profile
            if ($user->hasAnyRole(['dosen', 'reviewer', 'admin', 'tendik', 'staff_kkn'])) {
                 $user->dosenProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'nidn' => $validated['nidn'] ?? $user->dosenProfile->nidn ?? null,
                        'prodi' => $validated['prodi'] ?? $user->dosenProfile->prodi ?? null,
                        'fakultas' => $validated['fakultas'] ?? $user->dosenProfile->fakultas ?? null,
                        'scopus_id' => $validated['scopus_id'] ?? $user->dosenProfile->scopus_id ?? null,
                        'sinta_id' => $validated['sinta_id'] ?? $user->dosenProfile->sinta_id ?? null,
                        'google_scholar_id' => $validated['google_scholar_id'] ?? $user->dosenProfile->google_scholar_id ?? null,
                        'avatar' => $avatarPath,
                    ]
                );
            }
            
            \Illuminate\Support\Facades\DB::commit();

            return response()->json($user->fresh('dosenProfile'));

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Failed to update user: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->noContent();
    }

    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        Excel::import(new UsersImport, $request->file('file'));
        
        return response()->json(['message' => 'Import successful']);
    }

    public function downloadTemplate()
    {
        return Excel::download(new \App\Exports\UsersTemplateExport, 'users_template.xlsx');
    }
}
