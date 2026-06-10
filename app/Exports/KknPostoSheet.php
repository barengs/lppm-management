<?php

namespace App\Exports;

use App\Models\KknPosto;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class KknPostoSheet implements FromCollection, WithTitle, WithStyles, ShouldAutoSize
{
    /** @var KknPosto */
    protected $posto;

    /**
     * @param KknPosto $posto
     */
    public function __construct($posto)
    {
        $this->posto = $posto;
    }

    public function title(): string
    {
        $title = $this->posto->name;
        // Excel worksheet title cannot exceed 31 characters
        // and cannot contain characters like: \ / ? * : [ ]
        $title = str_replace(['\\', '/', '?', '*', ':', '[', ']'], '', $title);
        return substr($title, 0, 31);
    }

    public function collection()
    {
        $dplName = $this->posto->dpl?->name ?? '-';
        $locationName = $this->posto->location?->name ?? '-';

        $data = collect([
            ['INFORMASI POSKO', ''],
            ['Nama Posko', $this->posto->name],
            ['Lokasi KKN', $locationName],
            ['Dosen Pembimbing Lapangan (DPL)', $dplName],
            ['Tahun Ajaran', $this->posto->fiscalYear?->name ?? '-'],
            ['Periode KKN', $this->posto->kknPeriod?->name ?? '-'],
            ['Status', ucfirst($this->posto->status)],
            ['Deskripsi', $this->posto->description ?? '-'],
            ['', ''], // Empty separator row
            ['DAFTAR ANGGOTA POSKO', ''],
            ['No', 'NPM', 'Nama Mahasiswa', 'Program Studi', 'Fakultas', 'Jabatan', 'Dosen Pembimbing Lapangan', 'Lokasi Posko', 'Status', 'Tanggal Bergabung', 'Catatan'],
        ]);

        $no = 1;
        $members = $this->posto->members;

        foreach ($members as $member) {
            $profile = $member->student?->mahasiswaProfile;
            $data->push([
                $no++,
                $profile?->npm ?? '-',
                $member->student?->name ?? '-',
                $profile?->studyProgram?->name ?? $profile?->prodi ?? '-',
                $profile?->faculty?->name ?? $profile?->fakultas ?? '-',
                $member->position_name ?? $member->position,
                $dplName,
                $locationName,
                ucfirst($member->status),
                $member->joined_at ? $member->joined_at->format('Y-m-d') : '-',
                $member->notes ?? '-'
            ]);
        }

        return $data;
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        // Style the "INFORMASI POSKO" row
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '1E3A8A']],
        ]);
        $sheet->mergeCells('A1:B1');

        // Style labels for info (Rows 2 to 8)
        $sheet->getStyle('A2:A8')->applyFromArray([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        // Style the "DAFTAR ANGGOTA POSKO" row
        $sheet->getStyle('A10:K10')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '1E3A8A']],
        ]);
        $sheet->mergeCells('A10:K10');

        // Table Header styling (Row 11) - Columns A to K
        $sheet->getStyle('A11:K11')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E40AF']], // Dark Blue
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(11)->setRowHeight(28);

        // Data Rows styling (Row 12 to $lastRow)
        if ($lastRow >= 12) {
            $sheet->getStyle('A12:K' . $lastRow)->applyFromArray([
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']],
                ],
            ]);

            // Alignments
            $sheet->getStyle('A12:A' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // No
            $sheet->getStyle('B12:B' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // NPM
            $sheet->getStyle('I12:J' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // Status & Joined At

            // Alternate Row Shading
            for ($i = 12; $i <= $lastRow; $i++) {
                if ($i % 2 === 0) {
                    $sheet->getStyle('A' . $i . ':K' . $i)->applyFromArray([
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
                    ]);
                }
            }
        }

        return [];
    }
}
