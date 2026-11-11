<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permissions = Permission::orderByRaw("CASE WHEN guard_name = 'web' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get()
            ->unique('name')
            ->values();

        return response()->json($permissions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        $webPerm = null;
        foreach (['web', 'api'] as $guard) {
            $perm = Permission::firstOrCreate(['name' => $validated['name'], 'guard_name' => $guard]);
            if ($guard === 'web') {
                $webPerm = $perm;
            }
        }

        return response()->json($webPerm, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(Permission::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $permission = Permission::findOrFail($id);
        $oldName = $permission->name;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                \Illuminate\Validation\Rule::unique('permissions', 'name')->where(
                    fn ($q) => $q->where('name', '!=', $oldName)
                ),
            ],
        ]);

        Permission::where('name', $oldName)->update(['name' => $validated['name']]);

        return response()->json($permission->refresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $permission = Permission::findOrFail($id);
        Permission::where('name', $permission->name)->delete();

        return response()->noContent();
    }
}
