<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     * Shows valid Students (mahasiswa role) with their MahasiswaProfile.
     */
    public function index()
    {
        // Get users with role 'mahasiswa' and eager load their profile
        // Explicitly check 'web' guard since roles are seeded with 'web' guard
        $students = User::role('mahasiswa', 'web')
            ->with(['mahasiswaProfile', 'kknRegistration.location'])
            ->latest()
            ->get();

        return response()->json($students);
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
            'npm' => 'required|string|unique:mahasiswa_profiles,npm',
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:L,P',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
        
        // Ensure we assign the 'mahasiswa' role from the 'web' guard
        $mahasiswaRole = \Spatie\Permission\Models\Role::where('name', 'mahasiswa')->where('guard_name', 'web')->firstOrFail();
        $user->assignRole($mahasiswaRole);

        $user->mahasiswaProfile()->create([
            'npm' => $validated['npm'],
            'prodi' => $validated['prodi'] ?? null,
            'fakultas' => $validated['fakultas'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'gender' => $validated['gender'] ?? null,
        ]);

        return response()->json($user->load('mahasiswaProfile'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $student = User::role('mahasiswa', 'web')
            ->with('mahasiswaProfile')
            ->findOrFail($id);
            
        return response()->json($student);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $student = User::role('mahasiswa', 'web')->with('mahasiswaProfile')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($student->id)],
            'password' => 'nullable|string|min:6',
            'npm' => ['sometimes', Rule::unique('mahasiswa_profiles')->ignore($student->mahasiswaProfile->id ?? null)],
            'prodi' => 'nullable|string',
            'fakultas' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:L,P',
        ]);

        if ($request->has('name')) $student->name = $validated['name'];
        if ($request->has('email')) $student->email = $validated['email'];
        if ($request->has('password') && !empty($validated['password'])) {
            $student->password = Hash::make($validated['password']);
        }
        $student->save();

        // Update or Create Profile
        $student->mahasiswaProfile()->updateOrCreate(
            ['user_id' => $student->id],
            [
                'npm' => $validated['npm'] ?? $student->mahasiswaProfile->npm,
                'prodi' => $validated['prodi'] ?? $student->mahasiswaProfile->prodi,
                'fakultas' => $validated['fakultas'] ?? $student->mahasiswaProfile->fakultas,
                'phone' => $validated['phone'] ?? $student->mahasiswaProfile->phone ?? null,
                'address' => $validated['address'] ?? $student->mahasiswaProfile->address ?? null,
                'gender' => $validated['gender'] ?? $student->mahasiswaProfile->gender ?? null,
            ]
        );

        return response()->json($student->fresh('mahasiswaProfile'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Explicitly check 'web' guard
        $student = User::role('mahasiswa', 'web')->findOrFail($id);
        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }
}
