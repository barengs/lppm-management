<?php

namespace Database\Seeders;

use App\Support\MenuPermissionCatalog;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1 & 2 & 3. Reset cache, generate canonical permissions across web & api guards, and sync Admin
        MenuPermissionCatalog::syncPermissions(false);

        $guards = ['web', 'api'];

        // 4. Create/update default roles and permissions
        foreach ($guards as $guard) {

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
                'kkn_field_monitorings.view',
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
                // KKN Registration & Participants
                'kkn_registrations.view', 'kkn_registrations.create', 'kkn_registrations.edit', 'kkn_registrations.delete',
                'kkn_registrations.verify', 'kkn_registrations.approve', 'kkn_registrations.reject',
                'kkn_participants.view', 'kkn_participants.manage',
                'kkn_periods.view',
                'kkn_document_templates.view', 'kkn_document_templates.create', 'kkn_document_templates.edit', 'kkn_document_templates.delete',
                'students.view',
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
                'kkn_field_monitorings.view', 'kkn_field_monitorings.create', 'kkn_field_monitorings.edit', 'kkn_field_monitorings.delete',
                'kkn_monitor_team.view', // Tim Monitoring management page
                // KKN Guidance
                'kkn_guidance.view'
            ]);
            
            // MAHASISWA: KKN & View Only
            $roleMahasiswa = Role::firstOrCreate(['name' => 'mahasiswa', 'guard_name' => $guard]);
            $roleMahasiswa->syncPermissions([
                'dashboard.view',
                'kkn.register',
                'kkn_group.view',
                'kkn_reports.view', 'kkn_reports.create', 'kkn_reports.edit', // Student Reports
                'kkn_guidance.view', 'kkn_guidance.create', 'kkn_guidance.reply', // Student Guidance
                'kkn_grades.view', 'kkn_grades.download_certificate', // Student Grade & Cert
                'posts.view', 
                'documents.view',
                'organization.view'
            ]);

            // KETUA LPPM: Final Approval before review
            $roleKetuaLppm = Role::firstOrCreate(['name' => 'ketua_lppm', 'guard_name' => $guard]);
            $roleKetuaLppm->syncPermissions([
                'dashboard.view',
                'proposals.view', 'proposals.approve', 'proposals.reject',
                'pkm_proposals.view', 'pkm_proposals.approve', 'pkm_proposals.reject',
                'reports.view',
                'documents.view',
                'posts.view',
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
