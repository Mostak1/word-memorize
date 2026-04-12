<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\StreakFreezePurchase;
use App\Services\XpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class XpServiceTest extends TestCase
{
  use RefreshDatabase;

  private XpService $xpService;

  protected function setUp(): void
  {
    parent::setUp();
    $this->xpService = app(XpService::class);
  }

  public function test_get_next_freeze_cost_first_purchase()
  {
    $user = User::factory()->create();

    $cost = $this->xpService->getNextFreezeCost($user);

    $this->assertEquals(1000, $cost);
  }

  public function test_get_next_freeze_cost_second_purchase()
  {
    $user = User::factory()->create();
    StreakFreezePurchase::create(['user_id' => $user->id, 'xp_cost' => 1000]);

    $cost = $this->xpService->getNextFreezeCost($user);

    $this->assertEquals(2000, $cost);
  }

  public function test_get_next_freeze_cost_third_purchase()
  {
    $user = User::factory()->create();
    StreakFreezePurchase::create(['user_id' => $user->id, 'xp_cost' => 1000]);
    StreakFreezePurchase::create(['user_id' => $user->id, 'xp_cost' => 2000]);

    $cost = $this->xpService->getNextFreezeCost($user);

    $this->assertEquals(4000, $cost);
  }

  public function test_get_next_freeze_cost_beyond_limit()
  {
    $user = User::factory()->create();
    StreakFreezePurchase::factory()->count(3)->create(['user_id' => $user->id]);

    $cost = $this->xpService->getNextFreezeCost($user);

    $this->assertEquals(PHP_INT_MAX, $cost);
  }

  public function test_buy_streak_freeze_success_first_purchase()
  {
    $user = User::factory()->create();
    $this->xpService->getOrCreate($user)->addXp(2000); // Give enough XP

    $result = $this->xpService->buyStreakFreeze($user);

    $this->assertTrue($result);
    $this->assertEquals(1, StreakFreezePurchase::where('user_id', $user->id)->count());
    $this->assertEquals(1000, $this->xpService->getBalance($user));
  }

  public function test_buy_streak_freeze_fails_at_limit()
  {
    $user = User::factory()->create();
    StreakFreezePurchase::factory()->count(3)->create(['user_id' => $user->id]);
    $this->xpService->getOrCreate($user)->addXp(10000); // Plenty of XP

    $result = $this->xpService->buyStreakFreeze($user);

    $this->assertFalse($result);
    $this->assertEquals(3, StreakFreezePurchase::where('user_id', $user->id)->count());
  }

  public function test_buy_streak_freeze_fails_insufficient_xp()
  {
    $user = User::factory()->create();
    // No XP added

    $result = $this->xpService->buyStreakFreeze($user);

    $this->assertFalse($result);
    $this->assertEquals(0, StreakFreezePurchase::where('user_id', $user->id)->count());
  }
}