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
        Schema::create('kkn_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('kkn_location_id')->constrained('kkn_locations')->onDelete('cascade');
            $table->foreignId('fiscal_year_id')->constrained('fiscal_years')->onDelete('cascade');
            $table->foreignId('dpl_id')->nullable()->constrained('users')->onDelete('set null'); // Dosen Pembimbing Lapangan
            $table->enum('status', ['registered', 'approved', 'rejected'])->default('registered');
            $table->text('notes')->nullable(); // Admin notes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_registrations');
    }
};
