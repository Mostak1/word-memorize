<?php

namespace Database\Factories;

use App\Models\StreakFreezePurchase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StreakFreezePurchase>
 */
class StreakFreezePurchaseFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'user_id' => User::factory(),
      'xp_cost' => $this->faker->numberBetween(1000, 4000),
      'purchased_at' => now(),
    ];
  }
}