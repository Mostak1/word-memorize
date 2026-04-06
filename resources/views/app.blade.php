<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#e70013" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'VocabPix') }}" />
    <meta name="application-name" content="{{ config('app.name', 'VocabPix') }}" />
    <meta name="msapplication-TileColor" content="#e70013" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="mask-icon" href="/masked-icon.svg" color="#e70013" />
    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <!-- <link rel="shortcut icon" href="{{ asset('img/icon.png') }}" type="image/x-icon"> -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/icons/icon-192x192.png" type="image/png">

    <!-- Puter.js -->
    <script src="https://js.puter.com/v2/"></script>

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
