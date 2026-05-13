<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KknRegistration;
use App\Models\KknGrade;
use App\Models\KknGradingSetting;
use App\Models\KknPosto;
use App\Models\KknPostoMember;
use App\Models\KknPeriod;
use App\Exports\KknGradesExport;
use Maatwebsite\Excel\Facades\Excel;

class KknGradeController extends Controller
{
    // ─── Helpers ────────────────────────────────────────────────────────────

    /**
     * Build a base query for grading index (staff/admin).
     */
    private function baseQuery(Request $request)
    {
        $query = KknRegistration::with([
            'student.mahasiswaProfile.faculty',
            'student.mahasiswaProfile.studyProgram',
            'kknGrade',
            'kknLocation',
            'kknPosto.dpl',
        ])->where('status', 'approved');

        if ($request->filled('kkn_period_id')) {
            $query->where('kkn_period_id', $request->kkn_period_id);
        }
        if ($request->filled('kkn_location_id')) {
            $query->where('kkn_location_id', $request->kkn_location_id);
        }
        if ($request->filled('kkn_posto_id')) {
            $postoMemberIds = KknPostoMember::where('kkn_posto_id', $request->kkn_posto_id)
                ->pluck('kkn_registration_id');
            $query->whereIn('id', $postoMemberIds);
        }
        if ($request->filled('faculty_id')) {
            $query->whereHas('student.mahasiswaProfile', fn($q) =>
                $q->where('fakultas', $request->faculty_id));
        }
        if ($request->filled('prodi_id')) {
            $query->whereHas('student.mahasiswaProfile', fn($q) =>
                $q->where('prodi', $request->prodi_id));
        }

        return $query;
    }

    // ─── Index (Staff/Admin) ────────────────────────────────────────────────

    public function index(Request $request)
    {
        $registrations = $this->baseQuery($request)->paginate(20);
        $settings      = $this->getSettingsForRequest($request);

        return response()->json([
            'data'     => $registrations,
            'settings' => $settings,
        ]);
    }

    // ─── DPL View ───────────────────────────────────────────────────────────

    /**
     * GET /kkn-grades/dpl-students
     * Returns only students from postos where auth user is the DPL.
     */
    public function dplStudents(Request $request)
    {
        $user = auth('api')->user();

        // Find all postos where this user is the DPL
        $postoIds = KknPosto::where('dpl_id', $user->id)->pluck('id');
        if ($postoIds->isEmpty()) {
            return response()->json(['data' => [], 'settings' => null, 'message' => 'Tidak ada posko yang Anda bimbing.']);
        }

        // Get registration IDs from those postos
        $registrationIds = KknPostoMember::whereIn('kkn_posto_id', $postoIds)
            ->pluck('kkn_registration_id');

        $query = KknRegistration::with([
            'student.mahasiswaProfile.faculty',
            'student.mahasiswaProfile.studyProgram',
            'kknGrade',
            'kknLocation',
            'kknPosto',
        ])
        ->where('status', 'approved')
        ->whereIn('id', $registrationIds);

        if ($request->filled('kkn_posto_id')) {
            $filteredIds = KknPostoMember::where('kkn_posto_id', $request->kkn_posto_id)
                ->pluck('kkn_registration_id');
            $query->whereIn('id', $filteredIds);
        }

        $registrations = $query->get();
        $settings      = $this->getSettingsForRequest($request);

        return response()->json([
            'data'     => $registrations,
            'postos'   => KknPosto::whereIn('id', $postoIds)->with('location')->get(),
            'settings' => $settings,
        ]);
    }

    // ─── Save DPL Scores (Primer + Sekunder) ────────────────────────────────

