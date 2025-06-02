<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\User;
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
     *
     * @param  string  $tracking_number
     * @return \Illuminate\Http\JsonResponse
     */
    public function trackPublic($tracking_number)
    {
        $parcel = \App\Models\Parcel::where('tracking_number', $tracking_number)->first();

        if (!$parcel) {
            return response()->json(['message' => 'Parcel not found.'], 404);
        }

        return response()->json([
            'tracking_number' => $parcel->tracking_number,
            'status' => $parcel->status,
            'weight' => $parcel->weight,
            'dimensions' => $parcel->dimensions, // Assuming dimensions is a string like 'LxWxH'
            'created_at' => $parcel->created_at->toIso8601String(),
            'updated_at' => $parcel->updated_at->toIso8601String(),
        ]);
    }
}
