<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WordListOrder;
use Illuminate\Http\Request;

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