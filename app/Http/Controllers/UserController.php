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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,dosen,reviewer,tendik', // Exclude mahasiswa
            'nidn' => 'nullable|string|unique:dosen_profiles,nidn',
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
        
        // Explicitly load role from 'web' guard
        $role = \Spatie\Permission\Models\Role::where('name', $validated['role'])->where('guard_name', 'web')->firstOrFail();
        $user->assignRole($role);

        if (in_array($validated['role'], ['dosen', 'reviewer'])) {
            $user->dosenProfile()->create([
                'nidn' => $validated['nidn'] ?? null,
                'prodi' => $validated['prodi'] ?? null,
                'fakultas' => $validated['fakultas'] ?? null,
            ]);
        }
        
        return response()->json($user->load('dosenProfile'), 201);
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
            'role' => 'in:admin,dosen,reviewer,tendik',
            'nidn' => ['nullable', 'string', \Illuminate\Validation\Rule::unique('dosen_profiles')->ignore($user->dosenProfile->id ?? null)],
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
        ]);

        if ($request->has('name')) $user->name = $validated['name'];
        if ($request->has('email')) $user->email = $validated['email'];
        if ($request->has('password') && !empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();
        
        if (isset($validated['role'])) {
            $role = \Spatie\Permission\Models\Role::where('name', $validated['role'])->where('guard_name', 'web')->firstOrFail();
            $user->syncRoles($role);
        }

        // Update Profile if Dosen/Reviewer
        if ($user->hasAnyRole(['dosen', 'reviewer'])) {
             $user->dosenProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nidn' => $validated['nidn'] ?? $user->dosenProfile->nidn ?? null,
                    'prodi' => $validated['prodi'] ?? $user->dosenProfile->prodi ?? null,
                    'fakultas' => $validated['fakultas'] ?? $user->dosenProfile->fakultas ?? null,
                ]
            );
        }
        
        return response()->json($user->fresh('dosenProfile'));
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
