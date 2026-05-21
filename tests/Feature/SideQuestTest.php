<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserXp;
use App\Models\WordListCategory;
use App\Models\WordList;
use App\Models\Word;
use App\Models\UserSideQuestUnlock;
use App\Models\WordProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SideQuestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_guest_cannot_access_any_side_quest_routes()
    {
        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
        ]);

        $this->post("/side-quests/{$category->id}/unlock")
            ->assertRedirect('/login');

        $this->get("/side-quests/{$category->id}/start")
            ->assertRedirect('/login');

        $this->post("/side-quests/{$category->id}/complete", ['score' => 20, 'lives_remaining' => 3])
            ->assertRedirect('/login');
    }

    public function test_cannot_access_side_quest_routes_if_disabled()
    {
        $user = User::factory()->create();
        UserXp::create(['user_id' => $user->id, 'xp_balance' => 200]);

        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => false,
            'side_quest_xp_cost' => 150,
        ]);

        $this->actingAs($user)
            ->post("/side-quests/{$category->id}/unlock")
            ->assertStatus(404);

        $this->actingAs($user)
            ->get("/side-quests/{$category->id}/start")
            ->assertStatus(404);

        $this->actingAs($user)
            ->postJson("/side-quests/{$category->id}/complete", ['score' => 20, 'lives_remaining' => 3])
            ->assertStatus(404);
    }

    public function test_user_cannot_unlock_without_sufficient_xp()
    {
        $user = User::factory()->create();
        UserXp::create(['user_id' => $user->id, 'xp_balance' => 50]);

        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
            'side_quest_xp_cost' => 150,
        ]);

        $this->actingAs($user)
            ->post("/side-quests/{$category->id}/unlock")
            ->assertRedirect()
            ->assertSessionHas('error', 'Insufficient XP balance to unlock this Side Quest.');

        $this->assertDatabaseMissing('user_side_quest_unlocks', [
            'user_id' => $user->id,
            'word_list_category_id' => $category->id,
        ]);
    }

    public function test_user_can_unlock_with_sufficient_xp()
    {
        $user = User::factory()->create();
        UserXp::create(['user_id' => $user->id, 'xp_balance' => 200]);

        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
            'side_quest_xp_cost' => 150,
        ]);

        $this->actingAs($user)
            ->post("/side-quests/{$category->id}/unlock")
            ->assertRedirect()
            ->assertSessionHas('success', 'Side Quest unlocked successfully!');

        $this->assertDatabaseHas('user_side_quest_unlocks', [
            'user_id' => $user->id,
            'word_list_category_id' => $category->id,
        ]);

        $this->assertEquals(50, $user->xp->fresh()->xp_balance);
    }

    public function test_cannot_start_unlocked_quest()
    {
        $user = User::factory()->create();
        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
        ]);

        $this->actingAs($user)
            ->get("/side-quests/{$category->id}/start")
            ->assertStatus(403);
    }

    public function test_can_start_unlocked_quest()
    {
        $user = User::factory()->create();
        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
        ]);
        
        // Unlock first
        UserSideQuestUnlock::create([
            'user_id' => $user->id,
            'word_list_category_id' => $category->id,
            'best_score' => 0,
            'best_lives_remaining' => 0,
            'attempts_count' => 0,
        ]);

        // Create some words under this category
        $wordlist = WordList::create([
            'word_list_category_id' => $category->id,
            'title' => 'Wordlist 1',
            'difficulty' => 'beginner',
        ]);

        // Need at least 10 words with synonyms
        for ($i = 1; $i <= 10; $i++) {
            Word::create([
                'wordlist_id' => $wordlist->id,
                'word' => "Word {$i}",
                'definition' => "Definition {$i}",
                'bangla_translation' => "Translation {$i}",
                'example_sentences' => "Example {$i}",
                'synonym' => "Synonym {$i}",
            ]);
        }

        $response = $this->actingAs($user)
            ->get("/side-quests/{$category->id}/start");

        $response->assertStatus(200);
    }

    public function test_can_complete_quest()
    {
        $user = User::factory()->create();
        UserXp::create(['user_id' => $user->id, 'xp_balance' => 0]);

        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
        ]);
        
        $unlock = UserSideQuestUnlock::create([
            'user_id' => $user->id,
            'word_list_category_id' => $category->id,
            'best_score' => 5,
            'best_lives_remaining' => 1,
            'attempts_count' => 1,
        ]);

        $response = $this->actingAs($user)
            ->postJson("/side-quests/{$category->id}/complete", [
                'score' => 15,
                'lives_remaining' => 2,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'score',
                'lives_remaining',
                'best_score',
                'best_lives_remaining',
                'xp_awarded',
                'xp_balance',
            ]);

        $unlock->refresh();
        $this->assertEquals(1, $unlock->attempts_count); // Complete doesn't increment attempts; Start increments it.
        $this->assertEquals(15, $unlock->best_score);
        $this->assertEquals(2, $unlock->best_lives_remaining);
    }

    public function test_can_complete_quest_with_time_taken()
    {
        $user = User::factory()->create();
        UserXp::create(['user_id' => $user->id, 'xp_balance' => 0]);

        $category = WordListCategory::create([
            'name' => 'General English',
            'description' => 'Test Description',
            'status' => true,
            'enable_side_quest' => true,
        ]);
        
        $unlock = UserSideQuestUnlock::create([
            'user_id' => $user->id,
            'word_list_category_id' => $category->id,
            'best_score' => 5,
            'best_lives_remaining' => 1,
            'best_time_taken' => 90,
            'attempts_count' => 1,
        ]);

        $response = $this->actingAs($user)
            ->postJson("/side-quests/{$category->id}/complete", [
                'score' => 15,
                'lives_remaining' => 2,
                'time_taken' => 45,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'success' => true,
                'score' => 15,
                'lives_remaining' => 2,
                'best_time_taken' => 45,
            ]);

        $unlock->refresh();
        $this->assertEquals(45, $unlock->best_time_taken);
    }
}
