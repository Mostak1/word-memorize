<?php

namespace App\Http\Controllers;

use App\Models\ErrorReport;
use Illuminate\Http\Request;

class ErrorReportController extends Controller
{
  /**
   * POST /error-reports
   * Authenticated users only — enforced via route middleware.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'page_url' => ['required', 'string', 'max:500'],
      'page_title' => ['nullable', 'string', 'max:255'],
      'description' => ['required', 'string', 'min:5', 'max:3000'],
      'image' => ['nullable', 'image', 'mimes:jpeg,png,webp,gif', 'max:4096'],
    ]);

    $imagePath = null;
    if ($request->hasFile('image')) {
      $imagePath = $request->file('image')->store('error-reports', 'public');
    }

    ErrorReport::create([
      'user_id' => auth()->id(),
      'page_url' => $validated['page_url'],
      'page_title' => $validated['page_title'] ?? null,
      'description' => $validated['description'],
      'image_path' => $imagePath,
    ]);

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Report submitted. Thank you!',
    ]);
  }
}