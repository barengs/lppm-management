<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Document::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file_path' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:20480', // 20MB Max
            'type' => 'required|in:guide,template,sk'
        ]);

        if ($request->hasFile('file_path')) {
            $path = $request->file('file_path')->store('documents', 'public');
            $validated['file_path'] = '/storage/' . $path;
        }

        $document = Document::create($validated);
        return response()->json($document, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        return response()->json($document);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:guide,template,sk'
        ];

        // Only validate file if it's being uploaded
        if ($request->hasFile('file_path')) {
            $rules['file_path'] = 'file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:20480';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('file_path')) {
            // Ideally delete old file here if needed:
            // if ($document->file_path) Storage::disk('public')->delete(str_replace('/storage/', '', $document->file_path));
            
            $path = $request->file('file_path')->store('documents', 'public');
            $validated['file_path'] = '/storage/' . $path;
        }

        $document->update($validated);
        return response()->json($document);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        $document->delete();
        return response()->json(['message' => 'Document deleted']);
    }
}
