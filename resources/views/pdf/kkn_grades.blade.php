<!DOCTYPE html>
<html>
<head>
    <title>Rekap Nilai KKN</title>
    <style>
        body { font-family: sans-serif; font-size: 10pt; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 14pt; }
        .header h2 { margin: 5px 0; font-size: 12pt; font-weight: normal; }
        .filters { margin-bottom: 15px; font-size: 9pt; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #f0f0f0; }
        .center { text-align: center; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 8pt; text-align: right; color: #777; }
    </style>
</head>
<body>
    <div class="header">
        <h1>REKAPITULASI NILAI KKN</h1>
        <h2>LPPM Universitas Islam Madura</h2>
    </div>

    <div class="filters">
        <strong>Filter:</strong><br>
        Lokasi: {{ $filters['location'] }} | Posko: {{ $filters['posto'] }}<br>
        Fakultas: {{ $filters['faculty'] }} | Prodi: {{ $filters['prodi'] }}
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%" class="center">No</th>
                <th width="10%">NPM</th>
                <th width="20%">Nama Mahasiswa</th>
                <th width="15%">Fakultas</th>
                <th width="15%">Prodi</th>
                <th width="15%">Lokasi KKN</th>
                <th width="10%" class="center">Nilai Angka</th>
                <th width="10%" class="center">Nilai Huruf</th>
            </tr>
        </thead>
        <tbody>
            @forelse($registrations as $index => $reg)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $reg->student->mahasiswaProfile->npm ?? '-' }}</td>
                <td>
                    {{ $reg->student->name }}
                    @if($reg->kknPostoMember)
                        <br><small>({{ $reg->kknPostoMember->position_name }})</small>
                    @endif
                </td>
                <td>{{ $reg->student->mahasiswaProfile->faculty->name ?? '-' }}</td>
                <td>{{ $reg->student->mahasiswaProfile->studyProgram->name ?? '-' }}</td>
                <td>{{ $reg->kknLocation->name ?? '-' }}</td>
                <td class="center">{{ $reg->kknGrade->numeric_score ?? '-' }}</td>
                <td class="center"><strong>{{ $reg->kknGrade->grade ?? '-' }}</strong></td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="center">Tidak ada data.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ now()->format('d-m-Y H:i') }}
    </div>
</body>
</html>
