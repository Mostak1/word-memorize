<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompleteProfileController extends Controller
{
  /**
   * Show the "complete your profile" page (WhatsApp number prompt).
   * Only accessible when a pending Google user exists in the session.
   */
  public function show(): Response|RedirectResponse
  {
    if (!session('google_pending_user')) {
      return redirect()->route('login');
    }

    return Inertia::render('Auth/CompleteProfile', [
      'googleUser' => session('google_pending_user'),
    ]);
  }

  /**
   * Create the user account with the supplied WhatsApp number.
   */
  public function store(Request $request): RedirectResponse
  {
    $googleData = session('google_pending_user');

    if (!$googleData) {
      return redirect()->route('login');
    }

    $request->validate([
      'phone_number' => ['required', 'string', 'max:20'],
    ]);

    $user = User::create([
      'name' => $googleData['name'],
      'email' => $googleData['email'],
      'google_id' => $googleData['google_id'],
      'provider' => 'google',
      'password' => bcrypt(str()->random(24)),
      'role' => 'student',
      'approve_status' => 'approved',
      'phone_number' => $request->phone_number,
      'image' => $googleData['avatar'] ?? null,  // save Google profile picture
    ]);

    // Clean up the session
    session()->forget('google_pending_user');

    Auth::login($user, true);

    return redirect('/dashboard')
      ->with('flash', [
        'toast' => [
          'type' => 'success',
          'message' => "Welcome to VocabPix, {$user->name}! 🎉",
        ],
      ]);
  }
}