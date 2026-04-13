<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FollowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_follow_another_user()
    {
        $user1 = User::factory()->create(['approve_status' => 'approved']);
        $user2 = User::factory()->create(['approve_status' => 'approved']);

        Sanctum::actingAs($user1);

        $response = $this->postJson("/api/follow/{$user2->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Successfully followed user']);

        $this->assertTrue($user1->following()->where('following_id', $user2->id)->exists());
        $this->assertEquals(1, $user2->followerCount());
    }

    public function test_user_cannot_follow_self()
    {
        $user = User::factory()->create(['approve_status' => 'approved']);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/follow/{$user->id}");

        $response->assertStatus(400)
            ->assertJson(['message' => 'Cannot follow yourself']);
    }

    public function test_user_can_unfollow()
    {
        $user1 = User::factory()->create(['approve_status' => 'approved']);
        $user2 = User::factory()->create(['approve_status' => 'approved']);

        $user1->following()->attach($user2->id);

        Sanctum::actingAs($user1);

        $response = $this->deleteJson("/api/follow/{$user2->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Successfully unfollowed user']);

        $this->assertFalse($user1->following()->where('following_id', $user2->id)->exists());
    }

    public function test_get_followers()
    {
        $user1 = User::factory()->create(['approve_status' => 'approved']);
        $user2 = User::factory()->create(['approve_status' => 'approved']);

        $user1->following()->attach($user2->id);

        $response = $this->getJson("/api/follow/{$user2->id}/followers");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email']
                ]
            ]);
    }

    public function test_get_following()
    {
        $user1 = User::factory()->create(['approve_status' => 'approved']);
        $user2 = User::factory()->create(['approve_status' => 'approved']);

        $user1->following()->attach($user2->id);

        Sanctum::actingAs($user1);

        $response = $this->getJson("/api/follow/{$user1->id}/following");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email']
                ]
            ]);
    }
}
