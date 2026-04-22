<?php

namespace App\Exports;

use App\Models\KknRegistration;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Illuminate\Http\Request;

class KknParticipantsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
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
            'location',
            'fiscalYear',
            'dpl',
        ])->orderBy('created_at', 'desc');

        if ($this->request->status && $this->request->status !== 'all') {
            $query->where('status', $this->request->status);
        }

        if ($this->request->prodi_id) {
            $query->whereHas('student.mahasiswaProfile', fn($q) =>
                $q->where('prodi', $this->request->prodi_id)
            );
        }

        if ($this->request->search) {
            $query->whereHas('student', fn($q) =>
                $q->where('name', 'like', '%' . $this->request->search . '%')
                  ->orWhere('email', 'like', '%' . $this->request->search . '%')
            );
        }

        return $query;
    }

    public function title(): string
    {
        return 'Peserta KKN';
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Mahasiswa',
            'Email',
            'NPM',
            'Fakultas',
            'Program Studi',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Alamat',
            'No. HP',
            'IPK',
            'Ukuran Jaket',
            'Jenis Pendaftaran',
            'Lokasi KKN',
            'DPL',
            'Tahun Akademik',
            'Status',
            'Catatan Validasi',
            'Tanggal Daftar',
        ];
    }

    public function map($row): array
    {
        $profile = $row->student?->mahasiswaProfile;

        $statusMap = [
            'pending'        => 'Menunggu Review',
            'approved'       => 'Disetujui',
            'rejected'       => 'Ditolak',
            'needs_revision' => 'Perlu Revisi',
            'draft'          => 'Draft',
        ];

        $registrationTypeMap = [
            'reguler'         => 'Reguler',
            'program_khusus'  => 'Program Khusus',
            'santri'          => 'Santri',
        ];

        $genderMap = [
            'L' => 'Laki-laki',
            'P' => 'Perempuan',
        ];

        $fakultas = $profile?->faculty?->name ?? $profile?->fakultas ?? '-';
        $prodi    = $profile?->studyProgram?->name ?? $profile?->prodi ?? '-';

        return [
            $this->rowIndex++,
            $row->student?->name ?? '-',
            $row->student?->email ?? '-',
            $profile?->npm ?? '-',
            $fakultas,
            $prodi,
            $genderMap[$profile?->gender] ?? $profile?->gender ?? '-',
            $profile?->place_of_birth ?? '-',
            $profile?->date_of_birth ?? '-',
            $profile?->address ?? '-',
            $profile?->phone ?? '-',
            $profile?->ips ?? '-',
            $profile?->jacket_size ?? '-',
            $registrationTypeMap[$row->registration_type] ?? $row->registration_type ?? '-',
            $row->location?->name ?? '-',
            $row->dpl?->name ?? '-',
            $row->fiscalYear?->year ?? '-',
            $statusMap[$row->status] ?? $row->status,
            $row->validation_notes ?? '-',
            $row->created_at?->format('d/m/Y H:i') ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = $sheet->getHighestColumn();

        // Header row style
        $sheet->getStyle('A1:' . $lastCol . '1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '166534'], // green-800
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
        ]);

        // All data rows
        $sheet->getStyle('A2:' . $lastCol . $lastRow)->applyFromArray([
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Alternate row shading for readability
        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle('A' . $i . ':' . $lastCol . $i)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F0FDF4'], // green-50
                    ],
                ]);
            }
        }

        // Fix row height for header
        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
