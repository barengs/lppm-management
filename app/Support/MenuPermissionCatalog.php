<?php

namespace App\Support;

use App\Models\Menu;
use App\Models\MenuItem;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class MenuPermissionCatalog
{
    public static function modules(): array
    {
        return [
            'users',
            'students',
            'roles',
            'permissions',
            'menus',
            'faculties',
            'study_programs',
            'fiscal_years',
            'schemes',
            'posts',
            'documents',
            'galleries',
            'proposals',
            'pkm_proposals',
            'pkm_master_data',
            'admin_proposals',
            'admin_pkm',
            'reports',
            'kkn_locations',
            'kkn_registrations',
            'kkn_participants',
            'kkn_reports',
            'kkn_guidance',
            'kkn_grades',
            'kkn_postos',
            'kkn_periods',
            'kkn_document_templates',
            'kkn_field_monitorings',
            'kkn_monitor_team',
            'organization',
            'master_science_clusters',
            'master_research_priorities',
            'master_selections',
            'journal_consultations',
            'pages',
            'settings',
        ];
    }

    public static function extraActions(): array
    {
        return [
            'posts' => ['publish'],
            'documents' => ['publish'],
            'proposals' => ['review', 'approve', 'reject'],
            'pkm_proposals' => ['submit', 'review', 'approve', 'reject'],
            'kkn_registrations' => ['verify', 'approve', 'reject'],
            'kkn_reports' => ['review', 'approve', 'reject', 'revise'],
            'kkn_guidance' => ['reply', 'close'],
            'kkn_participants' => ['manage'],
            'kkn_grades' => ['download_certificate', 'settings'],
            'kkn_postos' => ['manage_members'],
            'journal_consultations' => ['manage'],
            'reports' => ['view_all'],
        ];
    }

    public static function manualPermissions(): array
    {
        return [
            'kkn.register',
            'dashboard.view',
            'dashboard_kkn.view',
            'kkn_group.view',
            'lecturer_stats.view',
            'manage_proposal_trash',
            'manage_pkm_trash',
        ];
    }

    public static function allPermissionNames(): array
    {
        $names = [];
        $extraActions = self::extraActions();

        foreach (self::modules() as $module) {
            $actions = ['view', 'create', 'edit', 'delete'];
            if (isset($extraActions[$module])) {
                $actions = array_unique(array_merge($actions, $extraActions[$module]));
            }
            foreach ($actions as $action) {
                $names[] = "{$module}.{$action}";
            }
        }

        return array_values(array_unique(array_merge($names, self::manualPermissions())));
    }

    public static function sidebarGroups(): array
    {
        return [
            'Main' => [
                ['title' => 'Dashboard LPPM', 'url' => '/dashboard', 'icon' => 'LayoutDashboard', 'permission_name' => 'dashboard.view'],
                ['title' => 'Dashboard KKN', 'url' => '/dashboard/kkn', 'icon' => 'LayoutDashboard', 'permission_name' => 'dashboard_kkn.view'],
            ],
            'Penelitian & Pengabdian' => [
                ['title' => 'Proposal Penelitian', 'url' => '/proposals', 'icon' => 'FileText', 'permission_name' => 'proposals.view'],
                ['title' => 'Proposal PKM', 'url' => '/pkm', 'icon' => 'FileText', 'permission_name' => 'pkm_proposals.view'],
                ['title' => 'Monitoring Penelitian', 'url' => '/admin/proposals', 'icon' => 'Shield', 'permission_name' => 'admin_proposals.view'],
                ['title' => 'Monitoring PKM', 'url' => '/admin/pkm', 'icon' => 'Shield', 'permission_name' => 'admin_pkm.view'],
                ['title' => 'Monitoring Laporan', 'url' => '/admin/reports', 'icon' => 'ClipboardList', 'permission_name' => 'reports.view'],
                ['title' => 'Penilaian Penelitian', 'url' => '/reviewer/dashboard', 'icon' => 'Star', 'permission_name' => 'proposals.review'],
                ['title' => 'Penilaian PKM', 'url' => '/reviewer/pkm', 'icon' => 'Star', 'permission_name' => 'pkm_proposals.review'],
                ['title' => 'Cek Jurnal', 'url' => '/journals', 'icon' => 'Newspaper', 'permission_name' => 'journal_consultations.view'],
            ],
            'KKN (Kuliah Kerja Nyata)' => [
                ['title' => 'Status KKN Saya', 'url' => '/kkn/status', 'icon' => 'ClipboardList', 'permission_name' => 'kkn.register'],
                ['title' => 'Kelompok KKN Saya', 'url' => '/dashboard/kkn/group', 'icon' => 'Users', 'permission_name' => 'kkn_group.view'],
                ['title' => 'Periode KKN', 'url' => '/kkn/periods', 'icon' => 'Calendar', 'permission_name' => 'kkn_periods.view'],
                ['title' => 'Pendaftaran', 'url' => '/kkn/registration', 'icon' => 'Users', 'permission_name' => 'kkn_registrations.view'],
                ['title' => 'Lokasi KKN', 'url' => '/kkn/locations', 'icon' => 'MapPin', 'permission_name' => 'kkn_locations.view'],
                ['title' => 'Posko KKN', 'url' => '/kkn/postos', 'icon' => 'Home', 'permission_name' => 'kkn_postos.view'],
                ['title' => 'Peserta KKN', 'url' => '/kkn/participants', 'icon' => 'Users', 'permission_name' => 'kkn_participants.view'],
                ['title' => 'Bimbingan', 'url' => '/dashboard/kkn/guidance', 'icon' => 'MessageSquare', 'permission_name' => 'kkn_guidance.view'],
                ['title' => 'Laporan & Kegiatan', 'url' => '/dashboard/kkn/reports', 'icon' => 'FileText', 'permission_name' => 'kkn_reports.view'],
                ['title' => 'Penilaian', 'url' => '/kkn/assessment', 'icon' => 'Award', 'permission_name' => 'kkn_grades.view'],
                ['title' => 'Pengaturan Penilaian', 'url' => '/kkn/grading-settings', 'icon' => 'SlidersHorizontal', 'permission_name' => 'kkn_grades.settings'],
                ['title' => 'Template Dokumen KKN', 'url' => '/kkn/document-templates', 'icon' => 'FileText', 'permission_name' => 'kkn_document_templates.view'],
                ['title' => 'Monitoring Lapangan', 'url' => '/kkn/monitoring-lapangan', 'icon' => 'TrendingUp', 'permission_name' => 'kkn_field_monitorings.view'],
                ['title' => 'Tim Monitoring', 'url' => '/kkn/tim-monitoring', 'icon' => 'ShieldCheck', 'permission_name' => 'kkn_monitor_team.view'],
                ['title' => 'Laporan Monitoring', 'url' => '/reports', 'icon' => 'BarChart2', 'permission_name' => 'reports.view_all'],
            ],
            'Master Data' => [
                ['title' => 'Fakultas', 'url' => '/master/faculties', 'icon' => 'Building2', 'permission_name' => 'faculties.view'],
                ['title' => 'Program Studi', 'url' => '/master/study-programs', 'icon' => 'GraduationCap', 'permission_name' => 'study_programs.view'],
                ['title' => 'Tahun Akademik', 'url' => '/master/fiscal-years', 'icon' => 'CalendarClock', 'permission_name' => 'fiscal_years.view'],
                ['title' => 'Skema Program', 'url' => '/master/schemes', 'icon' => 'Tags', 'permission_name' => 'schemes.view'],
                ['title' => 'Data Mahasiswa', 'url' => '/master/students', 'icon' => 'Users', 'permission_name' => 'students.view'],
                ['title' => 'Rumpun Ilmu', 'url' => '/master/science-clusters', 'icon' => 'Microscope', 'permission_name' => 'master_science_clusters.view'],
                ['title' => 'Prioritas Riset', 'url' => '/master/research-priorities', 'icon' => 'Target', 'permission_name' => 'master_research_priorities.view'],
                ['title' => 'Tema SDG', 'url' => '/master/sdgs', 'icon' => 'Globe2', 'permission_name' => 'master_selections.view'],
                ['title' => 'Master PKM', 'url' => '/master/pkm', 'icon' => 'HeartHandshake', 'permission_name' => 'pkm_master_data.view'],
            ],
            'Manajemen Sistem' => [
                ['title' => 'Pengguna', 'url' => '/master/users', 'icon' => 'UserCog', 'permission_name' => 'users.view'],
                ['title' => 'Role & Permission', 'url' => '/admin/roles', 'icon' => 'ShieldAlert', 'permission_name' => 'roles.view'],
                ['title' => 'Manajemen Menu', 'url' => '/admin/menus', 'icon' => 'MenuSquare', 'permission_name' => 'menus.view'],
                ['title' => 'Manajemen Organisasi', 'url' => '/admin/organization', 'icon' => 'Network', 'permission_name' => 'organization.edit'],
                ['title' => 'Halaman Statis', 'url' => '/admin/pages', 'icon' => 'BookOpen', 'permission_name' => 'pages.view'],
                ['title' => 'Pengaturan', 'url' => '/admin/settings', 'icon' => 'Settings', 'permission_name' => 'settings.view'],
            ],
            'CMS & Informasi' => [
                ['title' => 'Berita & Artikel', 'url' => '/cms/posts', 'icon' => 'Newspaper', 'permission_name' => 'posts.view'],
                ['title' => 'Dokumen', 'url' => '/cms/documents', 'icon' => 'FileText', 'permission_name' => 'documents.view'],
                ['title' => 'Galeri', 'url' => '/cms/galleries', 'icon' => 'Image', 'permission_name' => 'galleries.view'],
            ],
            'Profil' => [
                ['title' => 'Profil Saya', 'url' => '/profile', 'icon' => 'User', 'permission_name' => null],
                ['title' => 'Kinerja Dosen', 'url' => '/profile/stats', 'icon' => 'TrendingUp', 'permission_name' => 'lecturer_stats.view'],
                ['title' => 'Organisasi', 'url' => '/organization', 'icon' => 'Users', 'permission_name' => 'organization.view'],
            ],
        ];
    }

    /**
     * Non-destructively ensure all permissions exist on both web & api guards,
     * sync admin role, and preserve split menu permissions for existing roles.
     */
    public static function syncPermissions(bool $preserveExistingSplits = true): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $allNames = self::allPermissionNames();
        $guards = ['web', 'api'];

        foreach ($guards as $guard) {
            foreach ($allNames as $name) {
                Permission::firstOrCreate(['name' => $name, 'guard_name' => $guard]);
            }

            $roleAdmin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => $guard]);
            $roleAdmin->syncPermissions(Permission::where('guard_name', $guard)->get());

            if ($preserveExistingSplits) {
                $splitPairs = [
                    'kkn_registrations.view' => ['kkn_participants.view'],
                    'kkn_periods.view' => ['kkn_document_templates.view'],
                    'users.view' => ['students.view'],
                ];

                foreach (Role::where('guard_name', $guard)->where('name', '!=', 'admin')->with('permissions')->get() as $role) {
                    $held = $role->permissions->pluck('name')->all();
                    foreach ($splitPairs as $legacyPerm => $newPerms) {
                        if (in_array($legacyPerm, $held, true)) {
                            foreach ($newPerms as $newPerm) {
                                if (!in_array($newPerm, $held, true)) {
                                    $role->givePermissionTo($newPerm);
                                }
                            }
                        }
                    }
                }
            }
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /**
     * Upsert all canonical sidebar menu groups and items into the menus/menu_items tables.
     */
    public static function syncSidebarMenu(): void
    {
        $sidebar = Menu::updateOrCreate(
            ['location' => 'sidebar'],
            ['name' => 'Sidebar Navigation', 'is_active' => true]
        );

        $groupOrder = 0;
        $validGroupIds = [];
        $validItemIds = [];

        foreach (self::sidebarGroups() as $groupName => $items) {
            $group = MenuItem::where('menu_id', $sidebar->id)
                ->whereNull('parent_id')
                ->where('title', $groupName)
                ->first();

            if (!$group) {
                $group = new MenuItem();
                $group->menu_id = $sidebar->id;
                $group->parent_id = null;
            }

            $group->title = $groupName;
            $group->url = '#';
            $group->order = $groupOrder++;
            $group->save();
            $validGroupIds[] = $group->id;

            $itemOrder = 0;
            foreach ($items as $itemData) {
                $item = MenuItem::where('menu_id', $sidebar->id)
                    ->where('url', $itemData['url'])
                    ->whereNotNull('parent_id')
                    ->first();

                if (!$item) {
                    $item = new MenuItem();
                    $item->menu_id = $sidebar->id;
                }

                $item->parent_id = $group->id;
                $item->title = $itemData['title'];
                $item->url = $itemData['url'];
                $item->icon = $itemData['icon'];
                $item->permission_name = $itemData['permission_name'];
                $item->target = $item->target ?: '_self';
                $item->order = $itemOrder++;
                $item->save();

                // Clean up any duplicate sidebar items with the same URL so stale un-permissioned copies never remain
                MenuItem::where('menu_id', $sidebar->id)
                    ->where('url', $itemData['url'])
                    ->where('id', '!=', $item->id)
                    ->delete();

                $validItemIds[] = $item->id;
            }
        }
    }
}

