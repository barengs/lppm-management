<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Proposal Detail</title>
    <style>
        /* Shared Styles */
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.5; font-size: 11pt; margin: 0; padding: 0; }
        .page-break { page-break-after: always; }
        
        /* Cover Styles */
        .cover-container { width: 100%; height: 100%; text-align: center; padding-top: 50px; }
        .title-top { font-weight: bold; font-size: 18pt; margin-bottom: 50px; text-transform: uppercase; }
        .logo { margin: 50px 0; }
        .logo img { width: 120px; height: auto; }
        .proposal-title { font-weight: bold; font-size: 14pt; margin: 50px auto; width: 80%; text-transform: uppercase; }
        .author-info { margin-top: 80px; margin-bottom: 80px; }
        .footer-info { position: absolute; bottom: 50px; width: 100%; text-align: center; font-weight: bold; text-transform: uppercase; }

        /* Endorsement Styles */
        .endorsement-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .endorsement-header h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
        .endorsement-header p { margin: 2px 0; font-size: 10pt; }
        .section-title { font-weight: bold; background: #f2f2f2; padding: 5px; margin-bottom: 10px; border-left: 5px solid #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.data td { vertical-align: top; padding: 5px 0; }
        table.grid th, table.grid td { border: 1px solid #000; padding: 8px; font-size: 10pt; }
        .signature-table { margin-top: 40px; }
        .signature-table td { width: 33%; text-align: center; vertical-align: top; padding-bottom: 50px; }
        .signature-name { font-weight: bold; text-decoration: underline; margin-top: 40px; display: block; }
    </style>
</head>
<body>
    {{-- COVER PAGE --}}
    <div class="cover-container">
        <div class="title-top">{{ $setting->title_top ?? 'USULAN PROPOSAL' }}</div>
        <div class="logo">
            @if($setting->logo_path)
                <img src="{{ public_path('storage/' . $setting->logo_path) }}" alt="Logo">
            @else
                <div style="height: 120px;"></div>
            @endif
        </div>
        <div class="proposal-title">{{ $proposal->title }}</div>
        <div class="author-info">
            Oleh:<br>
            <strong>{{ $proposal->user->name }}</strong><br>
            NIDN. {{ $proposal->user->dosenProfile->nidn ?? '-' }}
        </div>
        <div class="footer-info">
            {!! $setting->title_bottom_prodi ? $setting->title_bottom_prodi . '<br>' : '' !!}
            {!! $setting->title_bottom_faculty ? $setting->title_bottom_faculty . '<br>' : '' !!}
            {!! $setting->title_bottom_university ? $setting->title_bottom_university . '<br>' : '' !!}
            {{ $year }}
        </div>
    </div>

    <div class="page-break"></div>

    {{-- ENDORSEMENT PAGE (Simplified for common use) --}}
    <div class="endorsement-header">
        <h1>Lembaga Penelitian dan Pengabdian Masyarakat</h1>
        <p>{{ $setting->title_bottom_university ?? 'Universitas Islam Madura' }}</p>
    </div>

    <div style="text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px; text-decoration: underline;">
        HALAMAN PENGESAHAN USULAN
    </div>

    <div class="section-title">A. IDENTITAS USULAN</div>
    <table class="data">
        <tr>
            <td style="width: 200px;">Judul Usulan</td>
            <td style="width: 15px; text-align: center;">:</td>
            <td><strong>{{ $proposal->title }}</strong></td>
        </tr>
        <tr>
            <td>Tahun Akademik</td>
            <td style="text-align: center;">:</td>
            <td>{{ $proposal->fiscalYear->year ?? '-' }}</td>
        </tr>
    </table>

    <div class="section-title">B. TIM PENGUSUL</div>
    <table class="grid">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama / NIDN</th>
                <th>Jabatan / Peran</th>
            </tr>
        </thead>
        <tbody>
            @foreach($proposal->personnel as $idx => $person)
            <tr>
                <td style="text-align: center;">{{ $idx + 1 }}</td>
                <td>
                    @if($person->type === 'mahasiswa')
                        {{ $person->student_name }}<br><small>NIM: {{ $person->student_nim ?? '-' }}</small>
                    @else
                        {{ $person->user->name ?? '-' }}<br><small>NIDN: {{ $person->user->dosenProfile->nidn ?? '-' }}</small>
                    @endif
                </td>
                <td>{{ ucfirst($person->role) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="signature-table">
        <tr>
            <td>
                Mengetahui,<br>Dekan Fakultas<br>
                <span class="signature-name">( ........................................ )</span>
            </td>
            <td>
                LPPM,<br>Kepala LPPM<br>
                <span class="signature-name">( ........................................ )</span>
            </td>
            <td>
                Pamekasan, {{ date('d-m-Y') }}<br>Ketua Pengusul,<br>
                <span class="signature-name">{{ $proposal->user->name }}</span>
            </td>
        </tr>
    </table>
</body>
</html>
