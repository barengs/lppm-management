<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Lembar Pengesahan Usulan</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.5; font-size: 11pt; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 10pt; }
        .title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px; text-decoration: underline; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.data td { vertical-align: top; padding: 5px 0; }
        table.data td.label { width: 200px; }
        table.data td.separator { width: 15px; text-align: center; }

        .section-title { font-weight: bold; background: #f2f2f2; padding: 5px; margin-bottom: 10px; border-left: 5px solid #000; }
        
        table.grid { border: 1px solid #000; }
        table.grid th, table.grid td { border: 1px solid #000; padding: 8px; font-size: 10pt; }
        table.grid th { background: #f2f2f2; }

        .signature-table { margin-top: 40px; }
        .signature-table td { width: 33%; text-align: center; vertical-align: top; padding-bottom: 80px; }
        .signature-name { font-weight: bold; text-decoration: underline; margin-top: 60px; display: block; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Lembaga Penelitian dan Pengabdian Masyarakat</h1>
        <p>Universitas Islam Madura (BIMA Mirror Edition)</p>
        <p>Jl. Raya Pamekasan - Sumenep, Pamekasan, Jawa Timur</p>
    </div>

    <div class="title">HALAMAN PENGESAHAN USULAN</div>

    <div class="section-title">A. IDENTITAS USULAN</div>
    <table class="data">
        <tr>
            <td class="label">Judul Usulan</td>
            <td class="separator">:</td>
            <td><strong>{{ $proposal->title }}</strong></td>
        </tr>
        <tr>
            <td class="label">Skema Penulisan</td>
            <td class="separator">:</td>
            <td>{{ $proposal->scheme->name }} ({{ $proposal->scheme->type }})</td>
        </tr>
        <tr>
            <td class="label">Tahun Akademik</td>
            <td class="separator">:</td>
            <td>{{ $proposal->fiscalYear->year }}</td>
        </tr>
        <tr>
            <td class="label">TKT (Awal / Target)</td>
            <td class="separator">:</td>
            <td>Level {{ $proposal->tkt_level }} / Level {{ $proposal->identity->tkt_target ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Bidang Fokus</td>
            <td class="separator">:</td>
            <td>{{ $proposal->identity->focus_area ?? '-' }}</td>
        </tr>
    </table>

    <div class="section-title">B. TIM PENGUSUL</div>
    <table class="grid">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama / NIDN</th>
                <th>Jabatan / Peran</th>
                <th>Fakultas / Prodi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($proposal->personnel as $idx => $person)
            <tr>
                <td style="text-align: center;">{{ $idx + 1 }}</td>
                <td>{{ $person->user->name }}<br><small>NIDN: {{ $person->user->dosenProfile->nidn ?? '-' }}</small></td>
                <td>{{ ucfirst($person->role) }}</td>
                <td>{{ $person->user->dosenProfile->faculty ?? '-' }} / {{ $person->user->dosenProfile->study_program ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">C. RINGKASAN ANGGARAN</div>
    <table class="grid">
        <thead>
            <tr>
                <th>Tahun Ke</th>
                <th>Biaya Yang Diusulkan (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $total = 0; @endphp
            @for($i = 1; $i <= ($proposal->identity->duration_years ?? 1); $i++)
                @php 
                    $yearTotal = $proposal->budgetItems->where('execution_year', $i)->sum(function($item) {
                        return $item->quantity * $item->unit_cost;
                    });
                    $total += $yearTotal;
                @endphp
                <tr>
                    <td style="text-align: center;">Tahun {{ $i }}</td>
                    <td style="text-align: right;">{{ number_format($yearTotal, 0, ',', '.') }}</td>
                </tr>
            @endfor
        </tbody>
        <tfoot>
            <tr>
                <td style="text-align: right; font-weight: bold;">TOTAL KESELURUHAN</td>
                <td style="text-align: right; font-weight: bold;">{{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <p style="font-size: 10pt; text-align: justify;">
        Mengetahui dan menyetujui bahwa data yang diisikan adalah benar dan telah melalui proses validasi internal Lembaga Penelitian dan Pengabdian Masyarakat (LPPM).
    </p>

    <table class="signature-table">
        <tr>
            <td>
                Mengetahui,<br>
                Dekan Fakultas<br>
                <span class="signature-name">( ........................................ )</span>
                NIP/NIDN.
            </td>
            <td>
                LPPM,<br>
                Kepala LPPM<br>
                <span class="signature-name">( ........................................ )</span>
                NIP/NIDN.
            </td>
            <td>
                Pamekasan, {{ date('d-m-Y') }}<br>
                Ketua Pengusul,<br>
                <span class="signature-name">{{ $proposal->user->name }}</span>
                NIDN. {{ $proposal->user->dosenProfile->nidn ?? '-' }}
            </td>
        </tr>
    </table>
</body>
</html>
