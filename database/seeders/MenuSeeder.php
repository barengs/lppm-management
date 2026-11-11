<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Support\MenuPermissionCatalog;

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

        $groups = MenuPermissionCatalog::sidebarGroups();

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
