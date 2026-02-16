<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pages = Page::orderBy('created_at', 'desc')->get();
        // Append hero_desc and body from content json for easier frontend access if needed
        // But frontend can access content.hero_desc
        return response()->json($pages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'body' => 'nullable|string', // Content body
            'hero_title' => 'nullable|string|max:255',
            'hero_desc' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        // Generate Slug
        $slug = $validated['slug'] ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        
        // Ensure uniqueness
        $originalSlug = $slug;
        $count = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        // Prepare Content JSON
        $content = [
            'body' => $validated['body'] ?? '',
            'hero_title' => $validated['hero_title'] ?? $validated['title'],
            'hero_desc' => $validated['hero_desc'] ?? '',
        ];

        $page = Page::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $content,
            'type' => 'page', // Default type for custom pages
            'is_published' => $validated['is_published'] ?? false,
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
        ]);

        return response()->json($page, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $page = Page::findOrFail($id);
        return response()->json($page);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug,' . $id,
            'body' => 'nullable|string',
            'hero_title' => 'nullable|string|max:255',
            'hero_desc' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        // Handle Slug
        if (isset($validated['slug']) && $validated['slug'] !== $page->slug) {
            $slug = Str::slug($validated['slug']);
             // Ensure uniqueness
            $originalSlug = $slug;
            $count = 1;
            while (Page::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
        } else {
            $slug = $page->slug;
        }

        // Prepare Content JSON (Merge with existing to preserve other keys like info_cards)
        $currentContent = $page->content ?? [];
        $newContentFields = [
            'body' => $validated['body'] ?? ($currentContent['body'] ?? ''),
            'hero_title' => $validated['hero_title'] ?? ($currentContent['hero_title'] ?? $validated['title']),
            'hero_desc' => $validated['hero_desc'] ?? ($currentContent['hero_desc'] ?? ''),
        ];
        
        $content = array_merge($currentContent, $newContentFields);

        $page->update([
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $content,
            'is_published' => $validated['is_published'] ?? $page->is_published,
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
        ]);

        return response()->json($page);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $page = Page::findOrFail($id);
        $page->delete();
        return response()->json(null, 204);
    }
}
