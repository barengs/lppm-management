<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Sertifikat KKN - {{ $name }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 8mm;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .outer-frame {
            border: 4px solid #14532d;
            padding: 4px;
        }
        .inner-frame {
            border: 1.5px solid #c9a227;
            padding: 14px 26px 16px 26px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            border-bottom: 2px solid #14532d;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header-logo-cell {
            width: 78px;
            vertical-align: middle;
            text-align: left;
        }
        .header-logo {
            width: 66px;
            height: 66px;
            object-fit: contain;
        }
        .header-text-cell {
            vertical-align: middle;
            text-align: center;
            padding-right: 78px;
        }
        .univ-name {
            font-size: 15pt;
            font-weight: bold;
            color: #14532d;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0 0 2px 0;
        }
        .lppm-name {
            font-size: 11pt;
            font-weight: bold;
            color: #1f2937;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 3px 0;
        }
        .lppm-address {
            font-size: 8pt;
            color: #6b7280;
            margin: 0;
        }
        .title-block {
            text-align: center;
            margin: 10px 0 8px 0;
        }
        .cert-title {
            font-size: 24pt;
            font-weight: bold;
            color: #14532d;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin: 0;
        }
        .cert-subtitle {
            font-size: 10pt;
            font-weight: bold;
            color: #b45309;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 3px 0 6px 0;
        }
        .cert-number {
            display: inline-block;
            font-size: 8.5pt;
            color: #374151;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 3px 12px;
            border-radius: 3px;
        }
        .body-block {
            text-align: center;
            margin-top: 10px;
        }
        .intro-text {
            font-size: 10pt;
            color: #4b5563;
            margin: 0 0 4px 0;
        }
        .recipient-name {
            font-size: 21pt;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 2px auto 4px auto;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #c9a227;
            display: inline-block;
            min-width: 52%;
        }
        .recipient-meta {
            font-size: 9.5pt;
            color: #374151;
            margin: 2px 0 10px 0;
        }
        .completion-text {
            font-size: 10pt;
            color: #1f2937;
            line-height: 1.55;
            width: 86%;
            margin: 0 auto 12px auto;
        }
        .grade-box {
            margin: 0 auto 10px auto;
            width: auto;
            border: 1.5px solid #14532d;
            background-color: #f0fdf4;
        }
        .grade-box td {
            padding: 6px 18px;
            text-align: center;
            vertical-align: middle;
        }
        .grade-label {
            font-size: 8pt;
            text-transform: uppercase;
            color: #4b5563;
            letter-spacing: 0.8px;
            display: block;
        }
        .grade-value {
            font-size: 14pt;
            font-weight: bold;
            color: #14532d;
        }
        .footer-table {
            margin-top: 22px;
            width: 100%;
        }
        .footer-left {
            width: 58%;
            vertical-align: bottom;
            text-align: left;
            font-size: 8pt;
            color: #6b7280;
        }
        .footer-right {
            width: 42%;
            vertical-align: bottom;
            text-align: center;
            font-size: 9.5pt;
            color: #1f2937;
        }
        .signature-space {
            height: 44px;
        }
        .signer-name {
            font-weight: bold;
            text-decoration: underline;
            color: #111827;
        }
        .signer-nidn {
            font-size: 8.5pt;
            color: #4b5563;
        }
    </style>
</head>
<body>
    <div class="outer-frame">
        <div class="inner-frame">
            {{-- Kop / Header Lembaga --}}
            <table class="header-table">
                <tr>
                    <td class="header-logo-cell">
                        @if(!empty($logo_data_uri))
                            <img src="{{ $logo_data_uri }}" alt="Logo Universitas" class="header-logo">
                        @endif
                    </td>
                    <td class="header-text-cell">
                        <p class="univ-name">{{ $university_name }}</p>
                        <p class="lppm-name">Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)</p>
                        <p class="lppm-address">{{ $lppm_address }}</p>
                    </td>
                </tr>
            </table>

            {{-- Judul Sertifikat --}}
            <div class="title-block">
                <p class="cert-title">Sertifikat</p>
                <p class="cert-subtitle">Kuliah Kerja Nyata (KKN) {{ $period_name ? '— ' . $period_name : 'Tahun ' . $year }}</p>
                <span class="cert-number">Nomor: {{ $certificate_number }}</span>
            </div>

            {{-- Isi Sertifikat --}}
            <div class="body-block">
                <p class="intro-text">Diberikan kepada:</p>
                <div class="recipient-name">{{ $name }}</div>
                <p class="recipient-meta">
                    <strong>NPM:</strong> {{ $npm }}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Program Studi:</strong> {{ $prodi }}
                    @if(!empty($faculty) && $faculty !== '-')
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <strong>Fakultas:</strong> {{ $faculty }}
                    @endif
                </p>

                @php
                    $lokasiParts = [];
                    if (!empty($village)) $lokasiParts[] = 'Desa ' . $village;
                    if (!empty($district)) $lokasiParts[] = 'Kec. ' . $district;
                    if (!empty($city)) $lokasiParts[] = $city;
                    $lokasiText = count($lokasiParts) > 0
                        ? implode(', ', $lokasiParts)
                        : ($location !== '-' ? $location : '-');
                @endphp

                <p class="completion-text">
                    Telah melaksanakan dan menyelesaikan seluruh rangkaian kegiatan <strong>Kuliah Kerja Nyata (KKN) Tahun {{ $year }}</strong>
                    @if(!empty($posto_name))
                        pada <strong>{{ $posto_name }}</strong>
                    @endif
                    di <strong>{{ $lokasiText }}</strong> dengan hasil:
                </p>

                <table class="grade-box">
                    <tr>
                        <td style="border-right: 1px solid #bbf7d0;">
                            <span class="grade-label">Nilai Akhir</span>
                            <span class="grade-value">{{ $score }}</span>
                        </td>
                        <td>
                            <span class="grade-label">Predikat</span>
                            <span class="grade-value">{{ $grade }}</span>
                        </td>
                    </tr>
                </table>
            </div>

            {{-- Tanda Tangan (1 Halaman Tetap) --}}
            <table class="footer-table">
                <tr>
                    <td class="footer-left">
                        Sertifikat ini diterbitkan secara resmi melalui Sistem Informasi Tata Kelola LPPM<br>
                        {{ $university_name }}.
                    </td>
                    <td class="footer-right">
                        Pamekasan, {{ $date }}<br>
                        {{ $ketua_title }},
                        <div class="signature-space"></div>
                        <span class="signer-name">{{ $ketua_name }}</span><br>
                        @if(!empty($ketua_nidn))
                            <span class="signer-nidn">NIDN. {{ $ketua_nidn }}</span>
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
