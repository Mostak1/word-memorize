<?php

namespace App\Http\Controllers;

use App\Models\XpOrder;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use App\Support\Telemetry;

class UserXpPurchaseController extends Controller
{
    /**
     * Store a new pending XP purchase order.
     * 
     * POST /api/xp-shop/purchase
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'package_id' => ['required', 'string', 'in:starter,booster,legend'],
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'transaction_id' => ['required', 'string', 'max:100', 'unique:xp_orders,transaction_id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $packageId = $request->package_id;
        $package = XpOrder::PACKAGES[$packageId];

        $order = XpOrder::create([
            'user_id' => $user->id,
            'package_name' => $package['name'],
            'xp_amount' => $package['xp_amount'],
            'payable_amount' => $package['price'],
            'payment_method' => 'bkash',
            'phone_number' => $request->phone_number,
            'name' => $request->name,
            'transaction_id' => $request->transaction_id,
            'note' => $request->note,
            'status' => 'pending',
        ]);

        try {
            Telemetry::record($request, 'xp_order_created', [
                'order_id' => $order->id,
                'package_name' => $order->package_name,
                'xp_amount' => $order->xp_amount,
                'payable_amount' => $order->payable_amount,
                'payment_method' => 'bkash',
            ]);
        } catch (\Throwable $e) {
            Log::error('Telemetry failed in XP purchase store: ' . $e->getMessage());
        }

        return back()->with('success', 'XP order submitted! We will verify payment and credit your balance soon.');
    }
}
