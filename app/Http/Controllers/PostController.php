<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Post::where('is_published', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string|max:50',
            'thumbnail' => 'nullable|file|image|max:2048',
            'video_url' => 'nullable|url',
            'is_published' => 'boolean'
        ]);

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = time() . '_' . uniqid() . '.webp';
            
            // Generate WebP
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file);
            $image->scale(width: 800);
            $encoded = $image->toWebp(quality: 80);

            // Save to public storage
            Storage::disk('public')->put('thumbnails/' . $filename, (string) $encoded);
            $validated['thumbnail'] = '/storage/thumbnails/' . $filename;
        }

        $validated['created_by'] = auth('api')->id();

        $post = Post::create($validated);
        return response()->json($post, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $post = Post::where('id', $id)->orWhere('slug', $id)->firstOrFail();
        return response()->json($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // Note: validation rules for update need to be careful with 'sometimes'
        // If sending FormData with a file, the request might not contain 'content' if not changed etc.
        // Frontend sends all fields usually.

        $rules = [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'category' => 'sometimes|string|max:50',
            'video_url' => 'nullable|url',
            'is_published' => 'boolean'
        ];

        // Only validate thumbnail if it's a file (new upload)
        if ($request->hasFile('thumbnail')) {
            $rules['thumbnail'] = 'file|image|max:2048';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('thumbnail')) {
             $file = $request->file('thumbnail');
             $filename = time() . '_' . uniqid() . '.webp';
             
             // Generate WebP
             $manager = new ImageManager(new Driver());
             $image = $manager->read($file);
             $image->scale(width: 800);
             $encoded = $image->toWebp(quality: 80);
 
             // Save to public storage
             Storage::disk('public')->put('thumbnails/' . $filename, (string) $encoded);
             $validated['thumbnail'] = '/storage/thumbnails/' . $filename;

             // Optional: Delete old thumbnail if exists? 
             // For now, keep it simple as requested.
        }

        // Handle boolean conversion from FormData string "true"/"false" if necessary
        // Laravel validation 'boolean' handles 0,1,'0','1',true,false.
        // But if FormData sends "true" string, we might need to cast explicitly if model casting isn't enough?
        // Actually Laravel request->validate handles it well usually.
        // But let's check input
        if ($request->has('is_published')) {
             $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }

        $post->update($validated);
        return response()->json($post);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }
}
