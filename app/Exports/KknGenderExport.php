<?php

namespace App\Exports;

use App\Models\KknRegistration;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Illuminate\Http\Request;

class KknGenderExport implements WithMultipleSheets
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function sheets(): array
    {
        return [
            new GenderOverallSheet($this->request),
            new GenderByProdiSheet($this->request),
        ];
    }
}

// ─────────────────────────────────────────────
// Sheet 1: Overall gender totals
// ─────────────────────────────────────────────
class GenderOverallSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function title(): string
    {
        return 'Rekap Jenis Kelamin';
    }

    public function collection()
    {
        $registrations = KknRegistration::with(['student.mahasiswaProfile'])->get();

        $laki = 0;
        $perempuan = 0;

        foreach ($registrations as $reg) {
            $gender = strtoupper(trim($reg->student?->mahasiswaProfile?->gender ?? ''));
            if ($gender === 'L') $laki++;
            elseif ($gender === 'P') $perempuan++;
        }

        $total = $laki + $perempuan;

        return collect([
            ['Laki-laki', $laki, $total > 0 ? round(($laki / $total) * 100, 2) . '%' : '0%'],
            ['Perempuan', $perempuan, $total > 0 ? round(($perempuan / $total) * 100, 2) . '%' : '0%'],
            ['TOTAL', $total, '100%'],
        ]);
    }

    public function headings(): array
    {
        return ['Jenis Kelamin', 'Jumlah Peserta', 'Persentase'];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:C1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '166534']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->getStyle('A2:C' . $lastRow)->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Total row
        $sheet->getStyle('A' . $lastRow . ':C' . $lastRow)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DCFCE7']],
            'borders' => ['top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '166534']]],
        ]);

        $sheet->getStyle('A1:C' . $lastRow)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1FAE5']]],
        ]);

        return [];
    }
}

// ─────────────────────────────────────────────
// Sheet 2: Gender per Program Studi
// ─────────────────────────────────────────────
class GenderByProdiSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function title(): string
    {
        return 'Per Program Studi';
    }

    public function collection()
    {
        $registrations = KknRegistration::with([
            'student.mahasiswaProfile.studyProgram',
        ])->get();

        $byProdi = [];

        foreach ($registrations as $reg) {
            $profile = $reg->student?->mahasiswaProfile;
            $prodi = $profile?->studyProgram?->name ?? $profile?->prodi ?? 'Tidak Diketahui';
            $gender = strtoupper(trim($profile?->gender ?? ''));

            if (!isset($byProdi[$prodi])) {
                $byProdi[$prodi] = ['L' => 0, 'P' => 0];
            }

            if ($gender === 'L') $byProdi[$prodi]['L']++;
            elseif ($gender === 'P') $byProdi[$prodi]['P']++;
        }

        ksort($byProdi);

        $rows = collect();
        $no = 1;
        $totalL = 0;
        $totalP = 0;

        foreach ($byProdi as $prodi => $counts) {
            $laki     = $counts['L'];
            $perempuan = $counts['P'];
            $total    = $laki + $perempuan;
            $totalL  += $laki;
            $totalP  += $perempuan;

            $rows->push([$no++, $prodi, $laki, $perempuan, $total]);
        }

        // Grand total row
        $rows->push(['', 'TOTAL KESELURUHAN', $totalL, $totalP, $totalL + $totalP]);

        return $rows;
    }

    public function headings(): array
    {
        return ['No', 'Program Studi', 'Laki-laki', 'Perempuan', 'Total'];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1d4ed8']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->getStyle('A2:E' . $lastRow)->applyFromArray([
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('C2:E' . $lastRow)->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Total row
        $sheet->getStyle('A' . $lastRow . ':E' . $lastRow)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DBEAFE']],
            'borders' => ['top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '1d4ed8']]],
        ]);

        // Alternate shading
        for ($i = 2; $i < $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle('A' . $i . ':E' . $i)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
                ]);
            }
        }

        $sheet->getStyle('A1:E' . $lastRow)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'BFDBFE']]],
        ]);

        return [];
    }
}
