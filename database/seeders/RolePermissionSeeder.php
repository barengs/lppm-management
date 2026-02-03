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
            'kkn_grades', // New: for Assessment
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
            'kkn_grades' => ['download_certificate'], 
        ];

        // 3. Generate Permissions
        $allPermissions = [];
        $guards = ['web', 'api'];
        
        foreach ($guards as $guard) {
            foreach ($modules as $module) {
                // Add Standard Actions
                $actions = ['view', 'create', 'edit', 'delete'];
                
                // Merge Extra Actions
                if (isset($extraActions[$module])) {
                    $actions = array_unique(array_merge($actions, $extraActions[$module]));
                }

                foreach ($actions as $action) {
                    $permissionName = "{$module}.{$action}";
                    Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => $guard]);
                    if ($guard === 'web') {
                        $allPermissions[] = $permissionName; // Collect primarily for web admin
                    }
                }
            }

            // Special / Manual Permissions (if any that don't fit the pattern)
            $manualPermissions = [
                'kkn.register', // Unique action for students
                'dashboard.view',
            ];

            foreach ($manualPermissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guard]);
            }
        }

        // 4. Create Roles and assign permissions
        
        foreach ($guards as $guard) {
            // ADMIN: All Access
            $roleAdmin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => $guard]);
            // Sync all permissions to ensure admin has everything current
            // We need to fetch permissions specifically for this guard
            $guardPermissions = Permission::where('guard_name', $guard)->get();
            $roleAdmin->syncPermissions($guardPermissions);

            // DOSEN: Focus on Proposals & Reports
            $roleDosen = Role::firstOrCreate(['name' => 'dosen', 'guard_name' => $guard]);
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
            $roleReviewer = Role::firstOrCreate(['name' => 'reviewer', 'guard_name' => $guard]);
            $roleReviewer->givePermissionTo([
                'dashboard.view',
                'proposals.view', 'proposals.review', 'proposals.approve', 'proposals.reject',
                'reports.view',
                'documents.view',
                'posts.view',
            ]);

            // TENDIK/STAFF
            $roleTendik = Role::firstOrCreate(['name' => 'tendik', 'guard_name' => $guard]);
            $roleTendik->givePermissionTo([
                'dashboard.view',
                'documents.view', 'documents.create', 'documents.edit',
                'kkn_grades.create' 
            ]);

            // STAFF KKN
            $roleStaffKkn = Role::firstOrCreate(['name' => 'staff_kkn', 'guard_name' => $guard]);
            // Use syncPermissions to update existing
            $roleStaffKkn->syncPermissions([
                'dashboard.view',
                // KKN Registration
                'kkn_registrations.view', 'kkn_registrations.create', 'kkn_registrations.edit', 'kkn_registrations.delete',
                'kkn_registrations.verify', 'kkn_registrations.approve', 'kkn_registrations.reject',
                // KKN Locations
                'kkn_locations.view', 'kkn_locations.create', 'kkn_locations.edit', 'kkn_locations.delete',
                // KKN Grades
                'kkn_grades.view', 'kkn_grades.create',
                // General Reports
                'reports.view',
                'documents.view',
                'posts.view',
                // KKN Reports Verification
                'kkn_reports.view', 'kkn_reports.review', 'kkn_reports.approve', 'kkn_reports.reject',
                // KKN Guidance
                'kkn_guidance.view'
            ]);
            
            // MAHASISWA: KKN & View Only
            $roleMahasiswa = Role::firstOrCreate(['name' => 'mahasiswa', 'guard_name' => $guard]);
            $roleMahasiswa->givePermissionTo([
                'dashboard.view',
                'kkn.register', 
                'kkn_reports.view', 'kkn_reports.create', 'kkn_reports.edit', // Student Reports
                'kkn_guidance.view', 'kkn_guidance.create', 'kkn_guidance.reply', // Student Guidance
                'kkn_grades.view', 'kkn_grades.download_certificate', // Student Grade & Cert
                'posts.view', 
                'documents.view',
                'organization.view'
            ]);
        }
    }
}
