<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(Page::all());
    }

    public function show($identifier)
    {
        // Try to find by slug first, then fallback to type for backward compatibility
        $page = Page::where('slug', $identifier)
                    ->orWhere('type', $identifier)
                    ->where('is_published', true) // improved security
                    ->first();
        
        if (!$page) {
             return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json($page);
    }
    
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        $page->update($request->all()); // secure this later with validation
        return response()->json($page);
    }
}
