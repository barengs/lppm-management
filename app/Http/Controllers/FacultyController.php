<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Imports\FacultiesImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Faculty::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:faculties,code',
            'description' => 'nullable|string'
        ]);

        $faculty = Faculty::create($validated);
        return response()->json($faculty, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Faculty $faculty)
    {
        return response()->json($faculty);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:faculties,code,' . $faculty->id,
            'description' => 'nullable|string'
        ]);

        $faculty->update($validated);
        return response()->json($faculty);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted']);
    }

    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        Excel::import(new FacultiesImport, $request->file('file'));
        
        return response()->json(['message' => 'Import successful']);
    }

    public function downloadTemplate()
    {
        return Excel::download(new \App\Exports\FacultiesTemplateExport, 'faculties_template.xlsx');
    }
}
