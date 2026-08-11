<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'LPPM UIM') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <script>
        window.addEventListener('error', function(event) {
            document.body.innerHTML += '<div style="background:red;color:white;padding:20px;position:fixed;top:0;left:0;right:0;z-index:9999;"><h3>Error</h3><pre>' + event.error?.stack + '</pre></div>';
        });
        window.addEventListener('unhandledrejection', function(event) {
            document.body.innerHTML += '<div style="background:orange;color:white;padding:20px;position:fixed;top:0;left:0;right:0;z-index:9999;"><h3>Unhandled Promise Rejection</h3><pre>' + (event.reason?.stack || event.reason) + '</pre></div>';
        });
    </script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
