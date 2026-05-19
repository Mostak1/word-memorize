<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30);
            $table->string('placement', 80)->default('session_complete');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('url', 1000)->nullable();
            $table->string('cta_label')->nullable();
            $table->integer('priority')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['placement', 'type', 'is_active']);
            $table->index(['placement', 'priority']);
        });

        if (Schema::hasTable('products')) {
            Schema::table('promotions', function (Blueprint $table) {
                $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            });
        }

        $now = now();

        DB::table('promotions')->insert([
            [
                'type' => 'service',
                'placement' => 'session_complete',
                'title' => 'IELTS Reading Practice',
                'description' => 'Build speed and accuracy with guided reading practice.',
                'url' => 'https://fluento.org/services/reading-practice',
                'cta_label' => 'Start Reading',
                'priority' => 20,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'service',
                'placement' => 'session_complete',
                'title' => 'IELTS Writing Practice',
                'description' => 'Practice Task 1 and Task 2 with clearer feedback loops.',
                'url' => 'https://fluento.org/services/writing-practice',
                'cta_label' => 'Practice Writing',
                'priority' => 20,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'service',
                'placement' => 'session_complete',
                'title' => 'Free IELTS Assessment',
                'description' => 'Check your current level before choosing a study path.',
                'url' => 'https://fluento.org/free-assessment',
                'cta_label' => 'Take Assessment',
                'priority' => 20,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'course',
                'placement' => 'session_complete',
                'title' => 'Start Your IELTS Journey',
                'description' => 'Join a structured course plan for IELTS preparation.',
                'url' => 'https://fluento.org/en/start-ielts-journey',
                'cta_label' => 'Join Course',
                'priority' => 30,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'course',
                'placement' => 'session_complete',
                'title' => 'Basic IELTS Course',
                'description' => 'Strengthen the foundation before moving to advanced prep.',
                'url' => 'https://fluento.org/en/basic-ielts',
                'cta_label' => 'Explore Course',
                'priority' => 30,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        if (Schema::hasTable('products') && Schema::hasColumn('products', 'is_ad')) {
            $productPromotions = DB::table('products')
                ->where('is_ad', true)
                ->pluck('id')
                ->map(fn ($productId) => [
                    'type' => 'product',
                    'placement' => 'session_complete',
                    'product_id' => $productId,
                    'priority' => 10,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
                ->all();

            if (!empty($productPromotions)) {
                DB::table('promotions')->insert($productPromotions);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
