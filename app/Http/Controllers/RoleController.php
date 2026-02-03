<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Show all roles but unique by name to avoid duplicates in UI
        return response()->json(Role::with('permissions')->orderBy('name')->get()->unique('name')->values());
    }

    public function permissions()
    {
        // Show all permissions
        return response()->json(Permission::orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|regex:/^[a-z0-9_]+$/', 
            'permissions' => 'array'
        ], [
            'name.regex' => 'Nama Role hanya boleh berisi huruf kecil, angka, dan underscore (tanpa spasi).'
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $guards = ['web', 'api'];
            $createdWebRole = null;
            $firstRole = null;

            foreach ($guards as $guard) {
                // Use firstOrCreate to prevent errors if role exists for one guard but not others
                $role = Role::firstOrCreate(['name' => $validated['name'], 'guard_name' => $guard]);
                
                if (!empty($validated['permissions'])) {
                    // Sync permissions
                    // Ensure we only sync permissions that exist for this guard or created universally
                    $role->syncPermissions($validated['permissions']);
                }

                if ($guard === 'web') {
                    $createdWebRole = $role;
                }
                if (!$firstRole) $firstRole = $role;
            }

            \Illuminate\Support\Facades\DB::commit();

            // Return web role if exists, otherwise the first created one
            return response()->json(($createdWebRole ?? $firstRole)->load('permissions'), 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Failed to create role: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // $id corresponds to the 'web' role shown in index method
        $targetRole = Role::findOrFail($id);
        $originalName = $targetRole->name;

        $validated = $request->validate([
            // Check uniqueness on web guard, ignoring current role id
            'name' => 'required|string|regex:/^[a-z0-9_]+$/|unique:roles,name,' . $id . ',id,guard_name,web',
            'permissions' => 'array'
        ], [
             'name.regex' => 'Nama Role hanya boleh berisi huruf kecil, angka, dan underscore (tanpa spasi).'
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // Apply updates to ALL roles with the same name (e.g. web and api)
            $roles = Role::where('name', $originalName)->get();

            foreach ($roles as $role) {
                // Update Name if changed
                if ($validated['name'] !== $originalName) {
                    $role->update(['name' => $validated['name']]);
                }

                // Sync Permissions
                if (isset($validated['permissions'])) {
                    $role->syncPermissions($validated['permissions']);
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json($targetRole->refresh()->load('permissions'));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Failed to update role: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        $roleName = $role->name;
        
        // Prevent deleting critical roles
        if (in_array($roleName, ['admin', 'dosen', 'reviewer', 'mahasiswa'])) {
             return response()->json(['message' => 'Cannot delete system roles.'], 403);
        }

        // Delete ALL roles with this name (web and api)
        Role::where('name', $roleName)->delete();
        
        return response()->noContent();
    }
}
