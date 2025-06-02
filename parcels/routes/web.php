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
    Route::resource('parcels', ParcelController::class);
});


// Public parcel tracking API endpoint
Route::get('/track-parcel/{tracking_number}', [App\Http\Controllers\ParcelController::class, 'trackPublic'])->name('parcels.trackPublic');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
