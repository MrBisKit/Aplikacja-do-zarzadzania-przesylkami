<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParcelHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'parcel_id',
        'old_status',
        'new_status',
        'user_id',
        'notes'
    ];

    /**
     * Get the parcel that owns this history record.
     */
    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }

    /**
     * Get the user who made this status change.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
