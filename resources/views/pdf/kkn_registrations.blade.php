<!DOCTYPE html>
<html>
<head>
    <title>Rekap Pendaftar KKN</title>
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
        .status-pending { color: #f59e0b; }
        .status-approved { color: #10b981; }
        .status-rejected { color: #ef4444; }
        .status-needs_revision { color: #f97316; }
    </style>
</head>
<body>
    <div class="header">
        <h1>REKAPITULASI PENDAFTAR KKN</h1>
        <h2>LPPM Universitas Islam Madura</h2>
    </div>

    <div class="filters">
        <strong>Filter:</strong><br>
        Prodi: {{ $filters['prodi'] }} | Status: {{ ucfirst($filters['status']) }}
        @if($filters['search'])
            | Pencarian: "{{ $filters['search'] }}"
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%" class="center">No</th>
                <th width="12%">NPM</th>
                <th width="20%">Nama Mahasiswa</th>
                <th width="18%">Program Studi</th>
                <th width="15%">Kontak</th>
                <th width="15%">Lokasi KKN</th>
                <th width="15%" class="center">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($registrations as $index => $reg)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $reg->student->mahasiswaProfile->npm ?? '-' }}</td>
                <td>{{ $reg->student->name }}</td>
                <td>{{ $reg->student->mahasiswaProfile->studyProgram->name ?? '-' }}</td>
                <td>{{ $reg->student->mahasiswaProfile->phone ?? '-' }}</td>
                <td>{{ $reg->location->name ?? 'Belum Ditentukan' }}</td>
                <td class="center">
                    <span class="status-{{ $reg->status }}">
                        {{ [
                            'pending' => 'Menunggu Review',
                            'approved' => 'Disetujui',
                            'rejected' => 'Ditolak',
                            'needs_revision' => 'Perlu Revisi'
                        ][$reg->status] ?? $reg->status }}
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="center">Tidak ada data pendaftaran.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ now()->translatedFormat('d F Y H:i') }}
    </div>
</body>
</html>
