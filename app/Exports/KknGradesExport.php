<?php

namespace App\Exports;

use App\Models\KknRegistration;
use App\Models\KknPostoMember;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class KknGradesExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected Request $request;
    protected int $rowIndex = 1;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function query()
    {
        $query = KknRegistration::with([
            'student.mahasiswaProfile.faculty',
            'student.mahasiswaProfile.studyProgram',
            'kknGrade',
            'kknLocation',
            'kknPosto.dpl',
        ])->where('status', 'approved');

        $user = auth('api')->user();
        if ($user) {
            $isAdminOrLppm = $user->hasRole('admin') || $user->can('kkn_grades.edit');
            if (!$isAdminOrLppm) {
                $postoIds = \App\Models\KknPosto::where('dpl_id', $user->id)->pluck('id');
                $query->whereIn('kkn_posto_id', $postoIds);
            }
        }

        if ($this->request->filled('kkn_period_id')) {
            $query->where('kkn_period_id', $this->request->kkn_period_id);
        }
        if ($this->request->filled('kkn_location_id')) {
            $query->where('kkn_location_id', $this->request->kkn_location_id);
        }
        if ($this->request->filled('kkn_posto_id')) {
            $query->where('kkn_posto_id', $this->request->kkn_posto_id);
        }
        if ($this->request->filled('faculty_id')) {
            $query->whereHas('student.mahasiswaProfile', fn($q) =>
                $q->where('fakultas', $this->request->faculty_id)
            );
        }
        if ($this->request->filled('prodi_id')) {
            $query->whereHas('student.mahasiswaProfile', fn($q) =>
                $q->where('prodi', $this->request->prodi_id)
            );
        }

        return $query->orderBy('id');
    }

    public function title(): string
    {
        return 'Rekap Nilai KKN';
    }

    public function headings(): array
    {
        return [
            'No',
            'NPM',
            'Nama Mahasiswa',
            'Prodi',
            'Fakultas',
            'Lokasi KKN',
            'Posko',
            'DPL',
            // Nilai Primer
            'M1 (Mgg 1)',
            'M2 (Mgg 2)',
            'M3 (Mgg 3)',
            'M4 (Mgg 4)',
            // Sekunder
            'Nilai Sekunder',
            // Kalkulasi
            'Total Bobot',
            'Nilai Artikel',
            'Nilai Akhir',
            'Nilai Huruf',
            'No. Sertifikat',
        ];
    }

    public function map($row): array
    {
        $profile = $row->student?->mahasiswaProfile;
        $grade   = $row->kknGrade;

        return [
            $this->rowIndex++,
            $profile?->npm ?? '-',
            $row->student?->name ?? '-',
            $profile?->studyProgram?->name ?? $profile?->prodi ?? '-',
            $profile?->faculty?->name ?? $profile?->fakultas ?? '-',
            $row->kknLocation?->name ?? ($row->location?->name ?? '-'),
            $row->kknPosto?->name ?? '-',
            $row->kknPosto?->dpl?->name ?? '-',
            // Nilai Primer
            $grade?->w1_score ?? '-',
            $grade?->w2_score ?? '-',
            $grade?->w3_score ?? '-',
            $grade?->w4_score ?? '-',
            // Sekunder
            $grade?->secondary_score ?? '-',
            // Kalkulasi
            $grade?->total_weight ?? '-',
            $grade?->article_score ?? '-',
            $grade?->final_score ?? ($grade?->numeric_score ?? '-'),
            $grade?->grade ?? '-',
            $grade?->certificate_number ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = $sheet->getHighestColumn(); // e.g. "R"

        // ── Header row ──────────────────────────────────────────────────────
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size'  => 10,
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '15803d'], // green-700
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(32);

        // ── Sub-group header colors ──────────────────────────────────────────
        // Nilai Primer columns (I-L = cols 9-12)
        $sheet->getStyle('I1:L1')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1d4ed8']], // blue-700
        ]);
        // Sekunder col (M = 13)
        $sheet->getStyle('M1')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']], // emerald-700
        ]);
        // Total Bobot + Artikel + Nilai Akhir + Huruf (N-Q = 14-17)
        $sheet->getStyle('N1:Q1')->applyFromArray([
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '6d28d9']], // violet-700
        ]);

        // ── Data rows ────────────────────────────────────────────────────────
        $sheet->getStyle("A2:{$lastCol}{$lastRow}")->applyFromArray([
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E5E7EB']],
            ],
        ]);

        // Center numeric/score columns
        $sheet->getStyle("A2:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("I2:Q{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Bold: Total Bobot, Nilai Akhir, Nilai Huruf
        $sheet->getStyle("N2:Q{$lastRow}")->applyFromArray([
            'font' => ['bold' => true],
        ]);

        // Alternate row shading
        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle("A{$i}:{$lastCol}{$i}")->applyFromArray([
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F0FDF4'], // green-50
                    ],
                ]);
            }
        }

        return [];
    }
}
