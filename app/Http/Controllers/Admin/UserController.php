<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::latest();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('approve_status')) {
            $query->where('approve_status', $request->approve_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only('role', 'approve_status', 'search'),
            'roles' => ['student', 'instructor', 'admin'],
            'approveStatuses' => ['pending', 'approved', 'rejected'],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => ['student', 'instructor', 'admin'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:student,instructor,admin'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => ['student', 'instructor', 'admin'],
            'approveStatuses' => ['pending', 'approved', 'rejected'],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:student,instructor,admin'],
            'approve_status' => ['sometimes', 'in:pending,approved,rejected'],
            'wallet' => ['sometimes', 'numeric', 'min:0'],
        ]);

        // Prevent demoting the last admin
        if ($user->isAdmin() && $validated['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'role' => 'Cannot demote the last administrator.',
                ]);
            }
        }

        $user->update($validated);

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Quickly promote/demote a user's role via a single action button.
     * Replaces the old toggleAdmin — now cycles: student → instructor → admin → student
     * but guards against removing the last admin.
     */
    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', 'in:student,instructor,admin'],
        ]);

        if ($user->isAdmin() && $validated['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'role' => 'Cannot demote the last administrator.',
                ]);
            }
        }

        $user->update(['role' => $validated['role']]);

        return back()->with('success', "User role updated to {$validated['role']}.");
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password reset successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent deleting the last admin
        if ($user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['user' => 'Cannot delete the last administrator.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}