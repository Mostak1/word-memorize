<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\WordListCategoryResource;
use App\Models\StreakFreezePurchase;
use App\Models\UserWordListAccess;
use App\Models\WordListCategory;
use App\Models\WordListOrder;
use App\Models\WordListOrderItem;
use App\Services\ReferralService;
use App\Services\StreakService;
use App\Services\XpService;
use App\Support\Telemetry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShopController extends Controller
{
    public function __construct(
        private XpService $xpService,
        private StreakService $streakService,
        private ReferralService $referralService,
    ) {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $categories = WordListCategory::with('creator')
            ->where('is_locked', true)
            ->where('status', true)
            ->withCount('wordLists')
            ->orderBy('name')
            ->get();

        $pendingCategoryIds = WordListOrderItem::whereHas(
            'order',
            fn($query) => $query->where('user_id', $user->id)->where('status', 'pending')
        )->pluck('word_list_category_id')->unique()->values()->all();

        $accessCategoryIds = UserWordListAccess::where('user_id', $user->id)
            ->pluck('word_list_category_id')
            ->all();

        return response()->json([
            'word_list_categories' => $categories
                ->map(function (WordListCategory $category) use ($request, $pendingCategoryIds, $accessCategoryIds) {
                    $payload = (new WordListCategoryResource($category))->resolve($request);
                    $payload['shop_status'] = in_array($category->id, $accessCategoryIds, true)
                        ? 'owned'
                        : (in_array($category->id, $pendingCategoryIds, true) ? 'pending' : null);

                    return $payload;
                })
                ->values(),
            'pending_category_ids' => $pendingCategoryIds,
            'access_category_ids' => $accessCategoryIds,
            'referral' => [
                ...$this->referralService->publicSettings(),
                'available_credits' => $this->referralService->availableCreditPayload($user),
            ],
        ]);
    }

    public function xpStatus(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'xp' => $this->xpService->getSummary($user),
            'streak' => $this->streakService->getSummary($user),
            'dark_mode_unlocked' => $this->xpService->hasDarkModeUnlocked($user),
        ]);
    }

    public function buyStreakFreeze(Request $request)
    {
        $user = $request->user();

        if (StreakFreezePurchase::where('user_id', $user->id)->count() >= 3) {
            return response()->json([
                'error' => 'Maximum streak freezes purchased',
                'message' => 'You can only purchase up to 3 streak freezes.',
            ], 400);
        }

        $cost = $this->xpService->getNextFreezeCost($user);
        $userXp = $this->xpService->getOrCreate($user);

        if (!$userXp->canAffordFreeze($cost)) {
            return response()->json([
                'error' => 'Insufficient XP',
                'balance' => $userXp->xp_balance,
                'required' => $cost,
            ], 400);
        }

        if ($this->xpService->buyStreakFreeze($user)) {
            $this->streakService->awardFreeze($user, 1);

            Telemetry::record($request, 'xp_shop_purchase_completed', [
                'item' => 'streak_freeze',
                'cost' => $cost,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Streak freeze purchased!',
                'xp' => $this->xpService->getSummary($user),
                'streak' => $this->streakService->getSummary($user),
                'dark_mode_unlocked' => $this->xpService->hasDarkModeUnlocked($user),
            ]);
        }

        return response()->json(['error' => 'Failed to purchase streak freeze'], 500);
    }

    public function buyDarkMode(Request $request)
    {
        $user = $request->user();

        if ($this->xpService->hasDarkModeUnlocked($user)) {
            return response()->json([
                'error' => 'Already unlocked',
                'message' => 'Dark Mode is already unlocked.',
            ], 400);
        }

        $userXp = $this->xpService->getOrCreate($user);

        if ($userXp->xp_balance < XpService::DARK_MODE_COST) {
            return response()->json([
                'error' => 'Insufficient XP',
                'balance' => $userXp->xp_balance,
                'required' => XpService::DARK_MODE_COST,
            ], 400);
        }

        if ($this->xpService->buyDarkMode($user)) {
            Telemetry::record($request, 'xp_shop_purchase_completed', [
                'item' => 'dark_mode',
                'cost' => XpService::DARK_MODE_COST,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dark Mode unlocked!',
                'xp' => $this->xpService->getSummary($user),
                'streak' => $this->streakService->getSummary($user),
                'dark_mode_unlocked' => true,
            ]);
        }

        return response()->json(['error' => 'Failed to unlock Dark Mode'], 500);
    }

    public function storeOrder(Request $request)
    {
        $data = $request->validate([
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:word_list_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
            'profession' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'referral_discount_credit_id' => ['nullable', 'integer'],
        ]);

        $user = $request->user();
        $categoryIds = collect($data['category_ids'])->unique()->values();
        $categories = WordListCategory::whereIn('id', $categoryIds)->get();

        $unlocked = $categories->where('is_locked', false)->pluck('name');
        if ($unlocked->isNotEmpty()) {
            throw ValidationException::withMessages([
                'category_ids' => "These categories are not locked: {$unlocked->join(', ')}",
            ]);
        }

        $alreadyAccess = UserWordListAccess::where('user_id', $user->id)
            ->whereIn('word_list_category_id', $categoryIds)
            ->pluck('word_list_category_id');

        if ($alreadyAccess->isNotEmpty()) {
            $names = $categories->whereIn('id', $alreadyAccess)->pluck('name');
            throw ValidationException::withMessages([
                'category_ids' => "You already have access to: {$names->join(', ')}",
            ]);
        }

        $pendingCategoryIds = WordListOrderItem::whereIn('word_list_category_id', $categoryIds)
            ->whereHas('order', fn($query) => $query->where('user_id', $user->id)->where('status', 'pending'))
            ->pluck('word_list_category_id');

        if ($pendingCategoryIds->isNotEmpty()) {
            $names = $categories->whereIn('id', $pendingCategoryIds)->pluck('name');
            throw ValidationException::withMessages([
                'category_ids' => "You already have a pending order for: {$names->join(', ')}",
            ]);
        }

        $order = DB::transaction(function () use ($user, $data, $categoryIds, $categories) {
            $amounts = $this->referralService->calculateOrderAmounts(
                $user,
                $categories,
                $categoryIds,
                isset($data['referral_discount_credit_id']) ? (int) $data['referral_discount_credit_id'] : null
            );

            $order = WordListOrder::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'phone_number' => $data['phone_number'],
                'address' => $data['address'],
                'profession' => $data['profession'] ?? null,
                'payment_method' => 'bkash',
                'subtotal_amount' => $amounts['subtotal_amount'],
                'discount_percent' => $amounts['discount_percent'],
                'discount_amount' => $amounts['discount_amount'],
                'payable_amount' => $amounts['payable_amount'],
                'referral_discount_credit_id' => $amounts['credit']?->id,
                'transaction_id' => $data['transaction_id'],
                'note' => $data['note'] ?? null,
                'status' => 'pending',
            ]);

            WordListOrderItem::insert($categoryIds->map(fn($id) => [
                'word_list_order_id' => $order->id,
                'word_list_category_id' => $id,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all());

            $this->referralService->markCreditUsed($amounts['credit'], $order);

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

        return response()->json([
            'status' => 'success',
            'message' => 'Order submitted! We will review and grant access soon.',
            'order_id' => $order->id,
            'subtotal_amount' => $order->subtotal_amount,
            'discount_percent' => $order->discount_percent,
            'discount_amount' => $order->discount_amount,
            'payable_amount' => $order->payable_amount,
        ], 201);
    }
}
