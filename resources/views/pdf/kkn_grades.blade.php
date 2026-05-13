<!DOCTYPE html>
<html>
<head>
    <title>Rekap Nilai KKN</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9pt; color: #222; margin: 0; }
        .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1a6b3c; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { margin: 4px 0 0; font-size: 10pt; font-weight: normal; color: #555; }
        .header .subtitle { font-size: 8pt; color: #777; margin-top: 2px; }
        .filters { margin-bottom: 12px; font-size: 8pt; color: #444; background: #f9f9f9;
                   border: 1px solid #ddd; padding: 6px 10px; border-radius: 3px; }
        .filters span { margin-right: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        thead tr { background-color: #1a6b3c; color: #fff; }
        th { padding: 5px 4px; text-align: center; font-size: 8pt; font-weight: bold;
             border: 1px solid #1a6b3c; }
        td { border: 1px solid #ccc; padding: 4px; font-size: 8pt; vertical-align: middle; }
        tbody tr:nth-child(even) { background-color: #f7f7f7; }
        .center { text-align: center; }
        .right  { text-align: right; }
        .grade-badge { font-weight: bold; font-size: 9pt; }
        .grade-A  { color: #1a6b3c; }
        .grade-B  { color: #1d4ed8; }
        .grade-C  { color: #b45309; }
        .grade-D  { color: #c2410c; }
        .grade-E  { color: #dc2626; }
        tfoot td { background: #e8f5ee; font-weight: bold; border: 1px solid #1a6b3c; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 7pt;
                  text-align: right; color: #999; border-top: 1px solid #eee; padding-top: 4px; }
        .section-label { font-size: 7pt; color: #aaa; display: block; margin-bottom: 1px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rekapitulasi Nilai KKN</h1>
        <h2>Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)</h2>
        <p class="subtitle">Tahun Akademik {{ date('Y') }}</p>
    </div>

    <div class="filters">
        <span><strong>Lokasi:</strong> {{ $filters['location'] }}</span>
        <span><strong>Posko:</strong> {{ $filters['posto'] }}</span>
        <span><strong>Fakultas:</strong> {{ $filters['faculty'] }}</span>
        <span><strong>Prodi:</strong> {{ $filters['prodi'] }}</span>
    </div>

    <table>
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="10%">NPM</th>
                <th width="18%">Nama Mahasiswa</th>
                <th width="13%">Prodi / Fakultas</th>
                <th width="12%">Lokasi KKN</th>
                {{-- Nilai Primer --}}
                <th width="5%">M1</th>
                <th width="5%">M2</th>
                <th width="5%">M3</th>
                <th width="5%">M4</th>
                <th width="6%">Sekunder</th>
                <th width="7%">Total Bobot</th>
                <th width="6%">Artikel</th>
                <th width="7%">Nilai Akhir</th>
                <th width="7%">Huruf</th>
            </tr>
        </thead>
        <tbody>
            @forelse($registrations as $index => $reg)
            @php
                $grade  = $reg->kknGrade;
                $letter = $grade?->grade ?? '-';
                $gradeClass = match(true) {
                    str_starts_with($letter, 'A') => 'grade-A',
                    str_starts_with($letter, 'B') => 'grade-B',
                    str_starts_with($letter, 'C') => 'grade-C',
                    $letter === 'D'               => 'grade-D',
                    $letter === 'E'               => 'grade-E',
                    default => '',
                };
            @endphp
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td class="center">{{ $reg->student->mahasiswaProfile->npm ?? '-' }}</td>
                <td>{{ $reg->student->name ?? '-' }}</td>
                <td>
                    {{ $reg->student->mahasiswaProfile->studyProgram->name ?? '-' }}<br>
                    <span style="font-size:7pt; color:#777">{{ $reg->student->mahasiswaProfile->faculty->name ?? '-' }}</span>
                </td>
                <td>{{ $reg->kknLocation->name ?? ($reg->location->name ?? '-') }}</td>
                {{-- Nilai Primer --}}
                <td class="center">{{ $grade?->w1_score ?? '-' }}</td>
                <td class="center">{{ $grade?->w2_score ?? '-' }}</td>
                <td class="center">{{ $grade?->w3_score ?? '-' }}</td>
                <td class="center">{{ $grade?->w4_score ?? '-' }}</td>
                <td class="center">{{ $grade?->secondary_score ?? '-' }}</td>
                <td class="center"><strong>{{ $grade?->total_weight ?? '-' }}</strong></td>
                <td class="center">{{ $grade?->article_score ?? '-' }}</td>
                <td class="center"><strong>{{ $grade?->final_score ?? ($grade?->numeric_score ?? '-') }}</strong></td>
                <td class="center">
                    <span class="grade-badge {{ $gradeClass }}">{{ $letter }}</span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="14" class="center" style="padding:20px; color:#999; font-style:italic;">
                    Tidak ada data nilai yang tersedia.
                </td>
            </tr>
            @endforelse
        </tbody>
        @if($registrations->count() > 0)
        <tfoot>
            <tr>
                <td colspan="12" class="right" style="padding: 5px 8px;">
                    Jumlah Mahasiswa:
                </td>
                <td class="center" colspan="2">{{ $registrations->count() }} orang</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div style="margin-top: 40px; text-align: right; font-size: 8pt;">
        <p style="margin:0;">............................................., {{ now()->translatedFormat('d F Y') }}</p>
        <p style="margin: 4px 0 0;">Ketua LPPM</p>
        <br><br><br>
        <p style="margin:0; border-top: 1px solid #000; display: inline-block; padding-top: 4px; min-width: 160px;">
            (____________________________)
        </p>
    </div>

    <div class="footer">
        Dicetak pada: {{ now()->format('d-m-Y H:i') }} | Sistem Informasi LPPM
    </div>
</body>
</html>
