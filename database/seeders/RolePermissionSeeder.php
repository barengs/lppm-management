<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Create Permissions (Initial set, expandable later)
        $permissions = [
            'manage users',
            'manage master data',
            'create proposals',
            'review proposals',
            'view reports',
            'manage cms'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 3. Create Roles and assign permissions
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleAdmin->givePermissionTo(Permission::all());

        $roleDosen = Role::firstOrCreate(['name' => 'dosen']);
        $roleDosen->givePermissionTo(['create proposals', 'view reports']);

        $roleReviewer = Role::firstOrCreate(['name' => 'reviewer']);
        $roleReviewer->givePermissionTo(['review proposals', 'view reports']);

        $roleMahasiswa = Role::firstOrCreate(['name' => 'mahasiswa']);
        $roleMahasiswa->givePermissionTo(['view reports']); // Basic access
    }
}
