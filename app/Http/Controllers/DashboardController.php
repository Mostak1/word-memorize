<?php

namespace App\Http\Controllers;

use App\Models\ReviewWord;
use App\Models\WordProgress;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
  public function __construct(private StreakService $streakService)
  {
  }

  public function index(Request $request)
  {
    $user = $request->user();

    // Dashboard only reads streak state — it never advances it.
    // Streak advances only when the user completes a quiz or exercise.

    // Reuse the same count logic as the Revise page.
    $reviseCounts = app(ReviewWordController::class)->getReviseCounts($user);

    return Inertia::render('Dashboard', [
      'masteredCount' => WordProgress::where('user_id', $user->id)
        ->where('box', '>=', WordProgress::MASTERED_BOX)
        ->count(),
      'reviewCount' => ReviewWord::where('user_id', $user->id)->count(),
      'streak' => $this->streakService->getSummary($user),
      'reviseCounts' => $reviseCounts,
    ]);
  }

  public function dismissStreakBroken(Request $request)
  {
    $user = $request->user();
    $streak = $this->streakService->getOrCreate($user);
    $streak->update(['broken_streak_notified' => true]);

    return response()->json(['status' => 'ok']);
  }
}