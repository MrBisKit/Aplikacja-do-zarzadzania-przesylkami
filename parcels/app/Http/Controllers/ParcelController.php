<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\User;
use App\Models\Customer;
use Barryvdh\DomPDF\Facade\Pdf;
use Milon\Barcode\Facades\DNS1DFacade;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // For Str::random()
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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
        $customers = Customer::select('id', 'name', 'address', 'phone_number')->get();
        
        return Inertia::render('parcels/create', [
            'statuses' => $statuses,
            'couriers' => $couriers,
            'customers' => $customers,
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
            'customer_id' => 'nullable|exists:customers,id' // Customer ID
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
        $parcel->load(['courier', 'customer', 'history' => function($query) {
            $query->with('user')->latest()->take(10);
        }]);
        
        $statuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'cancelled', 'returned'];
        
        // Get available couriers (users with courier role)
        $availableCouriers = User::where('role', 'courier')->get(['id', 'name']);
        
        return Inertia::render('parcels/show', [
            'parcel' => $parcel,
            'statuses' => $statuses,
            'availableCouriers' => $availableCouriers,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Parcel $parcel)
    {
        $parcel->load(['courier', 'customer', 'history' => function($query) {
            $query->with('user')->latest()->take(10);
        }]);
        
        $statuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'cancelled', 'returned'];
        $couriers = User::where('role', 'courier')->select('id', 'name')->get();
        $customers = Customer::select('id', 'name', 'address', 'phone_number')->get();
        
        return Inertia::render('parcels/edit', [
            'parcel' => $parcel,
            'statuses' => $statuses,
            'couriers' => $couriers,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Parcel $parcel)
    {
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
            'customer_id' => 'nullable|exists:customers,id', // Customer ID
            'history_note' => 'nullable|string|max:255', // Note for status change history
        ]);
        
        // Extract history note and remove it from validated data
        $historyNote = $validated['history_note'] ?? null;
        unset($validated['history_note']);
        
        // Check if status has changed
        $oldStatus = $parcel->status;
        $newStatus = $validated['status'];
        $statusChanged = $oldStatus !== $newStatus;
        
        // Update the parcel
        $parcel->update($validated);
        
        // Create history record if status changed
        if ($statusChanged) {
            $parcel->history()->create([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'user_id' => auth()->id(),
                'notes' => $historyNote,
            ]);
        }
        
        return redirect()->route('parcels.show', $parcel->id)
            ->with('success', 'Parcel updated successfully.');
    }
    
    /**
     * Update only the status of the parcel.
     */
    public function updateStatus(Request $request, Parcel $parcel)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'cancelled', 'returned'])],
            'history_note' => 'nullable|string|max:255',
        ]);
        
        // Check if status has changed
        $oldStatus = $parcel->status;
        $newStatus = $validated['status'];
        $statusChanged = $oldStatus !== $newStatus;
        
        if ($statusChanged) {
            // Update the parcel status
            $parcel->status = $newStatus;
            $parcel->save();
            
            // Create history record
            $parcel->history()->create([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'user_id' => auth()->id(),
                'notes' => $validated['history_note'] ?? null,
            ]);
            
            return redirect()->route('parcels.show', $parcel->id)
                ->with('success', 'Parcel status updated successfully.');
        }
        
        return redirect()->route('parcels.show', $parcel->id)
            ->with('info', 'Status unchanged.');
    }
    
    /**
     * Assign or change courier for a parcel
     */
    public function assignCourier(Request $request, Parcel $parcel)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'string', function ($attribute, $value, $fail) {
                if ($value !== 'none' && !User::where('id', $value)->exists()) {
                    $fail('The selected courier is invalid.');
                }
            }],
        ]);
        
        $oldCourierId = $parcel->user_id;
        $newCourierId = ($validated['user_id'] === 'none') ? null : $validated['user_id'];
        $courierChanged = $oldCourierId !== $newCourierId;
        
        if ($courierChanged) {
            $parcel->update(['user_id' => $newCourierId]);
            
            // Add a history entry for courier assignment/change
            $oldCourierName = $oldCourierId ? User::find($oldCourierId)->name : 'None';
            $newCourierName = $newCourierId ? User::find($newCourierId)->name : 'None';
            
            $parcel->history()->create([
                'old_status' => $parcel->status, // Status didn't change
                'new_status' => $parcel->status,
                'user_id' => auth()->id(),
                'notes' => "Courier changed from {$oldCourierName} to {$newCourierName}",
            ]);
        }
        
        return redirect()->back()->with($courierChanged ? 'success' : 'info', $courierChanged ? 'Courier assigned successfully.' : 'No courier change detected.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Parcel $parcel): RedirectResponse
    {
        // Optional: Add authorization checks here if needed
        // For example, if you have policies:
        // $this->authorize('delete', $parcel);

        $parcel->delete();

        return redirect()->route('parcels.index')->with('success', 'Parcel deleted successfully.');
        // Alternatively, using the Redirect facade:
        // return \Illuminate\Support\Facades\Redirect::route('parcels.index')->with('success', 'Parcel deleted successfully.');
    }

    /**
     * Generate a PDF label for the specified parcel.
     */
    public function generateLabel(Parcel $parcel)
    {


        // Eager load any relationships if needed for the label, though parcel object should have most direct attributes
        // $parcel->load(['sender', 'recipient']); // Example, if sender/recipient were complex objects

        // Generate barcode
        // Parameters for getBarcodePNG: value, type, widthFactor, height, color (array [r,g,b])
        // Using C128 which is a common standard for labels.
        $barcodeImage = DNS1DFacade::getBarcodePNG($parcel->tracking_number, 'C128', 2, 60, [0, 0, 0]);

        // $barcodeImage is already base64 encoded by DNS1DFacade::getBarcodePNG()
        // No need for base64_encode() here.

        $data = [
            'parcel' => $parcel,
            'barcode' => $barcodeImage, // Pass the already base64 encoded string directly
        ];

        $pdf = Pdf::loadView('parcels.label', $data);

        // Use $pdf->output() to get the raw PDF content
        $pdfOutput = $pdf->output();

        // Return a response with explicit headers
        return response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="label-' . $parcel->tracking_number . '.pdf"',
        ]);
    }


    /**
     * Provide public tracking information for a parcel.
     * Redirects to parcel show page for authenticated users or returns JSON for API requests.
     *
     * @param  string  $tracking_number
     * @return \Illuminate\Http\Response
     */
    public function trackPublic($tracking_number)
    {
        $parcel = \App\Models\Parcel::where('tracking_number', $tracking_number)->first();

        if (!$parcel) {
            if (request()->expectsJson()) {
                return response()->json(['message' => 'Parcel not found.'], 404);
            }
            return redirect()->route('home')->with('error', 'Parcel not found.');
        }
        
        // If this is a barcode scanner request or browser request, redirect to the parcel page
        if (request()->header('X-Inertia') || !request()->expectsJson()) {
            // For authenticated users, redirect to the parcel show page
            if (auth()->check()) {
                return redirect()->route('parcels.show', $parcel->id);
            }
            
            // For unauthenticated users, redirect to login with a return URL
            return redirect()->route('login')
                ->with('message', 'Please log in to view parcel details.')
                ->with('intended_url', route('parcels.show', $parcel->id));
        }
        
        // For API requests, return JSON response
        return response()->json([
            'tracking_number' => $parcel->tracking_number,
            'status' => $parcel->status,
            'weight' => $parcel->weight,
            'dimensions' => $parcel->dimensions,
            'created_at' => $parcel->created_at->toIso8601String(),
            'updated_at' => $parcel->updated_at->toIso8601String(),
        ]);
    }
}
