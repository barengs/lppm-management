<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $setting->title_top ?? 'USULAN PROPOSAL' }}</title>
    <style>
        body { 
            font-family: 'Helvetica', sans-serif; 
            color: #333; 
            line-height: 1.5; 
            font-size: 12pt;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            height: 100%;
            text-align: center;
            padding-top: 50px;
        }
        .title-top {
            font-weight: bold;
            font-size: 18pt;
            margin-bottom: 50px;
            text-transform: uppercase;
        }
        .logo {
            margin: 50px 0;
        }
        .logo img {
            width: 150px;
            height: auto;
        }
        .proposal-title {
            font-weight: bold;
            font-size: 14pt;
            margin: 50px auto;
            width: 80%;
            text-transform: uppercase;
        }
        .author-info {
            margin-top: 100px;
            margin-bottom: 100px;
        }
        .footer-info {
            position: absolute;
            bottom: 50px;
            width: 100%;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-top">
            {{ $setting->title_top ?? 'USULAN PROPOSAL' }}
        </div>

        <div class="logo">
            @if($setting->logo_path)
                <img src="{{ public_path('storage/' . $setting->logo_path) }}" alt="Logo">
            @else
                <div style="height: 150px;"></div>
            @endif
        </div>

        <div class="proposal-title">
            {{ $proposal->title }}
        </div>

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
</body>
</html>
