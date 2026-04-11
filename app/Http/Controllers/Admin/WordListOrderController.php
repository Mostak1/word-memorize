<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordListOrder;
use Illuminate\Http\Request;
use App\Mail\WordListOrderStatusMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class WordListOrderController extends Controller
{
  public function index(Request $request)
  {
    $query = WordListOrder::with(['user', 'categories'])->orderByDesc('id');

    if ($search = $request->input('search')) {
      $query->where(function ($q) use ($search) {
        $q->where('transaction_id', 'like', "%{$search}%")
          ->orWhere('note', 'like', "%{$search}%")
          ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$search}%"))
          ->orWhereHas('categories', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
      });
    }

    if ($status = $request->input('status')) {
      if ($status !== 'all') {
        $query->where('status', $status);
      }
    }

    $orders = $query->paginate(10)->withQueryString();

    return inertia('Admin/WordListOrders/Index', [
      'orders' => $orders,
      'filters' => $request->only(['search', 'status']),
      'statuses' => ['pending', 'approved', 'rejected'],
    ]);
  }

  /**
   * Update order status — observer handles access grant/revoke automatically.
   */
  public function update(Request $request, WordListOrder $order)
  {
    $data = $request->validate([
      'status' => ['required', 'in:pending,approved,rejected'],
      'admin_note' => ['nullable', 'string', 'max:2000'],
    ]);

    $order->update($data);
    // Observer fires here → grantAccess() or revokeAccess() called automatically
    // ── Notify the user about their order status change ───────────────────
    $userEmail = $order->user?->email;
    // $userEmail = 'cryfar556@gmail.com';

    if ($userEmail && in_array($order->status, ['approved', 'rejected'])) {
      try {
        $order->load('categories'); // ensure categories are loaded for the view

        $mailable = new WordListOrderStatusMail($order);

        if (config('mail_queue.is_queue')) {
          Mail::to($userEmail)->cc(config('settings.receiver_email'))->queue($mailable);
        } else {
          Mail::purge('smtp');
          Mail::mailer('smtp')->to($userEmail)->cc(config('settings.receiver_email'))->send($mailable);
        }
      } catch (\Exception $e) {
        Log::error('Failed to send order status email to user', [
          'order_id' => $order->id,
          'user_email' => $userEmail,
          'status' => $order->status,
          'error' => $e->getMessage(),
        ]);
      }
    }

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Order updated successfully.',
    ]);
  }

  /**
   * Delete order — observer fires revokeAccess() before deletion.
   */
  public function destroy(WordListOrder $order)
  {
    $order->delete();

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Order deleted successfully.',
    ]);
  }
}