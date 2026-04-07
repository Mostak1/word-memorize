<?php

namespace App\Http\Controllers;

use App\Models\WordListCategory;
use App\Models\WordListOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserWordListOrderController extends Controller
{
  /**
   * Store a new purchase order for a locked word list category.
   */
  public function store(Request $request, WordListCategory $category)
  {
    $user = $request->user();

    // Block if already has an approved or pending order for this category
    $existing = WordListOrder::where('user_id', $user->id)
      ->where('word_list_category_id', $category->id)
      ->whereIn('status', ['pending', 'approved'])
      ->first();

    if ($existing) {
      return back()->withErrors([
        'order' => $existing->status === 'approved'
          ? 'You already have access to this category.'
          : 'You already have a pending order for this category.',
      ]);
    }

    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'phone_number' => ['required', 'string', 'max:20'],
      'address' => ['required', 'string', 'max:500'],
      'profession' => ['nullable', 'string', 'max:255'],
      'transaction_id' => ['required', 'string', 'max:100'],
      'note' => ['nullable', 'string', 'max:1000'],
    ]);

    // If a rejected order exists, update it instead of creating a duplicate
    $rejected = WordListOrder::where('user_id', $user->id)
      ->where('word_list_category_id', $category->id)
      ->where('status', 'rejected')
      ->latest()
      ->first();

    if ($rejected) {
      $rejected->update([
        'name' => $validated['name'],
        'phone_number' => $validated['phone_number'],
        'address' => $validated['address'],
        'profession' => $validated['profession'] ?? null,
        'transaction_id' => $validated['transaction_id'],
        'note' => $validated['note'] ?? null,
        'admin_note' => null,
        'status' => 'pending',
      ]);
    } else {
      WordListOrder::create([
        'user_id' => $user->id,
        'word_list_category_id' => $category->id,
        'name' => $validated['name'],
        'phone_number' => $validated['phone_number'],
        'address' => $validated['address'],
        'profession' => $validated['profession'] ?? null,
        'transaction_id' => $validated['transaction_id'],
        'note' => $validated['note'] ?? null,
        'status' => 'pending',
      ]);
    }

    return back()->with('success', 'Order submitted successfully! We will review and grant access soon.');
  }

  /**
   * Show the authenticated user's orders.
   */
  public function index(Request $request)
  {
    $orders = WordListOrder::with('category:id,name,thumbnail')
      ->where('user_id', $request->user()->id)
      ->latest()
      ->get();

    return Inertia::render('MyOrders', [
      'orders' => $orders,
    ]);
  }
}