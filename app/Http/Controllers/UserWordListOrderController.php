<?php

namespace App\Http\Controllers;

use App\Mail\NewWordListOrderMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\UserWordListAccess;
use App\Models\WordListCategory;
use App\Models\WordListOrder;
use App\Models\WordListOrderItem;
use App\Services\ReferralService;
use App\Services\CouponService;
use App\Support\Telemetry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserWordListOrderController extends Controller
{
  public function __construct(
    private ReferralService $referralService,
    private CouponService $couponService
  ) {
  }

  /**
   * Store a new order — supports single or combo categories.
   *
   * POST /wordlist-categories/order
   * Body: { category_ids: [1, 2], name, phone_number, address, ... }
   */
  public function store(Request $request)
  {
    $user = $request->user();

    $request->validate([
      'category_ids' => ['required', 'array', 'min:1'],
      'category_ids.*' => ['integer', 'exists:word_list_categories,id'],
      'name' => ['required', 'string', 'max:255'],
      'phone_number' => ['required', 'string', 'max:20'],
      'address' => ['required', 'string', 'max:500'],
      'profession' => ['nullable', 'string', 'max:255'],
      'transaction_id' => ['required', 'string', 'max:100'],
      'note' => ['nullable', 'string', 'max:1000'],
      'referral_discount_credit_id' => ['nullable', 'integer'],
      'coupon_code' => ['nullable', 'string', 'max:50'],
    ]);

    $categoryIds = collect($request->category_ids)->unique()->values();

    // Validate each requested category is actually locked
    $categories = WordListCategory::whereIn('id', $categoryIds)->get();
    $unlocked = $categories->where('is_locked', false)->pluck('name');
    if ($unlocked->isNotEmpty()) {
      throw ValidationException::withMessages([
        'category_ids' => "These categories are not locked: {$unlocked->join(', ')}",
      ]);
    }

    // Block categories where user already has access or a pending order
    $alreadyAccess = UserWordListAccess::where('user_id', $user->id)
      ->whereIn('word_list_category_id', $categoryIds)
      ->pluck('word_list_category_id');

    if ($alreadyAccess->isNotEmpty()) {
      $names = $categories->whereIn('id', $alreadyAccess)->pluck('name');
      throw ValidationException::withMessages([
        'category_ids' => "You already have access to: {$names->join(', ')}",
      ]);
    }

    // Check for pending orders on any of the requested categories
    // (via order items join)
    $pendingCategoryIds = WordListOrderItem::whereIn('word_list_category_id', $categoryIds)
      ->whereHas(
        'order',
        fn($q) => $q
          ->where('user_id', $user->id)
          ->where('status', 'pending')
      )
      ->pluck('word_list_category_id');

    if ($pendingCategoryIds->isNotEmpty()) {
      $names = $categories->whereIn('id', $pendingCategoryIds)->pluck('name');
      throw ValidationException::withMessages([
        'category_ids' => "You already have a pending order for: {$names->join(', ')}",
      ]);
    }

    $order = DB::transaction(function () use ($request, $user, $categories, $categoryIds) {
      $coupon = $this->couponService->validateCode($request->coupon_code, $user);

      $amounts = $this->referralService->calculateOrderAmounts(
        $user,
        $categories,
        $categoryIds,
        $request->integer('referral_discount_credit_id') ?: null
      );

      // If coupon exists, it overrides referral credit
      if ($coupon) {
        $amounts['discount_percent'] = $coupon->discount_percent;
        $amounts['discount_amount'] = round($amounts['subtotal_amount'] * ($coupon->discount_percent / 100), 2);
        $amounts['payable_amount'] = max(round($amounts['subtotal_amount'] - $amounts['discount_amount'], 2), 0);
        $amounts['credit'] = null; // Don't use referral credit if coupon is used
      }

      $order = WordListOrder::create([
        'user_id' => $user->id,
        'name' => $request->name,
        'phone_number' => $request->phone_number,
        'address' => $request->address,
        'profession' => $request->profession,
        'payment_method' => 'bkash',
        'subtotal_amount' => $amounts['subtotal_amount'],
        'discount_percent' => $amounts['discount_percent'],
        'discount_amount' => $amounts['discount_amount'],
        'payable_amount' => $amounts['payable_amount'],
        'referral_discount_credit_id' => $amounts['credit']?->id,
        'coupon_id' => $coupon?->id,
        'transaction_id' => $request->transaction_id,
        'note' => $request->note,
        'status' => 'pending',
      ]);

      $items = $categoryIds->map(fn($id) => [
        'word_list_order_id' => $order->id,
        'word_list_category_id' => $id,
        'created_at' => now(),
        'updated_at' => now(),
      ])->all();

      WordListOrderItem::insert($items);

      if ($amounts['credit']) {
        $this->referralService->markCreditUsed($amounts['credit'], $order);
      }

      if ($coupon) {
        $this->couponService->markAsUsed($coupon);
      }

      return $order;
    });

    Telemetry::record($request, 'order_created', [
      'order_id' => $order->id,
      'category_ids' => $categoryIds->all(),
      'item_count' => $categoryIds->count(),
      'payment_method' => 'bkash',
      'subtotal_amount' => $order->subtotal_amount,
      'discount_percent' => $order->discount_percent,
      'payable_amount' => $order->payable_amount,
    ]);

    $receiverEmail = config('settings.receiver_email');

    if ($receiverEmail) {
      try {
        $categoryNames = $categories->whereIn('id', $categoryIds->all())->pluck('name')->all();
        $mailable = new NewWordListOrderMail($order, $categoryNames);

        if (config('settings.mail_queue')) {
          Mail::to($receiverEmail)->queue($mailable);
          Log::info('New order notification email queued', [
            'order_id' => $order->id,
            'receiver_email' => $receiverEmail
          ]);
        } else {
          Mail::purge('smtp');
          Mail::mailer('smtp')->to($receiverEmail)->send($mailable);
          Log::info('New order notification email sent (sync)', [
            'order_id' => $order->id,
            'receiver_email' => $receiverEmail
          ]);
        }
      } catch (\Exception $e) {
        Log::error('Failed to send new order notification email', [
          'order_id' => $order->id,
          'receiver_email' => $receiverEmail,
          'error' => $e->getMessage(),
        ]);
      }
    } else {
      Log::info('No receiver email configured for new order notifications.');
    }

    return back()->with('success', 'Order submitted! We will review and grant access soon.');
  }

  /**
   * Show the authenticated user's orders.
   */
  public function index(Request $request)
  {
    $orders = WordListOrder::with('categories:id,name,thumbnail')
      ->where('user_id', $request->user()->id)
      ->latest()
      ->get();

    return Inertia::render('MyOrders', [
      'orders' => $orders,
    ]);
  }
}
