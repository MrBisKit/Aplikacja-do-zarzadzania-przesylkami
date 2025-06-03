<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Parcel extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_number',
        'sender_name',
        'sender_address',
        'recipient_name',
        'recipient_address',
        'recipient_phone',
        'status',
        'weight',
        'dimensions',
        'notes',
        'user_id', // Courier ID
        'customer_id',
    ];

    /**
     * Get the courier (user) assigned to this parcel.
     */
    public function courier()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the customer associated with this parcel.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Get the history records for this parcel.
     */
    public function history()
    {
        return $this->hasMany(ParcelHistory::class)->orderBy('created_at', 'desc');
    }
}
