<?php

namespace App\Http\Controllers;

use App\Mail\NewWordListOrderMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\UserWordListAccess;
use App\Models\WordListCategory;
use App\Models\WordListOrder;
use App\Models\WordListOrderItem;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserWordListOrderController extends Controller
{
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

    // Create the order
    $order = WordListOrder::create([
      'user_id' => $user->id,
      'name' => $request->name,
      'phone_number' => $request->phone_number,
      'address' => $request->address,
      'profession' => $request->profession,
      'payment_method' => 'bkash',
      'transaction_id' => $request->transaction_id,
      'note' => $request->note,
      'status' => 'pending',
    ]);

    // Attach items
    $items = $categoryIds->map(fn($id) => [
      'word_list_order_id' => $order->id,
      'word_list_category_id' => $id,
      'created_at' => now(),
      'updated_at' => now(),
    ])->all();

    WordListOrderItem::insert($items);

    $receiverEmail = config('settings.receiver_email');

    if ($receiverEmail) {
      try {
        $categoryNames = $categories->whereIn('id', $categoryIds->all())->pluck('name')->all();
        $mailable = new NewWordListOrderMail($order, $categoryNames);

        if (config('mail_queue.is_queue')) {
          Mail::to($receiverEmail)->queue($mailable);
        } else {
          Mail::purge('smtp');
          Mail::mailer('smtp')->to($receiverEmail)->send($mailable);
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