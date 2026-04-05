<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordListOrder;
use Illuminate\Http\Request;

class WordListOrderController extends Controller
{
  /**
   * Display a paginated list of WordList orders for admin.
   */
  public function index(Request $request)
  {
    $query = WordListOrder::with(['user', 'wordlist'])->orderByDesc('id');

    // Global search
    if ($search = $request->input('search')) {
      $query->where(function ($q) use ($search) {
        $q->where('transaction_id', 'like', "%{$search}%") // ✅ FIXED
          ->orWhere('note', 'like', "%{$search}%") // ✅ allow search in user note
          ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$search}%"))
          ->orWhereHas('wordlist', fn($q2) => $q2->where('title', 'like', "%{$search}%"));
      });
    }

    // Status filter
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
   * Update order status and admin note.
   */
  /**
   * Delete an order.
   */
  public function destroy(WordListOrder $order)
  {
    $order->delete();

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Order deleted successfully.',
    ]);
  }

  /**
   * Update order status and admin note.
   */
  public function update(Request $request, WordListOrder $order)
  {
    $data = $request->validate([
      'status' => ['required', 'in:pending,approved,rejected'],
      'admin_note' => ['nullable', 'string', 'max:2000'],
    ]);

    $order->update($data);

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Order updated successfully.',
    ]);
  }
}