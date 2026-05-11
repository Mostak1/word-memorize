<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\WordListCategory;
use App\Http\Controllers\Controller;
use App\Models\UserWordListAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserWordListAccessController extends Controller
{
    public function index(Request $request)
    {
        $query = UserWordListAccess::with(['user', 'category', 'order']);

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            })->orWhereHas('category', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })->orWhere('course_title', 'like', '%' . $request->search . '%');
        }

        $accessList = $query->latest('granted_at')->paginate(20)->withQueryString();

        return Inertia::render('Admin/UserWordListAccess/Index', [
            'accessList' => $accessList,
            'users' => User::select('id', 'name', 'email')->get(),
            'categories' => WordListCategory::where('created_by', 3)->select('id', 'name')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'word_list_category_id' => 'required|exists:word_list_categories,id',
            // 'course_title' => 'nullable|string|max:255',
        ]);

        // Check if access already exists
        $exists = UserWordListAccess::where('user_id', $validated['user_id'])
            ->where('word_list_category_id', $validated['word_list_category_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['user_id' => 'This user already has access to this category.']);
        }

        UserWordListAccess::create([
            'user_id' => $validated['user_id'],
            'word_list_category_id' => $validated['word_list_category_id'],
            // 'course_title' => $validated['course_title'],
            'granted_at' => now(),
        ]);

        return back()->with('success', 'Access granted successfully.');
    }

    public function destroy(UserWordListAccess $access)
    {
        $access->delete();

        return back()->with('success', 'Access revoked successfully.');
    }
}
