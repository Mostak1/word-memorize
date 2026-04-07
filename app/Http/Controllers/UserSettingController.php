<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserSettingController extends Controller
{
  /**
   * Show the settings page.
   * Passes the current settings to the React component via Inertia.
   */
  public function show(Request $request)
  {
    $settings = UserSetting::forUser($request->user());

    return Inertia::render('Settings', [
      'settings' => [
        'show_bangla' => $settings->show_bangla,
      ],
    ]);
  }

  /**
   * Update one or more settings.
   * Accepts a JSON body: { "show_bangla": true/false }
   */
  public function update(Request $request)
  {
    $validated = $request->validate([
      'show_bangla' => ['sometimes', 'boolean'],
    ]);

    $settings = UserSetting::forUser($request->user());
    $settings->update($validated);

    return back()->with('success', 'Settings saved.');
  }
}