<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Promotion;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PromotionController extends Controller
{
    use HandlesImageUploads;
    public function index()
    {
        $promotions = Promotion::with('product')
            ->orderBy('placement')
            ->orderBy('priority')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Promotion $promotion) => $this->promotionPayload($promotion));

        $products = Product::query()
            ->select([
                'id',
                'name',
                'selling_price',
                'image_url',
                'local_image_url',
                'local_image_gallery',
            ])
            ->orderBy('name')
            ->limit(500)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'selling_price' => $product->selling_price,
                'ad_image_url' => $product->ad_image_url,
            ]);

        return Inertia::render('Admin/Promotions/Index', [
            'promotions' => $promotions,
            'products' => $products,
            'types' => Promotion::TYPES,
            'placements' => Promotion::PLACEMENTS,
        ]);
    }

    public function store(Request $request)
    {
        Promotion::create($this->validatedData($request));

        return back()->with('success', 'Promotion created successfully.');
    }

    public function update(Request $request, Promotion $promotion)
    {
        $promotion->update($this->validatedData($request, $promotion));

        return back()->with('success', 'Promotion updated successfully.');
    }

    public function destroy(Promotion $promotion)
    {
        if ($promotion->thumbnail && !str_starts_with($promotion->thumbnail, 'http')) {
            Storage::disk('public')->delete(ltrim($promotion->thumbnail, '/'));
        }

        $promotion->delete();

        return back()->with('success', 'Promotion deleted successfully.');
    }

    private function validatedData(Request $request, ?Promotion $promotion = null): array
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(Promotion::TYPES)],
            'placement' => ['required', Rule::in(Promotion::PLACEMENTS)],
            'product_id' => [
                'nullable',
                'integer',
                'exists:products,id',
            ],
            'title' => [
                'nullable',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'url' => [
                'nullable',
                'url',
                'max:1000',
            ],
            'cta_label' => [
                'nullable',
                'string',
                'max:255',
            ],
            'thumbnail' => [
                'nullable',
            ],
            'priority' => ['required', 'integer', 'min:0', 'max:999999'],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $request->validate([
                'thumbnail' => ['image', 'max:2048'],
            ]);

            // Delete old file if updating
            if ($promotion && $promotion->thumbnail && !str_starts_with($promotion->thumbnail, 'http')) {
                Storage::disk('public')->delete(ltrim($promotion->thumbnail, '/'));
            }

            $path = $this->processAndStoreImage($request->file('thumbnail'), 'promotions');
            $data['thumbnail'] = '/' . $path;
        } else {
            $request->validate([
                'thumbnail' => ['nullable', 'string', 'max:1000'],
            ]);

            // Revert to original relative database path if unmodified to avoid writing full absolute URL
            if ($promotion && $data['thumbnail'] === $promotion->thumbnail_url) {
                $data['thumbnail'] = $promotion->thumbnail;
            }

            // Delete old file if cleared
            if (empty($data['thumbnail']) && $promotion && $promotion->thumbnail && !str_starts_with($promotion->thumbnail, 'http')) {
                Storage::disk('public')->delete(ltrim($promotion->thumbnail, '/'));
            }
        }

        if ($data['type'] === Promotion::TYPE_PRODUCT) {
            if ($data['product_id']) {
                $data['title'] = null;
                $data['description'] = null;
                $data['url'] = null;
                $data['cta_label'] = null;
            } else {
                $request->validate([
                    'title' => ['required', 'string', 'max:255'],
                    'description' => ['required', 'string', 'max:1000'],
                    'url' => ['required', 'url', 'max:1000'],
                    'cta_label' => ['required', 'string', 'max:255'],
                ]);
            }
        } else {
            $data['product_id'] = null;
            $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['required', 'string', 'max:1000'],
                'url' => ['required', 'url', 'max:1000'],
                'cta_label' => ['required', 'string', 'max:255'],
            ]);
        }

        return $data;
    }

    private function promotionPayload(Promotion $promotion): array
    {
        return [
            'id' => $promotion->id,
            'type' => $promotion->type,
            'placement' => $promotion->placement,
            'product_id' => $promotion->product_id,
            'title' => $promotion->title,
            'description' => $promotion->description,
            'url' => $promotion->url,
            'cta_label' => $promotion->cta_label,
            'thumbnail' => $promotion->thumbnail_url,
            'priority' => $promotion->priority,
            'is_active' => $promotion->is_active,
            'product' => $promotion->product ? [
                'id' => $promotion->product->id,
                'name' => $promotion->product->name,
                'selling_price' => $promotion->product->selling_price,
                'ad_image_url' => $promotion->product->ad_image_url,
            ] : null,
        ];
    }
}
