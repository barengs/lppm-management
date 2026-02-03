<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KknRegistration;
use App\Models\User;
use App\Models\KknPosto;
use App\Models\Proposal;
use App\Models\FiscalYear;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
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

        // 2. Jumlah Dosen (Active)
        $lecturerCount = User::where('role', 'dosen')->count();

        // 3. Jumlah Lokasi KKN per Periode (Based on Postos created)
        // We count distinct locations used in postos for each fiscal year
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

        // 4. Jumlah Abmas per Periode
        // Assuming Scheme has a 'type' column where 'abmas' is community service
        $abmasPerPeriod = Proposal::whereHas('scheme', function($q) {
                $q->where('type', 'abmas'); // Adjust based on Scheme model check
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

        return response()->json([
            'participants_per_period' => $participantsPerPeriod,
            'lecturer_count' => $lecturerCount,
            'locations_per_period' => $locationsPerPeriod,
            'abmas_per_period' => $abmasPerPeriod
        ]);
    }
}
