<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\UserManagementController; // Added for user management
use App\Models\User; // Added for role constants
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // User Management Routes (Admin Only)
    Route::middleware('role:' . User::ROLE_ADMIN)->group(function () {
        Route::get('settings/users', [UserManagementController::class, 'index'])
            ->name('settings.users.index');
        Route::get('settings/users/create', [UserManagementController::class, 'create'])
            ->name('settings.users.create');
        Route::post('settings/users', [UserManagementController::class, 'store'])
            ->name('settings.users.store');
        Route::put('settings/users/{user}/role', [UserManagementController::class, 'updateRole'])
            ->name('settings.users.update-role');
        Route::put('settings/users/{user}', [UserManagementController::class, 'update'])
            ->name('settings.users.update');
        Route::delete('settings/users/{user}', [UserManagementController::class, 'destroy'])
            ->name('settings.users.destroy');
    });
});
