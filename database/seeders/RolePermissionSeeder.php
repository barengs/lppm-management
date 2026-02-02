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

        // 2. Configuration: Modules & Actions
        // Standard Access: view, create, edit, delete
        $modules = [
            'users', 
            'roles', 
            'permissions',
            'menus',
            'faculties',     // Prev: master.faculties
            'study_programs',// Prev: master.study-programs
            'fiscal_years',  // Prev: master.fiscal-years
            'schemes',       // Prev: master.schemes
            'posts', 
            'documents', 
            'galleries',
            'proposals',
            'reports',
            'kkn_locations', // Prev: kkn.manage-locations
            'kkn_registrations', // Prev: kkn.manage-registrations
            'kkn_reports',
            'kkn_guidance',
            'organization',
        ];

        // Custom/Extra Actions per module
        $extraActions = [
            'posts' => ['publish'],
            'documents' => ['publish'],
            'proposals' => ['review', 'approve', 'reject'],
            'kkn_registrations' => ['verify', 'approve', 'reject'], 
            'kkn_reports' => ['review', 'approve', 'reject', 'revise'],
            'kkn_guidance' => ['reply', 'close'],
            'kkn_participants' => ['view', 'manage'], 
        ];

        // 3. Generate Permissions
        $allPermissions = [];
        
        foreach ($modules as $module) {
            // Add Standard Actions
            $actions = ['view', 'create', 'edit', 'delete'];
            
            // Merge Extra Actions
            if (isset($extraActions[$module])) {
                $actions = array_unique(array_merge($actions, $extraActions[$module]));
            }

            foreach ($actions as $action) {
                $permissionName = "{$module}.{$action}";
                Permission::firstOrCreate(['name' => $permissionName]);
                $allPermissions[] = $permissionName;
            }
        }

        // Special / Manual Permissions (if any that don't fit the pattern)
        $manualPermissions = [
            'kkn.register', // Unique action for students
            'dashboard.view',
        ];

        foreach ($manualPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // 4. Create Roles and assign permissions
        
        // ADMIN: All Access
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        // Sync all permissions to ensure admin has everything current
        $roleAdmin->syncPermissions(Permission::all());

        // DOSEN: Focus on Proposals & Reports
        $roleDosen = Role::firstOrCreate(['name' => 'dosen']);
        $roleDosen->givePermissionTo([
            'dashboard.view',
            'proposals.view', 'proposals.create', 'proposals.edit', 'proposals.delete',
            'reports.view', 'reports.create',
            'kkn_reports.view', 'kkn_reports.create', 'kkn_reports.edit', // Dosen as Reporter (Abmas/Weekly)
            'kkn_reports.review', 'kkn_reports.approve', 'kkn_reports.reject', 'kkn_reports.revise', // Dosen as Reviewer (Student Reports)
            'kkn_guidance.view', 'kkn_guidance.create', 'kkn_guidance.reply', // Dosen in Guidance
            'documents.view',
            'posts.view',
        ]);

        // REVIEWER: Focus on Reviewing
        $roleReviewer = Role::firstOrCreate(['name' => 'reviewer']);
        $roleReviewer->givePermissionTo([
            'dashboard.view',
            'proposals.view', 'proposals.review', 'proposals.approve', 'proposals.reject',
            'reports.view',
            'documents.view',
            'posts.view',
        ]);

        // MAHASISWA: KKN & View Only
        $roleMahasiswa = Role::firstOrCreate(['name' => 'mahasiswa']);
        $roleMahasiswa->givePermissionTo([
            'dashboard.view',
            'kkn.register', 
            'kkn_reports.view', 'kkn_reports.create', 'kkn_reports.edit', // Student Reports
            'kkn_guidance.view', 'kkn_guidance.create', 'kkn_guidance.reply', // Student Guidance
            'posts.view', 
            'documents.view',
            'organization.view'
        ]);
    }
}
