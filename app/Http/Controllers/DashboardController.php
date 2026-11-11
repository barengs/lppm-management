<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KknRegistration;
use App\Models\User;
use App\Models\KknPosto;
use App\Models\Proposal;
use App\Models\FiscalYear;
use App\Models\StudyProgram;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $fiscalYears = FiscalYear::orderByDesc('year')->get(['id', 'year', 'is_active']);
        $requestedFyId = $request->query('fiscal_year_id');
        $selectedFiscalYear = $requestedFyId
            ? $fiscalYears->firstWhere('id', (int) $requestedFyId)
            : ($fiscalYears->firstWhere('is_active', true) ?? $fiscalYears->first());
        $selectedFiscalYearId = $selectedFiscalYear?->id;

        // 1. Peserta KKN per Periode (Status Approved)
        $participantsPerPeriod = KknRegistration::select('fiscal_year_id', DB::raw('count(*) as total'))
            ->where('status', 'approved')
            ->groupBy('fiscal_year_id')
            ->with('fiscalYear')
            ->get()
            ->map(function ($item) {
                return [
                    'year' => $item->fiscalYear->year ?? 'Unknown',
                    'total' => $item->total
                ];
            });

        // 2. Data Dosen (role 'dosen') + sebaran per Prodi
        $studyProgramMap = StudyProgram::pluck('name', 'id')->toArray();
        $lecturers = User::whereHas('roles', function ($q) {
                $q->where('name', 'dosen');
            })
            ->with('dosenProfile.studyProgram')
            ->get();
        $lecturerCount = $lecturers->count();
        $lecturersPerProdi = $this->groupProfilesByProdi(
            $lecturers->map(fn ($user) => $user->dosenProfile),
            $studyProgramMap
        );

        // 3. Data Mahasiswa (Peserta KKN Approved) per Prodi pada Tahun Akademik terpilih
        $studentProfiles = $selectedFiscalYearId
            ? KknRegistration::where('status', 'approved')
                ->where('fiscal_year_id', $selectedFiscalYearId)
                ->with('student.mahasiswaProfile.studyProgram')
                ->get()
                ->map(fn ($reg) => $reg->student?->mahasiswaProfile)
            : collect();
        $studentsPerProdi = $this->groupProfilesByProdi($studentProfiles, $studyProgramMap);

        // 4. Jumlah Lokasi KKN per Periode (Based on Postos created)
        $locationsPerPeriod = KknPosto::select('fiscal_year_id', DB::raw('count(distinct kkn_location_id) as total'))
            ->groupBy('fiscal_year_id')
            ->with('fiscalYear')
            ->get()
            ->map(function ($item) {
                return [
                    'year' => $item->fiscalYear->year ?? 'Unknown',
                    'total' => $item->total
                ];
            });

        // 5. Jumlah Abmas per Periode
        $abmasPerPeriod = Proposal::whereHas('scheme', function($q) {
                $q->where('type', 'abmas');
            })
            ->select('fiscal_year_id', DB::raw('count(*) as total'))
            ->groupBy('fiscal_year_id')
            ->with('fiscalYear')
            ->get()
            ->map(function ($item) {
                return [
                    'year' => $item->fiscalYear->year ?? 'Unknown',
                    'total' => $item->total
                ];
            });

        // 6. Pending Consents Count (For current user)
        $pendingConsentsCount = \App\Models\ProposalPersonnel::where('user_id', auth()->id())
            ->where('is_confirmed', false)
            ->count();

        return response()->json([
            'participants_per_period' => $participantsPerPeriod,
            'lecturer_count' => $lecturerCount,
            'locations_per_period' => $locationsPerPeriod,
            'abmas_per_period' => $abmasPerPeriod,
            'pending_consents_count' => $pendingConsentsCount,
            'fiscal_years' => $fiscalYears,
            'selected_fiscal_year_id' => $selectedFiscalYearId,
            'lecturers_per_prodi' => $lecturersPerProdi,
            'students_per_prodi' => $studentsPerProdi,
        ]);
    }

    private function groupProfilesByProdi(iterable $profiles, array $studyProgramMap): array
    {
        $counts = [];
        foreach ($profiles as $profile) {
            $prodiName = $this->resolveProdiName($profile, $studyProgramMap);
            $counts[$prodiName] = ($counts[$prodiName] ?? 0) + 1;
        }

        arsort($counts);

        $result = [];
        foreach ($counts as $name => $value) {
            $result[] = [
                'name' => $name,
                'value' => $value,
            ];
        }

        return $result;
    }

    private function resolveProdiName($profile, array $studyProgramMap): string
    {
        if (!$profile) {
            return 'Belum Diatur';
        }

        if ($profile->studyProgram?->name) {
            return $profile->studyProgram->name;
        }

        $raw = $profile->prodi;
        if ($raw !== null && $raw !== '') {
            if (is_numeric($raw) && isset($studyProgramMap[(int) $raw])) {
                return $studyProgramMap[(int) $raw];
            }
            $trimmed = trim((string) $raw);
            if ($trimmed !== '' && strtolower($trimmed) !== 'null') {
                return $trimmed;
            }
        }

        return 'Belum Diatur';
    }
}
