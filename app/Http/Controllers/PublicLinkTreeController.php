<?php

namespace App\Http\Controllers;

use App\Models\Click;
use App\Models\Link;
use App\Models\Profile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicLinkTreeController extends Controller
{
  /**
   * Render the public-facing LinkTree page.
   *
   * Route: GET /links  (or whatever slug you prefer, e.g. GET /@{username})
   */
  public function show(): Response
  {
    $profile = Profile::singleton()->load([
      'activeLinks' => fn($q) => $q->orderBy('order'),
    ]);

    $links = $profile->activeLinks->map(fn(Link $link) => [
      'id' => $link->id,
      'title' => $link->title,
      'url' => $link->url,
      'icon' => $link->icon,
      'thumbnail_full' => $link->thumbnail_full,
      'order' => $link->order,
    ]);

    return Inertia::render('Public/LinkTree/Show', [
      'profile' => [
        'title' => $profile->title,
        'description' => $profile->description,
        'theme' => $profile->theme,
        'custom_css' => $profile->custom_css,
        'profile_image_full' => $profile->profile_image_full,
        'cover_image_full' => $profile->cover_image_full,
      ],
      'links' => $links,
      'socialLinks' => $profile->activeSocialLinks(),
    ]);
  }

  /**
   * Record a click and redirect to the link's target URL.
   *
   * Route: GET /l/{link}
   */
  public function redirect(Request $request, Link $link)
  {
    abort_unless($link->is_active, 404);

    Click::record($link, $request);

    return redirect()->away($link->url);
  }
}