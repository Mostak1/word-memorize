<?php

// config/cors.php — update allowed_origins with your Vite app's domain.
// Laravel uses the fruitcake/laravel-cors package (built-in since Laravel 7).

return [

  /*
  |--------------------------------------------------------------------------
  | Cross-Origin Resource Sharing (CORS) Configuration
  |--------------------------------------------------------------------------
  | These values are used by the HandleCors middleware automatically.
  | Adjust `allowed_origins` for each environment.
  |
  | For local development:  'http://localhost:5173'  (Vite dev server)
  | For production:         'https://your-react-app.com'
  */

  'paths' => ['api/*', 'sanctum/csrf-cookie'],

  'allowed_methods' => ['*'],

  'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://links.fluento.org',
  ],

  'allowed_origins_patterns' => [],

  'allowed_headers' => ['*'],

  'exposed_headers' => [],

  'max_age' => 0,

  'supports_credentials' => false,   // set true only if you add auth cookies later

];