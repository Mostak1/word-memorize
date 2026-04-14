<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureDeviceSessionActive
{
  /**
   * Handle an incoming request.
   */
  public function handle(Request $request, Closure $next)
  {
    $user = Auth::user();

    if ($user && $request->session()->getId()) {
      $active = $user->devices()
        ->where('session_id', $request->session()->getId())
        ->where('is_active', true)
        ->exists();

      if (!$active) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('flash', [
          'toast' => [
            'type' => 'info',
            'message' => 'Your session has ended. Please sign in again.',
          ],
        ]);
      }
    }

    return $next($request);
  }
}
