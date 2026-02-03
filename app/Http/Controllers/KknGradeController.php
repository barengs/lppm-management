<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class KknGradeController extends Controller
{
    public function index(Request $request)
    {
        // Only list students with approved KKN status
        // and optionally filter by Year/Location
        $query = \App\Models\KknRegistration::with(['student.mahasiswaProfile', 'kknGrade', 'kknLocation'])
            ->where('status', 'approved');

        if ($request->has('kkn_location_id') && $request->kkn_location_id) {
            $query->where('kkn_location_id', $request->kkn_location_id);
        }

        // Filter by Posto
        if ($request->has('kkn_posto_id') && $request->kkn_posto_id) {
            $query->whereIn('id', \App\Models\KknPostoMember::where('kkn_posto_id', $request->kkn_posto_id)->pluck('kkn_registration_id'));
        }

        // Filter by Faculty
        if ($request->has('faculty_id') && $request->faculty_id) {
            $query->whereHas('student.mahasiswaProfile', function($q) use ($request) {
                $q->where('fakultas', $request->faculty_id);
            });
        }

        // Filter by Prodi
        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->whereHas('student.mahasiswaProfile', function($q) use ($request) {
                $q->where('prodi', $request->prodi_id);
            });
        }

        return response()->json($query->paginate(10));
    }

    public function exportPdf(Request $request)
    {
        $query = \App\Models\KknRegistration::with(['student.mahasiswaProfile.faculty', 'student.mahasiswaProfile.studyProgram', 'kknGrade', 'kknLocation'])
            ->where('status', 'approved');

        // Apply same filters as Index
        if ($request->has('kkn_location_id') && $request->kkn_location_id) {
            $query->where('kkn_location_id', $request->kkn_location_id);
        }

        if ($request->has('kkn_posto_id') && $request->kkn_posto_id) {
            $query->whereIn('id', \App\Models\KknPostoMember::where('kkn_posto_id', $request->kkn_posto_id)->pluck('kkn_registration_id'));
        }

        if ($request->has('faculty_id') && $request->faculty_id) {
            $query->whereHas('student.mahasiswaProfile', function($q) use ($request) {
                $q->where('fakultas', $request->faculty_id);
            });
        }

        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->whereHas('student.mahasiswaProfile', function($q) use ($request) {
                $q->where('prodi', $request->prodi_id);
            });
        }

        $registrations = $query->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.kkn_grades', [
            'registrations' => $registrations,
            'filters' => [
                'location' => $request->kkn_location_id ? \App\Models\KknLocation::find($request->kkn_location_id)?->name : 'Semua Lokasi',
                'posto' => $request->kkn_posto_id ? \App\Models\KknPosto::find($request->kkn_posto_id)?->name : 'Semua Posko',
                'faculty' => $request->faculty_id ? \App\Models\Faculty::find($request->faculty_id)?->name : 'Semua Fakultas',
                'prodi' => $request->prodi_id ? \App\Models\StudyProgram::find($request->prodi_id)?->name : 'Semua Prodi',
            ]
        ]);
        
        $pdf->setPaper('A4', 'landscape');
        return $pdf->stream('Rekap-Nilai-KKN.pdf');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kkn_registration_id' => 'required|exists:kkn_registrations,id',
            'numeric_score' => 'required|numeric|min:0|max:100',
        ]);

        $registration = \App\Models\KknRegistration::findOrFail($validated['kkn_registration_id']);
        
        // Calculate Grade Letter
        $score = $validated['numeric_score'];
        $grade = 'E';
        if ($score >= 85) $grade = 'A';
        elseif ($score >= 80) $grade = 'A-';
        elseif ($score >= 75) $grade = 'B+';
        elseif ($score >= 70) $grade = 'B';
        elseif ($score >= 65) $grade = 'B-';
        elseif ($score >= 60) $grade = 'C+';
        elseif ($score >= 55) $grade = 'C';
        elseif ($score >= 40) $grade = 'D';

        // Generate Certificate Number if not exists
        // KKN-{YEAR}-{PRODI}-{NPM}
        $certNum = null;
        $existingGrade = $registration->kknGrade;
        
        if ($existingGrade && $existingGrade->certificate_number) {
            $certNum = $existingGrade->certificate_number;
        } else {
            $year = date('Y');
            $npm = $registration->student->mahasiswaProfile->npm ?? $registration->student->id;
            $certNum = "KKN-{$year}-{$npm}";
        }

        $kknGrade = \App\Models\KknGrade::updateOrCreate(
            ['kkn_registration_id' => $registration->id],
            [
                'graded_by' => auth()->id(),
                'numeric_score' => $score,
                'grade' => $grade,
                'certificate_number' => $certNum
            ]
        );

        return response()->json($kknGrade);
    }

    public function myGrade()
    {
        $reg = \App\Models\KknRegistration::where('student_id', auth()->id())
            ->where('status', 'approved')
            ->with(['kknGrade', 'kknLocation'])
            ->first();

        if (!$reg) {
            return response()->json(['message' => 'Not found or not approved'], 404);
        }

        return response()->json($reg);
    }

    public function downloadCertificate()
    {
        $user = auth()->user();
        $registration = \App\Models\KknRegistration::where('student_id', $user->id)
            ->where('status', 'approved')
            ->with(['kknGrade', 'kknLocation', 'student.mahasiswaProfile'])
            ->firstOrFail();

        if (!$registration->kknGrade) {
            return response()->json(['message' => 'Grade not released yet'], 400);
        }

        $data = [
            'name' => $user->name,
            'npm' => $registration->student->mahasiswaProfile->npm,
            'location' => $registration->kknLocation->name,
            'village' => $registration->kknLocation->village,
            'grade' => $registration->kknGrade->grade,
            'score' => $registration->kknGrade->numeric_score,
            'certificate_number' => $registration->kknGrade->certificate_number,
            'date' => now()->translatedFormat('d F Y'),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.certificate', $data);
        $pdf->setPaper('A4', 'landscape');
        
        return $pdf->stream('Sertifikat-KKN.pdf');
    }
}
