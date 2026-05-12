<?php

namespace Tests\Feature;

use App\Models\BookmarkedWord;
use App\Models\User;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MobileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_user_can_register_login_fetch_profile_and_logout(): void
    {
        $this->postJson('/api/mobile/register', [
            'name' => 'Mobile Student',
            'email' => 'mobile@example.com',
            'phone_number' => '01700000000',
            'password' => 'password',
            'device_name' => 'android-test',
        ])
            ->assertCreated()
            ->assertJsonStructure(['token', 'token_type', 'user' => ['id', 'name', 'email']]);

        $login = $this->postJson('/api/mobile/login', [
            'email' => 'mobile@example.com',
            'password' => 'password',
            'device_name' => 'android-test',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'mobile@example.com');

        $token = $login->json('token');

        $this->withToken($token)
            ->getJson('/api/mobile/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'mobile@example.com');

        $this->withToken($token)
            ->postJson('/api/mobile/logout')
            ->assertOk()
            ->assertJsonPath('status', 'ok');
    }

    public function test_mobile_dashboard_and_settings_are_available_to_token_users(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['mobile']);

        $this->getJson('/api/mobile/dashboard')
            ->assertOk()
            ->assertJsonStructure(['mastered_count', 'review_count', 'streak', 'xp', 'srs', 'revise_counts']);

        $this->patchJson('/api/mobile/settings', [
            'show_bangla' => false,
            'sound_effects' => false,
            'ui_language' => 'bn',
        ])
            ->assertOk()
            ->assertJsonPath('settings.show_bangla', false)
            ->assertJsonPath('settings.sound_effects', false)
            ->assertJsonPath('settings.ui_language', 'bn');
    }

    public function test_mobile_can_read_categories_wordlists_and_start_a_session(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['mobile']);
        [$category, $wordList] = $this->createWordListWithWords($user, 10);

        $this->getJson('/api/mobile/categories')
            ->assertOk()
            ->assertJsonPath('categories.0.id', $category->id);

        $this->getJson("/api/mobile/categories/{$category->id}/wordlists")
            ->assertOk()
            ->assertJsonPath('category.id', $category->id)
            ->assertJsonPath('wordlists.data.0.id', $wordList->id);

        $this->getJson("/api/mobile/sessions/wordlists/{$wordList->id}/start")
            ->assertOk()
            ->assertJsonPath('wordlist.id', $wordList->id)
            ->assertJsonCount(10, 'words');
    }

    public function test_mobile_guests_can_browse_public_learning_content(): void
    {
        $admin = User::factory()->create(['email' => 'admin@gmail.com']);
        [$category, $wordList] = $this->createWordListWithWords($admin, 10);
        $word = $wordList->words()->first();

        $this->getJson('/api/mobile/categories')
            ->assertOk()
            ->assertJsonPath('categories.0.id', $category->id);

        $this->getJson("/api/mobile/categories/{$category->id}/wordlists")
            ->assertOk()
            ->assertJsonPath('wordlists.data.0.id', $wordList->id);

        $this->getJson("/api/mobile/wordlists/{$wordList->id}")
            ->assertOk()
            ->assertJsonPath('wordlist.id', $wordList->id);

        $this->getJson("/api/mobile/words/{$word->id}")
            ->assertOk()
            ->assertJsonPath('word.id', $word->id)
            ->assertJsonPath('word.is_bookmarked', false);

        $this->getJson("/api/mobile/sessions/wordlists/{$wordList->id}/start")
            ->assertUnauthorized();
    }

    public function test_mobile_can_toggle_bookmarks_complete_sessions_and_finish_quizzes(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['mobile']);
        [, $wordList] = $this->createWordListWithWords($user, 10);
        $word = $wordList->words()->first();

        $this->postJson("/api/mobile/bookmarks/{$word->id}")
            ->assertOk()
            ->assertJsonPath('is_bookmarked', true);

        $this->assertTrue(BookmarkedWord::where('user_id', $user->id)->where('word_id', $word->id)->exists());

        $this->postJson('/api/mobile/sessions/complete', [
            'wordlist_id' => $wordList->id,
            'results' => [
                ['word_id' => $word->id, 'action' => 'know'],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonStructure(['xp_awarded', 'streak', 'list_completed']);

        $this->postJson('/api/mobile/quiz/finish', [
            'wordlist_id' => $wordList->id,
            'correct_count' => 8,
            'total_questions' => 10,
            'word_ids' => [$word->id],
        ])
            ->assertOk()
            ->assertJsonPath('passed', true)
            ->assertJsonPath('score', 80);
    }

    private function createWordListWithWords(User $user, int $count): array
    {
        $category = WordListCategory::create([
            'name' => 'Mobile Category',
            'description' => 'API test category',
            'status' => true,
            'created_by' => $user->id,
            'is_locked' => false,
            'show_example_sentences' => true,
        ]);

        $wordList = WordList::create([
            'word_list_category_id' => $category->id,
            'title' => 'Mobile Wordlist',
            'difficulty' => 'Beginner',
            'status' => true,
            'is_locked' => false,
            'created_by' => $user->id,
            'is_public' => false,
        ]);

        for ($i = 1; $i <= $count; $i++) {
            Word::create([
                'wordlist_id' => $wordList->id,
                'word' => "word{$i}",
                'parts_of_speech_variations' => 'noun',
                'definition' => "Definition {$i}",
                'bangla_meaning' => "Bangla {$i}",
                'example_sentences' => "This is word{$i} in a sentence.",
                'synonym' => "term{$i}",
                'antonym' => "opposite{$i}",
                'created_by' => $user->id,
                'is_public' => false,
            ]);
        }

        return [$category, $wordList->fresh()];
    }
}
