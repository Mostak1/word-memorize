<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Click;
use App\Models\Link;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LinkTreeLinkController extends Controller
{
  // ── Store ─────────────────────────────────────────────────────────────────

  public function store(Request $request)
  {
    $validated = $request->validate([
      'title' => ['required', 'string', 'max:100'],
      'url' => ['required', 'url', 'max:2048'],
      'icon' => ['nullable', 'string', 'max:50'],
      'is_active' => ['boolean'],
    ]);

    $profile = Profile::singleton();
    $maxOrder = $profile->links()->max('order') ?? -1;

    $profile->links()->create([
      ...$validated,
      'order' => $maxOrder + 1,
      'is_active' => $validated['is_active'] ?? true,
    ]);

    return back()->with('success', 'Link added.');
  }

  // ── Update ────────────────────────────────────────────────────────────────

  public function update(Request $request, Link $link)
  {
    $validated = $request->validate([
      'title' => ['required', 'string', 'max:100'],
      'url' => ['required', 'url', 'max:2048'],
      'icon' => ['nullable', 'string', 'max:50'],
      'is_active' => ['boolean'],
    ]);

    $link->update($validated);

    return back()->with('success', 'Link updated.');
  }

  // ── Toggle ────────────────────────────────────────────────────────────────

  public function toggle(Link $link)
  {
    $link->update(['is_active' => !$link->is_active]);

    return back()->with('success', 'Link ' . ($link->is_active ? 'activated' : 'deactivated') . '.');
  }

  // ── Reorder ───────────────────────────────────────────────────────────────

  public function reorder(Request $request)
  {
    $request->validate([
      'links' => ['required', 'array'],
      'links.*.id' => ['required', 'integer', 'exists:links,id'],
    ]);

    foreach ($request->links as $index => $item) {
      Link::where('id', $item['id'])->update(['order' => $index]);
    }

    return back()->with('success', 'Order saved.');
  }

  // ── Destroy ───────────────────────────────────────────────────────────────

  public function destroy(Link $link)
  {
    // Clean up thumbnail if present
    if ($link->thumbnail) {
      Storage::disk('public')->delete(ltrim($link->thumbnail, '/'));
    }

    $link->delete();

    return back()->with('success', 'Link deleted.');
  }

  // ── Thumbnail Upload ──────────────────────────────────────────────────────

  public function uploadThumbnail(Request $request, Link $link)
  {
    $request->validate([
      'thumbnail' => ['required', 'image', 'max:2048'],
    ]);

    // Remove old thumbnail
    if ($link->thumbnail) {
      Storage::disk('public')->delete(ltrim($link->thumbnail, '/'));
    }

    $path = $request->file('thumbnail')->store('linktree/thumbnails', 'public');
    $link->update(['thumbnail' => $path]);

    return back()->with('success', 'Thumbnail updated.');
  }

  // ── Thumbnail Delete ──────────────────────────────────────────────────────

  public function deleteThumbnail(Link $link)
  {
    if ($link->thumbnail) {
      Storage::disk('public')->delete(ltrim($link->thumbnail, '/'));
      $link->update(['thumbnail' => null]);
    }

    return back()->with('success', 'Thumbnail removed.');
  }

  // ── Click tracking (public) ───────────────────────────────────────────────

  public function redirect(Request $request, Link $link)
  {
    abort_unless($link->is_active, 404);

    Click::record($link, $request);

    return redirect()->away($link->url);
  }
}