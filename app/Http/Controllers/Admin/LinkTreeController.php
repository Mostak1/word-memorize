<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Click;
use App\Models\Link;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LinkTreeController extends Controller
{
  // ── Overview / Analytics ──────────────────────────────────────────────────

  public function index(): Response
  {
    $profile = Profile::singleton()->load([
      'links' => function ($q) {
        $q->withCount('clicks')->orderBy('order');
      }
    ]);

    $linksWithStats = $profile->links->map(function (Link $link) {
      return [
        'id' => $link->id,
        'title' => $link->title,
        'url' => $link->url,
        'icon' => $link->icon,
        'thumbnail' => $link->thumbnail,
        'thumbnail_full' => $link->thumbnail_full,
        'order' => $link->order,
        'is_active' => $link->is_active,
        'clicks_total' => $link->clicks_count,
        'clicks_7d' => $link->clickCount(7),
        'clicks_30d' => $link->clickCount(30),
      ];
    });

    $clicksChart = Click::selectRaw('DATE(clicked_at) as date, COUNT(*) as total')
      ->where('clicked_at', '>=', now()->subDays(30))
      ->groupBy('date')
      ->orderBy('date')
      ->get();

    return Inertia::render('Admin/LinkTree/Index', [
      'profile' => $profile,
      'links' => $linksWithStats,
      'clicksChart' => $clicksChart,
      'themes' => self::availableThemes(),
      'socialPlatforms' => self::availableSocialPlatforms(),
    ]);
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  public function updateProfile(Request $request)
  {
    $validated = $request->validate([
      'title' => ['required', 'string', 'max:100'],
      'description' => ['nullable', 'string', 'max:500'],
      'theme' => ['required', 'string', 'in:' . implode(',', array_keys(self::availableThemes()))],
      'custom_css' => ['nullable', 'string', 'max:5000'],
    ]);

    Profile::singleton()->update($validated);

    return back()->with('success', 'Profile updated.');
  }

  // ── Social Links ──────────────────────────────────────────────────────────

  public function updateSocialLinks(Request $request)
  {
    $request->validate([
      'social_links' => ['present', 'array'],
      'social_links.*.platform' => ['required', 'string', 'max:50'],
      'social_links.*.url' => ['nullable', 'url', 'max:2048'],
      'social_links.*.is_active' => ['boolean'],
      'social_links.*.order' => ['integer'],
    ]);

    Profile::singleton()->update([
      'social_links' => $request->social_links,
    ]);

    return back()->with('success', 'Social links updated.');
  }

  // ── Profile Images ────────────────────────────────────────────────────────

  public function uploadProfileImage(Request $request)
  {
    $request->validate(['profile_image' => ['required', 'image', 'max:2048']]);

    $profile = Profile::singleton();

    if ($profile->profile_image) {
      Storage::disk('public')->delete(ltrim($profile->profile_image, '/'));
    }

    $path = $request->file('profile_image')->store('linktree/profile', 'public');
    $profile->update(['profile_image' => '/' . $path]);

    return back()->with('success', 'Profile image updated.');
  }

  public function uploadCoverImage(Request $request)
  {
    $request->validate(['cover_image' => ['required', 'image', 'max:4096']]);

    $profile = Profile::singleton();

    if ($profile->cover_image) {
      Storage::disk('public')->delete(ltrim($profile->cover_image, '/'));
    }

    $path = $request->file('cover_image')->store('linktree/cover', 'public');
    $profile->update(['cover_image' => $path]);

    return back()->with('success', 'Cover image updated.');
  }

  public function deleteProfileImage()
  {
    $profile = Profile::singleton();

    if ($profile->profile_image) {
      Storage::disk('public')->delete(ltrim($profile->profile_image, '/'));
      $profile->update(['profile_image' => null]);
    }

    return back()->with('success', 'Profile image removed.');
  }

  public function deleteCoverImage()
  {
    $profile = Profile::singleton();

    if ($profile->cover_image) {
      Storage::disk('public')->delete(ltrim($profile->cover_image, '/'));
      $profile->update(['cover_image' => null]);
    }

    return back()->with('success', 'Cover image removed.');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private static function availableThemes(): array
  {
    return [
      'default' => 'Default',
      'dark' => 'Dark',
      'minimal' => 'Minimal',
      'gradient' => 'Gradient',
      'forest' => 'Forest',
      'ocean' => 'Ocean',
      'fluento' => 'Fluento',
    ];
  }

  public static function availableSocialPlatforms(): array
  {
    return [
      'facebook' => 'Facebook',
      'youtube' => 'YouTube',
      'tiktok' => 'TikTok',
      'whatsapp' => 'WhatsApp',
      'instagram' => 'Instagram',
      'twitter' => 'Twitter / X',
      'linkedin' => 'LinkedIn',
      'github' => 'GitHub',
      'email' => 'Email',
      'website' => 'Website',
      'threads' => 'Threads',
      'whatsapp_channel' => 'WhatsApp Channel',
      'snapchat' => 'Snapchat',
    ];
  }
}