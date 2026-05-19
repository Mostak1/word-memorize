<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent followed notifications.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['notifications' => []]);
        }

        // Fetch unread notifications with notifier details
        $notifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->with(['notifier'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a list of notifications as read.
     */
    public function markRead(Request $request)
    {
        $user = $request->user();
        $ids = $request->input('ids', []);

        if (!$user || empty($ids)) {
            return response()->json(['status' => 'ignored']);
        }

        Notification::where('user_id', $user->id)
            ->whereIn('id', $ids)
            ->update(['is_read' => true]);

        return response()->json(['status' => 'success']);
    }
}
