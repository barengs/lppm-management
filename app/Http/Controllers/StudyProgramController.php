<?php

namespace App\Http\Controllers;

use App\Models\StudyProgram;
use App\Imports\StudyProgramsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class StudyProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = StudyProgram::with('faculty');

        if ($request->has('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:study_programs,code',
            'level' => 'required|in:D3,S1,S2,S3'
        ]);

        $studyProgram = StudyProgram::create($validated);
        return response()->json($studyProgram, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(StudyProgram $studyProgram)
    {
        return response()->json($studyProgram->load('faculty'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StudyProgram $studyProgram)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:study_programs,code,' . $studyProgram->id,
            'level' => 'required|in:D3,S1,S2,S3'
        ]);

        $studyProgram->update($validated);
        return response()->json($studyProgram);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StudyProgram $studyProgram)
    {
        $studyProgram->delete();
        return response()->json(['message' => 'Study Program deleted']);
    }

    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        Excel::import(new StudyProgramsImport, $request->file('file'));
        
        return response()->json(['message' => 'Import successful']);
    }

    public function downloadTemplate()
    {
        return Excel::download(new \App\Exports\StudyProgramsTemplateExport, 'study_programs_template.xlsx');
    }
}
