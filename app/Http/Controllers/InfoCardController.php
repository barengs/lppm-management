<?php

namespace App\Http\Controllers;

use App\Models\InfoCard;
use Illuminate\Http\Request;

class InfoCardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Fetch Pages (Dynamic Content)
        $pages = \App\Models\Page::where('is_published', true)
            ->whereNotNull('icon') // Only those with icons intended for cards
            ->get()
            ->map(function ($page) {
                return [
                    'id' => 'p-' . $page->id,
                    'title' => $page->title,
                    'description' => $page->hero_desc ?? $page->title,
                    'icon' => $page->icon,
                    'slug' => $page->slug,
                    'url' => '/pages/' . $page->slug,
                    'order' => 1 // Sort logic needed or default
                ];
            });

        // 2. Define Special Modules (Hardcoded as per user request)
        $specialModules = collect([
             [
                'id' => 'm-sim',
                'title' => 'SIM PENGABDIAN',
                'description' => 'Sistem Informasi Manajemen Pengabdian',
                'icon' => 'BookOpen',
                'url' => '/pages/sim-pengabdian', // Updated from seeder: typically external app, but linking to page or direct. User said "own module". Let's assume URL logic in frontend handles or external.
                // Actually, user said "SIM PENGABDIAN" has its own module. 
                // Currently pointing to external or login. 
                // Let's point to /login for now as per previous seeder logic or allow frontend to handle.
                'url' => '/login', 
                'slug' => null,
                'order' => 3
            ],
            [
                'id' => 'm-kkn',
                'title' => 'INFO KULIAH KERJA NYATA',
                'description' => 'Informasi pelaksanaan KKN Reguler & Tematik',
                'icon' => 'Users',
                'url' => '/kkn/register',
                'slug' => 'kkn',
                'order' => 4
            ],
            [
                'id' => 'm-pub',
                'title' => 'INFO PUBLIKASI',
                'description' => 'Jurnal Ilmiah dan Prosiding Seminar',
                'icon' => 'BookOpen',
                'url' => 'https://jurnal.uim.ac.id',
                'slug' => null,
                'order' => 5
            ],
            [
                'id' => 'm-doc',
                'title' => 'BERKAS UNDUHAN',
                'description' => 'Template Proposal dan Panduan',
                'icon' => 'Download',
                'url' => '/documents',
                'slug' => null,
                'order' => 6
            ],
            [
                'id' => 'm-sur',
                'title' => 'SURVEI PELAYANAN',
                'description' => 'Kepuasan Layanan LPPM UIM',
                'icon' => 'BarChart2',
                'url' => '/survey',
                'slug' => null,
                'order' => 7
            ]
        ]);

        // Merge and Sort
        // Priority: Pages, then Special Modules? Or mix?
        // User didn't specify sort. Let's just merge.
        
        $merged = $pages->concat($specialModules);

        return response()->json($merged);
    }

    /**
     * Store a newly created resource in storage (Admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'url' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'integer',
            'content' => 'nullable|string',
            'slug' => 'nullable|string|unique:info_cards,slug'
        ]);
        
        return response()->json(InfoCard::create($validated), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($slug)
    {
        $card = InfoCard::where('slug', $slug)->firstOrFail();
        return response()->json($card);
    }
}
