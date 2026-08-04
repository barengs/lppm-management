<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\MenuItem;

class MenuSeeder extends Seeder
{
    public function run()
    {
        // 1. Primary Navbar
        $navbar = Menu::updateOrCreate(['location' => 'primary'], ['name' => 'Main Navbar']);
        $navbar->items()->delete();

        // Home
        MenuItem::create(['menu_id' => $navbar->id, 'title' => 'BERANDA', 'url' => '/', 'order' => 0]);

        // Program Kegiatan (Dropdown)
        $program = MenuItem::create(['menu_id' => $navbar->id, 'title' => 'PROGRAM KEGIATAN', 'url' => '#', 'order' => 1]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $program->id, 'title' => 'Penelitian', 'url' => '/pages/penelitian', 'order' => 0]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $program->id, 'title' => 'Kuliah Kerja Nyata', 'url' => '/kkn/register', 'order' => 1]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $program->id, 'title' => 'Pengabdian Masyarakat', 'url' => '/pages/pengabdian-masyarakat', 'order' => 2]);

        // Kebijakan (Dropdown)
        $kebijakan = MenuItem::create(['menu_id' => $navbar->id, 'title' => 'KEBIJAKAN', 'url' => '#', 'order' => 2]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $kebijakan->id, 'title' => 'Kebijakan Mutu', 'url' => '/pages/kebijakan-mutu', 'order' => 0]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $kebijakan->id, 'title' => 'Panduan Penelitian & Pengabdian', 'url' => '/pages/panduan-penelitian', 'order' => 1]);

        // Prosedur
        MenuItem::create(['menu_id' => $navbar->id, 'title' => 'PROSEDUR & ATURAN', 'url' => '/pages/prosedur-aturan', 'order' => 3]);

        // Tentang (Dropdown)
        $tentang = MenuItem::create(['menu_id' => $navbar->id, 'title' => 'TENTANG', 'url' => '#', 'order' => 4]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $tentang->id, 'title' => 'Visi Misi', 'url' => '/pages/visi-misi', 'order' => 0]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $tentang->id, 'title' => 'Struktur Organisasi', 'url' => '/about/organization', 'order' => 1]);
        MenuItem::create(['menu_id' => $navbar->id, 'parent_id' => $tentang->id, 'title' => 'Hubungi Kami', 'url' => '/pages/hubungi-kami', 'order' => 2]);


        // 2. Footer Links (Tautan Penting)
        $footer = Menu::updateOrCreate(['location' => 'footer_links'], ['name' => 'Footer Links']);
        $footer->items()->delete();
        MenuItem::create(['menu_id' => $footer->id, 'title' => 'Universitas Islam Madura', 'url' => 'https://uim.ac.id', 'target' => '_blank', 'order' => 0]);
        MenuItem::create(['menu_id' => $footer->id, 'title' => 'SINTA Kemdikbud', 'url' => 'https://sinta.kemdiktisaintek.go.id/', 'target' => '_blank', 'order' => 1]);
        MenuItem::create(['menu_id' => $footer->id, 'title' => 'GARUDA', 'url' => 'https://garuda.kemdiktisaintek.go.id/', 'target' => '_blank', 'order' => 2]);
        MenuItem::create(['menu_id' => $footer->id, 'title' => 'Google Scholar', 'url' => 'https://scholar.google.com', 'target' => '_blank', 'order' => 3]);

        // 3. Sidebar Menu
        $sidebar = Menu::updateOrCreate(['location' => 'sidebar'], ['name' => 'Sidebar Navigation']);
        $sidebar->items()->delete();

        $groups = [
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
                ['title' => 'Peserta KKN', 'url' => '/kkn/participants', 'icon' => 'Users', 'permission_name' => 'kkn_registrations.view'],
                ['title' => 'Bimbingan', 'url' => '/dashboard/kkn/guidance', 'icon' => 'MessageSquare', 'permission_name' => 'kkn_guidance.view'],
                ['title' => 'Laporan & Kegiatan', 'url' => '/dashboard/kkn/reports', 'icon' => 'FileText', 'permission_name' => 'kkn_reports.view'],
                ['title' => 'Penilaian', 'url' => '/kkn/assessment', 'icon' => 'Award', 'permission_name' => 'kkn_grades.view'],
                ['title' => 'Pengaturan Penilaian', 'url' => '/kkn/grading-settings', 'icon' => 'SlidersHorizontal', 'permission_name' => 'kkn_grades.settings'],
                ['title' => 'Monitoring Lapangan', 'url' => '/kkn/monitoring-lapangan', 'icon' => 'TrendingUp', 'permission_name' => 'kkn_field_monitorings.view'],
                ['title' => 'Laporan Monitoring', 'url' => '/reports', 'icon' => 'BarChart2', 'permission_name' => 'reports.view_all'],
            ],
            'Master Data' => [
                ['title' => 'Fakultas', 'url' => '/master/faculties', 'icon' => 'Building2', 'permission_name' => 'faculties.view'],
                ['title' => 'Program Studi', 'url' => '/master/study-programs', 'icon' => 'GraduationCap', 'permission_name' => 'study_programs.view'],
                ['title' => 'Tahun Akademik', 'url' => '/master/fiscal-years', 'icon' => 'CalendarClock', 'permission_name' => 'fiscal_years.view'],
                ['title' => 'Skema Program', 'url' => '/master/schemes', 'icon' => 'Tags', 'permission_name' => 'schemes.view'],
                ['title' => 'Data Mahasiswa', 'url' => '/master/students', 'icon' => 'Users', 'permission_name' => 'users.view'],
                ['title' => 'Rumpun Ilmu', 'url' => '/master/science-clusters', 'icon' => 'Microscope', 'permission_name' => 'master_science_clusters.view'],
                ['title' => 'Prioritas Riset', 'url' => '/master/research-priorities', 'icon' => 'Target', 'permission_name' => 'master_research_priorities.view'],
                ['title' => 'Tema SDG', 'url' => '/master/sdgs', 'icon' => 'Globe2', 'permission_name' => 'master_selections.view'],
                ['title' => 'Master PKM', 'url' => '/master/pkm', 'icon' => 'HeartHandshake', 'permission_name' => 'pkm_master_data.view'],
            ],
            'Manajemen Sistem' => [
                ['title' => 'Pengguna', 'url' => '/master/users', 'icon' => 'UserCog', 'permission_name' => 'users.view'],
                ['title' => 'Role & Permission', 'url' => '/admin/roles', 'icon' => 'ShieldAlert', 'permission_name' => 'roles.view'],
                ['title' => 'Manajemen Menu', 'url' => '/admin/menus', 'icon' => 'MenuSquare', 'permission_name' => 'menus.view'],
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

        $groupOrder = 0;
        foreach ($groups as $groupName => $items) {
            $group = MenuItem::create([
                'menu_id' => $sidebar->id,
                'title' => $groupName,
                'url' => '#',
                'order' => $groupOrder++,
            ]);

            $itemOrder = 0;
            foreach ($items as $item) {
                MenuItem::create([
                    'menu_id' => $sidebar->id,
                    'parent_id' => $group->id,
                    'title' => $item['title'],
                    'url' => $item['url'],
                    'icon' => $item['icon'],
                    'permission_name' => $item['permission_name'],
                    'order' => $itemOrder++,
                ]);
            }
        }
    }
}
