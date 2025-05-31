<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\User; // Add User model import
use Illuminate\Http\Request;
use Illuminate\Support\Str; // For Str::random()
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ParcelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $parcels = Parcel::with(['courier', 'customer'])->latest()->paginate(10);
        return Inertia::render('parcels/index', [
            'parcels' => $parcels,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $statuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'cancelled', 'returned'];
        $couriers = User::where('role', 'courier')->select('id', 'name')->get(); // Assuming 'courier' is the role identifier
        
        return Inertia::render('parcels/create', [
            'statuses' => $statuses,
            'couriers' => $couriers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        // Tracking number will be generated automatically, so it's removed from direct validation here.
        // The unique constraint will still be on the database table.
        $validated = $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_address' => 'required|string',
            'recipient_name' => 'required|string|max:255',
            'recipient_address' => 'required|string',
            'recipient_phone' => 'nullable|string|max:50',
            'status' => ['required', 'string', Rule::in(['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'cancelled', 'returned'])],
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id', // Courier ID
            'customer_id' => 'required|exists:users,id', // Assuming customer is also a user for now
        ]);

        // Generate unique tracking number
        do {
            // Example: PCL-20231027-ABCDE (Prefix-Date-Random)
            // Simpler version: PCL + timestamp + 5 random chars
            $trackingNumber = 'PCL' . time() . Str::upper(Str::random(5));
        } while (Parcel::where('tracking_number', $trackingNumber)->exists());

        $validated['tracking_number'] = $trackingNumber;

        Parcel::create($validated);

        return redirect()->route('parcels.index')->with('success', 'Parcel created successfully. Tracking: ' . $trackingNumber);
    }

    /**
     * Display the specified resource.
     */
    public function show(Parcel $parcel)
    {
        $parcel->load(['courier', 'customer']);
        return Inertia::render('parcels/show', [
            'parcel' => $parcel,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Parcel $parcel)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Parcel $parcel)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Parcel $parcel)
    {
        //
    }
}
