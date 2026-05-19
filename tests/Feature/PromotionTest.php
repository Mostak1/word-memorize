<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->product = Product::create([
            'name' => 'Fluento Test Product',
            'selling_price' => 500,
            'local_image_url' => 'images/product.png',
        ]);
    }

    public function test_can_create_database_linked_product_promotion(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.promotions.store'), [
            'type' => 'product',
            'placement' => 'session_complete',
            'product_id' => $this->product->id,
            'title' => 'This should be ignored',
            'description' => 'This should be ignored',
            'url' => 'https://ignored.com',
            'cta_label' => 'Ignored',
            'priority' => 10,
            'is_active' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $promotion = Promotion::first();
        $this->assertNotNull($promotion);
        $this->assertEquals('product', $promotion->type);
        $this->assertEquals($this->product->id, $promotion->product_id);
        $this->assertNull($promotion->title); // custom title was cleared
        $this->assertNull($promotion->description); // custom description was cleared
        $this->assertNull($promotion->url);

        // Verify toRecommendationPayload uses the product details and ad_image_url
        $payload = $promotion->toRecommendationPayload();
        $this->assertEquals($this->product->name, $payload['title']);
        $this->assertEquals('https://fluento.org/images/product.png', $payload['ad_image_url']);
    }

    public function test_database_linked_product_promotion_respects_thumbnail_override(): void
    {
        $promotion = Promotion::create([
            'type' => 'product',
            'placement' => 'session_complete',
            'product_id' => $this->product->id,
            'thumbnail' => 'https://custom-image.com/thumbnail.jpg',
            'priority' => 10,
            'is_active' => true,
        ]);

        $payload = $promotion->toRecommendationPayload();
        $this->assertEquals('https://custom-image.com/thumbnail.jpg', $payload['ad_image_url']);
    }

    public function test_can_create_url_based_product_promotion(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.promotions.store'), [
            'type' => 'product',
            'placement' => 'session_complete',
            'product_id' => null,
            'title' => 'Custom Product URL Promotion',
            'description' => 'Custom product description',
            'url' => 'https://example.com/custom-prod',
            'cta_label' => 'Buy Now',
            'thumbnail' => 'https://custom-image.com/thumbnail.jpg',
            'priority' => 10,
            'is_active' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $promotion = Promotion::first();
        $this->assertNotNull($promotion);
        $this->assertEquals('product', $promotion->type);
        $this->assertNull($promotion->product_id);
        $this->assertEquals('Custom Product URL Promotion', $promotion->title);
        $this->assertEquals('Custom product description', $promotion->description);
        $this->assertEquals('https://example.com/custom-prod', $promotion->url);
        $this->assertEquals('https://custom-image.com/thumbnail.jpg', $promotion->thumbnail);

        $payload = $promotion->toRecommendationPayload();
        $this->assertEquals('Custom Product URL Promotion', $payload['title']);
        $this->assertEquals('https://custom-image.com/thumbnail.jpg', $payload['ad_image_url']);
        $this->assertEquals(0, $payload['selling_price']);
    }

    public function test_service_promotion_includes_ad_image_url_if_thumbnail_exists(): void
    {
        $promotion = Promotion::create([
            'type' => 'service',
            'placement' => 'session_complete',
            'title' => 'Service Promotion',
            'description' => 'Service description',
            'url' => 'https://example.com/service',
            'cta_label' => 'Register',
            'thumbnail' => 'https://custom-image.com/service.jpg',
            'priority' => 10,
            'is_active' => true,
        ]);

        $payload = $promotion->toRecommendationPayload();
        $this->assertEquals('https://custom-image.com/service.jpg', $payload['ad_image_url']);
    }
}