    /**
     * POST /kkn-grades/dpl-score
     * DPL submits Nilai Primer (W1-W4) and Nilai Sekunder.
     */
    public function saveDplScore(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'kkn_registration_id' => 'required|exists:kkn_registrations,id',
            'w1_score'            => 'nullable|numeric|min:0',
            'w2_score'            => 'nullable|numeric|min:0',
            'w3_score'            => 'nullable|numeric|min:0',
            'w4_score'            => 'nullable|numeric|min:0',
            'secondary_score'     => 'nullable|numeric|min:0',
        ]);

        $registration = KknRegistration::findOrFail($validated['kkn_registration_id']);

        // ── Authorization: User must be the DPL of this student's posto ──
        $isAdminOrLppm = $user->hasAnyRole(['admin', 'ketua_lppm', 'staff']);
        if (!$isAdminOrLppm) {
            $posto = $registration->kknPosto;
            if (!$posto || $posto->dpl_id !== $user->id) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk menilai mahasiswa ini. Hanya DPL dari posko terkait yang dapat memberikan nilai lapangan.'
                ], 403);
            }
        }

        // ── Fetch settings to validate max scores ──
        $settings = $this->getSettingsForRegistration($registration);

        if ($settings) {
            $maxes = ['w1_score' => 'w1_max', 'w2_score' => 'w2_max', 'w3_score' => 'w3_max', 'w4_score' => 'w4_max', 'secondary_score' => 'secondary_max'];
            foreach ($maxes as $field => $maxField) {
                if (isset($validated[$field]) && $validated[$field] > $settings->$maxField) {
                    return response()->json([
                        'message' => "Nilai {$field} melebihi batas maksimum yang diizinkan ({$settings->$maxField})."
                    ], 422);
                }
            }
        }

        // ── Save or update grade ──
        $grade = KknGrade::firstOrNew(['kkn_registration_id' => $registration->id]);
        $grade->fill([
            'graded_by'      => $user->id,
            'dpl_id'         => $user->id,
            'w1_score'       => $validated['w1_score']       ?? $grade->w1_score,
            'w2_score'       => $validated['w2_score']       ?? $grade->w2_score,
            'w3_score'       => $validated['w3_score']       ?? $grade->w3_score,
            'w4_score'       => $validated['w4_score']       ?? $grade->w4_score,
            'secondary_score'=> $validated['secondary_score'] ?? $grade->secondary_score,
        ]);

        if (!$grade->certificate_number) {
            $npm = $registration->student->mahasiswaProfile->npm ?? $registration->student_id;
            $grade->certificate_number = 'KKN-' . date('Y') . '-' . $npm;
        }

        $grade->save();
        $grade->recalculate();

        return response()->json($grade->fresh());
    }

    // ─── Save Article Score (LPPM) ───────────────────────────────────────────

    /**
     * POST /kkn-grades/article-score
     * LPPM submits Nilai Artikel Ilmiah.
     */
    public function saveArticleScore(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'kkn_registration_id' => 'required|exists:kkn_registrations,id',
            'article_score'       => 'required|numeric|min:0',
        ]);

        $registration = KknRegistration::findOrFail($validated['kkn_registration_id']);

        // Fetch settings to validate max score
        $settings = $this->getSettingsForRegistration($registration);
        if ($settings && $validated['article_score'] > $settings->article_max) {
            return response()->json([
                'message' => "Nilai artikel melebihi batas maksimum yang diizinkan ({$settings->article_max})."
            ], 422);
        }

        $grade = KknGrade::firstOrNew(['kkn_registration_id' => $registration->id]);
        $grade->fill([
            'graded_by'          => $grade->graded_by ?? $user->id,
            'article_graded_by'  => $user->id,
            'article_score'      => $validated['article_score'],
        ]);

        if (!$grade->certificate_number) {
            $npm = $registration->student->mahasiswaProfile->npm ?? $registration->student_id;
            $grade->certificate_number = 'KKN-' . date('Y') . '-' . $npm;
        }

        $grade->save();
        $grade->recalculate();

        return response()->json($grade->fresh());
    }

    // ─── Bulk Save DPL Scores (all students in a posto at once) ─────────────

    /**
     * POST /kkn-grades/dpl-batch
     * DPL submits scores for multiple students in one POST.
     */
    public function saveDplBatch(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'entries'                         => 'required|array|min:1',
            'entries.*.kkn_registration_id'   => 'required|exists:kkn_registrations,id',
            'entries.*.w1_score'              => 'nullable|numeric|min:0',
            'entries.*.w2_score'              => 'nullable|numeric|min:0',
            'entries.*.w3_score'              => 'nullable|numeric|min:0',
            'entries.*.w4_score'              => 'nullable|numeric|min:0',
            'entries.*.secondary_score'       => 'nullable|numeric|min:0',
        ]);

        $results = [];
        foreach ($validated['entries'] as $entry) {
            $fakeRequest = new Request($entry);
            $fakeRequest->setUserResolver(fn() => $user);
            // Delegate to saveDplScore for each entry (reuse auth + validation logic)
            $response = $this->saveDplScore(new Request($entry));
            $results[] = $response->getData();
        }

        return response()->json(['saved' => count($results), 'results' => $results]);
    }

    // ─── Grading Settings CRUD ───────────────────────────────────────────────

    public function getGradingSettings(Request $request)
    {
        $settings = KknGradingSetting::with('period');
        if ($request->filled('kkn_period_id')) {
            $settings = $settings->where('kkn_period_id', $request->kkn_period_id)->first();
        } else {
            $settings = $settings->latest()->first();
        }

        return response()->json($settings);
    }

    public function saveGradingSettings(Request $request)
    {
        $validated = $request->validate([
            'kkn_period_id'  => 'required|exists:kkn_periods,id',
            'w1_max'         => 'required|integer|min:1|max:100',
            'w2_max'         => 'required|integer|min:1|max:100',
            'w3_max'         => 'required|integer|min:1|max:100',
            'w4_max'         => 'required|integer|min:1|max:100',
            'secondary_max'  => 'required|integer|min:1|max:500',
            'article_max'    => 'required|integer|min:1|max:200',
        ]);

        $settings = KknGradingSetting::updateOrCreate(
            ['kkn_period_id' => $validated['kkn_period_id']],
            $validated
        );

        return response()->json($settings);
    }

    // ─── Legacy (kept for compatibility) ────────────────────────────────────

    public function store(Request $request)
    {
        return $this->saveDplScore($request);
    }

    // ─── Exports ──────────────────────────────────────────────────────────────

    public function exportPdf(Request $request)
    {
        $registrations = $this->baseQuery($request)->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.kkn_grades', [
            'registrations' => $registrations,
            'filters' => [
                'location' => $request->kkn_location_id
                    ? \App\Models\KknLocation::find($request->kkn_location_id)?->name
                    : 'Semua Lokasi',
                'posto' => $request->kkn_posto_id
                    ? KknPosto::find($request->kkn_posto_id)?->name
                    : 'Semua Posko',
                'faculty'  => $request->faculty_id
                    ? \App\Models\Faculty::find($request->faculty_id)?->name
                    : 'Semua Fakultas',
                'prodi' => $request->prodi_id
                    ? \App\Models\StudyProgram::find($request->prodi_id)?->name
                    : 'Semua Prodi',
            ],
        ]);

        $pdf->setPaper('A4', 'landscape');
        return $pdf->stream('Rekap-Nilai-KKN.pdf');
    }

    public function exportExcel(Request $request)
    {
        $filename = 'Rekap-Nilai-KKN-' . date('Ymd-His') . '.xlsx';
        return Excel::download(new KknGradesExport($request), $filename);
    }

    // ─── Student Endpoints ───────────────────────────────────────────────────

    public function myGrade()
    {
        $reg = KknRegistration::where('student_id', auth()->id())
            ->where('status', 'approved')
            ->with(['kknGrade', 'kknLocation'])
            ->first();

        if (!$reg) {
            return response()->json(['message' => 'Data tidak ditemukan atau belum disetujui.'], 404);
        }

        return response()->json($reg);
    }

    public function downloadCertificate()
    {
        $user = auth()->user();
        $registration = KknRegistration::where('student_id', $user->id)
            ->where('status', 'approved')
            ->with(['kknGrade', 'kknLocation', 'student.mahasiswaProfile'])
            ->firstOrFail();

        if (!$registration->kknGrade || !$registration->kknGrade->is_finalized) {
            return response()->json(['message' => 'Nilai belum dirilis atau belum final.'], 400);
        }

        $data = [
            'name'               => $user->name,
            'npm'                => $registration->student->mahasiswaProfile->npm,
            'location'           => $registration->kknLocation->name,
            'village'            => $registration->kknLocation->village,
            'grade'              => $registration->kknGrade->grade,
            'score'              => $registration->kknGrade->final_score,
            'certificate_number' => $registration->kknGrade->certificate_number,
            'date'               => now()->translatedFormat('d F Y'),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.certificate', $data);
        $pdf->setPaper('A4', 'landscape');
        return $pdf->stream('Sertifikat-KKN.pdf');
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function getSettingsForRequest(Request $request): ?KknGradingSetting
    {
        if ($request->filled('kkn_period_id')) {
            return KknGradingSetting::where('kkn_period_id', $request->kkn_period_id)->first();
        }
        // Try to find the active period
        $activePeriod = KknPeriod::where('is_active', true)->first()
            ?? KknPeriod::latest()->first();

        return $activePeriod
            ? KknGradingSetting::where('kkn_period_id', $activePeriod->id)->first()
            : null;
    }

    private function getSettingsForRegistration(KknRegistration $registration): ?KknGradingSetting
    {
        if ($registration->kkn_period_id) {
            return KknGradingSetting::where('kkn_period_id', $registration->kkn_period_id)->first();
        }
        return null;
    }
}
