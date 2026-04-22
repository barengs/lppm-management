<?php

namespace App\Exports;

use App\Models\KknRegistration;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Illuminate\Http\Request;

class KknJacketSizeExport implements WithMultipleSheets
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function sheets(): array
    {
        return [
            new JacketSizeSheet($this->request),
        ];
    }
}

class JacketSizeSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function title(): string
    {
        return 'Rekap Ukuran Jaket';
    }

    public function collection()
    {
        $query = KknRegistration::with(['student.mahasiswaProfile'])
            ->where('status', 'approved');

        if ($this->request->status && $this->request->status !== 'all') {
            $query->where('status', $this->request->status);
        }

        $registrations = $query->get();

        $sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        $counts = [];

        foreach ($registrations as $reg) {
            $size = strtoupper(trim($reg->student?->mahasiswaProfile?->jacket_size ?? 'Tidak Diketahui'));
            $counts[$size] = ($counts[$size] ?? 0) + 1;
        }

        // Sort by predefined order, then remaining alphabetically
        $sorted = [];
        foreach ($sizeOrder as $size) {
            if (isset($counts[$size])) {
                $sorted[$size] = $counts[$size];
                unset($counts[$size]);
            }
        }
        // Append any remaining sizes
        foreach ($counts as $size => $count) {
            $sorted[$size] = $count;
        }

        $total = array_sum($sorted);
        $rows = collect();
        $no = 1;
        foreach ($sorted as $size => $count) {
            $rows->push([
                $no++,
                $size,
                $count,
                $total > 0 ? round(($count / $total) * 100, 2) . '%' : '0%',
            ]);
        }
        // Add total row
        $rows->push(['', 'TOTAL', $total, '100%']);

        return $rows;
    }

    public function headings(): array
    {
        return ['No', 'Ukuran Jaket', 'Jumlah Peserta', 'Persentase'];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        // Header row
        $sheet->getStyle('A1:D1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '166534']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // Data rows - center alignment
        $sheet->getStyle('A2:D' . $lastRow)->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Total row (last row) - bold + highlighted
        $sheet->getStyle('A' . $lastRow . ':D' . $lastRow)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DCFCE7']],
            'borders' => ['top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '166534']]],
        ]);

        // Alternate row shading
        for ($i = 2; $i < $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle('A' . $i . ':D' . $i)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDF4']],
                ]);
            }
        }

        // All borders
        $sheet->getStyle('A1:D' . $lastRow)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1FAE5']]],
        ]);

        return [];
    }
}
