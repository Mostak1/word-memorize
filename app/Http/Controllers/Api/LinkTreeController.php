<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Click;
use App\Models\Link;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkTreeController extends Controller
{
  /**
   * GET /api/linktree
   *
   * Returns the full public profile — profile info, active links,
   * and active social links — ready to be consumed by the Vite React app.
   */
  public function show(): JsonResponse
  {
    $profile = Profile::singleton()->load([
      'activeLinks' => fn($q) => $q->orderBy('order'),
    ]);

    $links = $profile->activeLinks->map(fn(Link $link) => [
      'id' => $link->id,
      'title' => $link->title,
      'url' => route('api.linktree.redirect', $link),   // tracked redirect URL
      'icon' => $link->icon,
      'thumbnail_full' => $link->thumbnail_full,
      'order' => $link->order,
    ]);

    return response()->json([
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
   * GET /api/linktree/redirect/{link}
   *
   * Records a click then returns the real destination URL.
   * The React app opens link.url (this endpoint), which redirects
   * the browser to the actual target.
   *
   * If you prefer the React app to handle opening in a new tab,
   * you can instead call POST /api/linktree/{link}/click and open
   * link.original_url directly — see the click() method below.
   */
  public function redirect(Request $request, Link $link)
  {
    abort_unless($link->is_active, 404);

    Click::record($link, $request);

    // 302 redirect to the real URL (works for <a href="…"> navigation)
    return redirect()->away($link->url);
  }

  /**
   * POST /api/linktree/{link}/click
   *
   * Fire-and-forget click tracker for SPAs that open links in a new tab
   * themselves (e.g. window.open / target="_blank").
   *
   * The React app calls this endpoint on click, then navigates to
   * the original URL that came back in the show() response's
   * `original_url` field (add it there if you use this flow).
   */
  public function click(Request $request, Link $link): JsonResponse
  {
    abort_unless($link->is_active, 404);

    Click::record($link, $request);

    return response()->json(['recorded' => true]);
  }
}