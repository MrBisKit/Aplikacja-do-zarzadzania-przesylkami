<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ParcelController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('parcels/{parcel}/label', [ParcelController::class, 'generateLabel'])->name('parcels.label');
    Route::put('parcels/{parcel}/status', [ParcelController::class, 'updateStatus'])->name('parcels.updateStatus');
    Route::put('parcels/{parcel}/assign-courier', [ParcelController::class, 'assignCourier'])->name('parcels.assignCourier');
    Route::resource('parcels', ParcelController::class);
    
    // Customer management routes
    Route::resource('customers', App\Http\Controllers\CustomerController::class);
});


// Public parcel tracking API endpoint
Route::get('/track-parcel/{tracking_number}', [App\Http\Controllers\ParcelController::class, 'trackPublic'])->name('parcels.trackPublic');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
