<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->string('sender_name');
            $table->text('sender_address');
            $table->string('recipient_name');
            $table->text('recipient_address');
            $table->string('recipient_phone')->nullable();
            $table->string('status')->default('pending'); // e.g., pending, in_transit, out_for_delivery, delivered, failed_attempt, cancelled, returned
            $table->decimal('weight', 8, 2)->nullable(); // Weight in kg, for example
            $table->string('dimensions')->nullable(); // e.g., "30x20x10" (L x W x H in cm)
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Courier assigned
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null'); // Assuming customers are also in the users table for now
            $table->timestamps();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parcels');
    }
};
