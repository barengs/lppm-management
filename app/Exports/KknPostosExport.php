<?php

namespace App\Exports;

use App\Models\KknPosto;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class KknPostosExport implements WithMultipleSheets
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function sheets(): array
    {
        $query = KknPosto::with([
            'location',
            'kknPeriod',
            'fiscalYear',
            'dpl',
            'members.student.mahasiswaProfile.faculty',
            'members.student.mahasiswaProfile.studyProgram'
        ]);

        if ($this->request->filled('kkn_period_id')) {
            $query->where('kkn_period_id', $this->request->kkn_period_id);
        }

        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }

        if ($this->request->filled('location_id')) {
            $query->where('kkn_location_id', $this->request->location_id);
        }

        $postos = $query->get();

        $sheets = [];
        foreach ($postos as $posto) {
            /** @var KknPosto $posto */
            $sheets[] = new KknPostoSheet($posto);
        }

        if (empty($sheets)) {
            $sheets[] = new EmptyPostoSheet();
        }

        return $sheets;
    }
}
