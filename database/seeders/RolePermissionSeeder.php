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
            'pkm_proposals',
            'reports',
            'kkn_locations', // Prev: kkn.manage-locations
            'kkn_registrations', // Prev: kkn.manage-registrations
            'kkn_reports',
            'kkn_guidance',
            'kkn_grades', // New: for Assessment
            'kkn_postos',
            'organization',
            'master_science_clusters',
            'master_research_priorities',
            'master_selections',
        ];

        // Custom/Extra Actions per module
        $extraActions = [
            'posts' => ['publish'],
            'documents' => ['publish'],
            'proposals' => ['review', 'approve', 'reject'],
            'pkm_proposals' => ['submit', 'review', 'approve', 'reject'],
            'kkn_registrations' => ['verify', 'approve', 'reject'], 
            'kkn_reports' => ['review', 'approve', 'reject', 'revise'],
            'kkn_guidance' => ['reply', 'close'],
            'kkn_participants' => ['view', 'manage'],
            'kkn_grades' => ['download_certificate'], 
            'kkn_postos' => ['view', 'manage_members'],
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
            // Remove KKN permissions from dosen, keep only Proposal and General stuff
            $roleDosen->syncPermissions([
                'dashboard.view',
                'proposals.view', 'proposals.create', 'proposals.edit', 'proposals.delete',
                'pkm_proposals.view', 'pkm_proposals.create', 'pkm_proposals.edit', 'pkm_proposals.delete', 'pkm_proposals.submit',
                'reports.view', 'reports.create',
                'documents.view',
                'posts.view',
            ]);

            // DPL KKN: Focus on KKN Guidance & Supervision
            $roleDplKkn = Role::firstOrCreate(['name' => 'dpl_kkn', 'guard_name' => $guard]);
            $roleDplKkn->syncPermissions([
                'dashboard.view',
                'kkn_reports.view', 'kkn_reports.create', 'kkn_reports.edit',
                'kkn_reports.review', 'kkn_reports.approve', 'kkn_reports.reject', 'kkn_reports.revise',
                'kkn_guidance.view', 'kkn_guidance.create', 'kkn_guidance.reply',
                'kkn_postos.view', 'kkn_postos.manage_members',
                'documents.view',
                'posts.view',
            ]);

            // REVIEWER: Focus on Reviewing
            $roleReviewer = Role::firstOrCreate(['name' => 'reviewer', 'guard_name' => $guard]);
            $roleReviewer->syncPermissions([
                'dashboard.view',
                'proposals.view', 'proposals.review', 'proposals.approve', 'proposals.reject',
                'pkm_proposals.view', 'pkm_proposals.review',
                'reports.view',
                'documents.view',
                'posts.view',
            ]);

            // REVIEWER PENELITIAN (Research)
            $roleReviewerPenelitian = Role::firstOrCreate(['name' => 'reviewer_penelitian', 'guard_name' => $guard]);
            $roleReviewerPenelitian->syncPermissions([
                'dashboard.view',
                'proposals.view', 'proposals.review', 'proposals.approve', 'proposals.reject',
                'reports.view',
                'documents.view',
                'posts.view',
            ]);

            // REVIEWER PKM (Community Service)
            $roleReviewerPkm = Role::firstOrCreate(['name' => 'reviewer_pkm', 'guard_name' => $guard]);
            $roleReviewerPkm->syncPermissions([
                'dashboard.view',
                'pkm_proposals.view', 'pkm_proposals.review', 'pkm_proposals.approve', 'pkm_proposals.reject',
                'reports.view',
                'documents.view',
                'posts.view',
            ]);

            // TENDIK/STAFF
            $roleTendik = Role::firstOrCreate(['name' => 'tendik', 'guard_name' => $guard]);
            $roleTendik->syncPermissions([
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
                // KKN Poskos
                'kkn_postos.view', 'kkn_postos.create', 'kkn_postos.edit', 'kkn_postos.delete', 'kkn_postos.manage_members',
                // KKN Guidance
                'kkn_guidance.view'
            ]);
            
            // MAHASISWA: KKN & View Only
            $roleMahasiswa = Role::firstOrCreate(['name' => 'mahasiswa', 'guard_name' => $guard]);
            $roleMahasiswa->syncPermissions([
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

        // 5. PRODUCTION MIGRATION: Auto-assign dpl_kkn role to existing DPLs
        $this->command->info('Running production migration: Assigning dpl_kkn role to existing supervisors...');
        try {
            $existingDplIds = \App\Models\KknPosto::whereNotNull('dpl_id')->pluck('dpl_id')->unique();
            $dplRoleApi = Role::where('name', 'dpl_kkn')->where('guard_name', 'api')->first();
            $dplRoleWeb = Role::where('name', 'dpl_kkn')->where('guard_name', 'web')->first();

            foreach ($existingDplIds as $userId) {
                $user = \App\Models\User::find($userId);
                if ($user) {
                    if ($dplRoleApi) $user->assignRole($dplRoleApi);
                    if ($dplRoleWeb) $user->assignRole($dplRoleWeb);
                    $this->command->line(" - Assigned dpl_kkn role to: {$user->name}");
                }
            }
        } catch (\Exception $e) {
            $this->command->warn('Could not auto-assign DPL roles (maybe table kkn_postos doesn\'t exist yet): ' . $e->getMessage());
        }
    }
}
