<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;

class SurveyController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'role' => 'required|string|in:dosen,mahasiswa,tendik,umum',
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'required|string',
        ]);

        $survey = Survey::create($validated);
        return response()->json($survey, 201);
    }

    /**
     * Display a listing of the resource (Admin only).
     */
    public function index()
    {
        return response()->json(Survey::latest()->get());
    }
}
