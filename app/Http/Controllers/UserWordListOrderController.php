<?php

namespace App\Http\Controllers;

use App\Models\WordList;
use App\Models\WordListOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserWordListOrderController extends Controller
{
  /**
   * Store a new purchase order for a locked word list.
   */
  public function store(Request $request, WordList $wordList)
  {
    $user = $request->user();

    // Block if already has an approved or pending order
    $existing = WordListOrder::where('user_id', $user->id)
      ->where('wordlist_id', $wordList->id)
      ->whereIn('status', ['pending', 'approved'])
      ->first();

    if ($existing) {
      return back()->withErrors([
        'order' => $existing->status === 'approved'
          ? 'You already have access to this word list.'
          : 'You already have a pending order for this word list.',
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
      ->where('wordlist_id', $wordList->id)
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
        'admin_note' => null, // clear the previous rejection reason
        'status' => 'pending',
      ]);
    } else {
      WordListOrder::create([
        'user_id' => $user->id,
        'wordlist_id' => $wordList->id,
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
    $orders = WordListOrder::with('wordlist:id,title')
      ->where('user_id', $request->user()->id)
      ->latest()
      ->get();

    return Inertia::render('MyOrders', [
      'orders' => $orders,
    ]);
  }
}