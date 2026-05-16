<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'site_name' => $settings['site_name'] ?? config('app.name'),
                'site_email' => $settings['site_email'] ?? config('mail.from.address'),
                'referral_system_enabled' => filter_var($settings['referral_system_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'referral_new_user_discount_percent' => (int) ($settings['referral_new_user_discount_percent'] ?? 10),
                'referral_referrer_discount_percent' => (int) ($settings['referral_referrer_discount_percent'] ?? 10),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_email' => 'required|email',
            'referral_system_enabled' => ['sometimes', 'boolean'],
            'referral_new_user_discount_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'referral_referrer_discount_percent' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value]
            );
        }

        Cache::forget('settings');

        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}
