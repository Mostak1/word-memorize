<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- <link rel="manifest" href="/manifest.webmanifest" /> -->
    <meta name="theme-color" content="#e70013" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'VocabPix') }}" />
    <meta name="application-name" content="{{ config('app.name', 'VocabPix') }}" />
    <meta name="msapplication-TileColor" content="#e70013" />
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}" />
    <link rel="mask-icon" href="{{ asset('masked-icon.svg') }}" color="#e70013" />
    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
    <link rel="icon" href="{{ asset('icon-192x192.png') }}" type="image/png">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    <!-- Loading Splash Screen -->
    <div id="app-splash"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-500 opacity-100">
        <div class="text-center">
            <!-- Spinner -->
            <div class="mb-6">
                <div
                    class="w-16 h-16 mx-auto border-4 border-slate-200 dark:border-slate-700 border-t-red-600 dark:border-t-red-500 rounded-full animate-spin">
                </div>
            </div>
            <!-- App Name -->
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">VocabPix</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Loading your vocabulary companion...</p>
        </div>
    </div>
    @inertia
</body>

</html>