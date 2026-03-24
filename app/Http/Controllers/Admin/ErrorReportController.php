<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ErrorReportController extends Controller
{
  /**
   * GET /admin/error-reports
   * List all error reports with pagination and optional filters.
   */
  public function index(Request $request)
  {
    $query = ErrorReport::with('user')
      ->latest();

    // Filter by status
    if ($request->filled('status') && $request->status !== 'all') {
      $query->where('status', $request->status);
    }

    // Search by description or page title
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('description', 'like', "%{$search}%")
          ->orWhere('page_title', 'like', "%{$search}%")
          ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
      });
    }

    $reports = $query->paginate(20)->withQueryString();

    return Inertia::render('Admin/ErrorReports/Index', [
      'reports' => $reports,
      'filters' => $request->only('status', 'search'),
      'statuses' => ['open', 'in_progress', 'resolved', 'dismissed'],
    ]);
  }

  /**
   * PATCH /admin/error-reports/{errorReport}
   * Update status and/or admin note.
   */
  public function update(Request $request, ErrorReport $errorReport)
  {
    $validated = $request->validate([
      'status' => ['required', 'string', 'in:open,in_progress,resolved,dismissed'],
      'admin_note' => ['nullable', 'string', 'max:2000'],
    ]);

    $errorReport->update($validated);

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Report updated successfully.',
    ]);
  }

  /**
   * DELETE /admin/error-reports/{errorReport}
   * Permanently delete a report (image cleanup handled by model observer).
   */
  public function destroy(ErrorReport $errorReport)
  {
    $errorReport->delete();

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Report deleted.',
    ]);
  }
}