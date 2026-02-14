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
        Schema::create('registration_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_period_id')->constrained('kkn_periods')->onDelete('cascade');
            $table->string('name'); // e.g. "Gelombang 1"
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_periods');
    }
};
