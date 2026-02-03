<!DOCTYPE html>
<html>
<head>
    <title>Sertifikat KKN</title>
    <style>
        body { font-family: sans-serif; text-align: center; border: 10px solid #2E8B57; padding: 50px; }
        .logo { width: 100px; margin-bottom: 20px; }
        h1 { color: #2E8B57; font-size: 36px; margin-bottom: 5px; }
        h3 { color: #555; font-size: 24px; font-weight: normal; margin-top: 5px; }
        .content { margin-top: 50px; font-size: 18px; line-height: 1.6; }
        .name { font-size: 32px; font-weight: bold; margin: 20px 0; color: #333; }
        .grade { font-size: 28px; font-weight: bold; color: #2E8B57; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; padding: 0 50px; }
        .signature { text-align: center; margin-top: 50px; float: right;}
        .signature-line { border-top: 1px solid #333; margin-top: 60px; width: 250px; margin-left: auto; margin-right: auto; }
        .cert-number { position: absolute; top: 20px; right: 20px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="cert-number">No: {{ $certificate_number }}</div>
    
    <!-- Assuming logo exists in public/images/logo.png -->
    <!-- <img src="{{ public_path('images/logo.png') }}" class="logo"> -->
    
    <h1>SERTIFIKAT KULIAH KERJA NYATA</h1>
    <h3>Universitas Islam Madura</h3>
    
    <div class="content">
        <p>Diberikan kepada:</p>
        <div class="name">{{ $name }}</div>
        <p>NPM: {{ $npm }}</p>
        
        <p>Telah menyelesaikan kegiatan Kuliah Kerja Nyata (KKN) Tahun {{ date('Y') }}<br>
        di Desa {{ $village }}, Lokasi {{ $location }}.</p>
        
        <p>Dengan Predikat:</p>
        <div class="grade">{{ $grade }} ({{ $score }})</div>
    </div>

    <div class="signature">
        <p>Pamekasan, {{ $date }}<br>Ketua LPPM</p>
        <div class="signature-line"></div>
        <p><strong>Dr. Nama Ketua LPPM, M.Pd.</strong><br>NIP. 19283719283</p>
    </div>
</body>
</html>
