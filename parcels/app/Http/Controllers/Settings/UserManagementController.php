<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/users/index', [
            'users' => User::all()
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_COURIER, User::ROLE_WAREHOUSE])]
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role
        ]);

        return Redirect::back()->with('success', 'User updated successfully');
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_COURIER, User::ROLE_WAREHOUSE])]
        ]);

        $user->update([
            'role' => $request->role
        ]);

        return Redirect::back()->with('success', 'User role updated successfully');
    }
    
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return Redirect::back()->with('error', 'You cannot delete your own account');
        }
        
        $userName = $user->name;
        $user->delete();
        
        return Redirect::route('settings.users.index')->with('success', "User '{$userName}' has been deleted successfully");
    }
    
    public function create()
    {
        return Inertia::render('settings/users/create');
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_COURIER, User::ROLE_WAREHOUSE])],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return Redirect::route('settings.users.index')->with('success', 'User created successfully');
    }
}
