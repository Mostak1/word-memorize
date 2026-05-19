<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\XpOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XpOrderController extends Controller
{
    /**
     * Display a listing of XP purchase orders.
     */
    public function index(Request $request)
    {
        $query = XpOrder::with('user')->orderByDesc('id');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('package_name', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $orders = $query->paginate(10)->withQueryString();

        return inertia('Admin/XpOrders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
            'statuses' => ['pending', 'approved', 'rejected'],
        ]);
    }

    /**
     * Update order status — observer handles XP credit/refund automatically.
     */
    public function update(Request $request, XpOrder $xpOrder)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $xpOrder->update($data);

        return back()->with('flash', [
            'type' => 'success',
            'message' => 'XP Order updated successfully.',
        ]);
    }

    /**
     * Delete order — observer handles XP refund automatically if approved.
     */
    public function destroy(XpOrder $xpOrder)
    {
        $xpOrder->delete();

        return back()->with('flash', [
            'type' => 'success',
            'message' => 'XP Order deleted successfully.',
        ]);
    }
}
