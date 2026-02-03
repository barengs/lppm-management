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
        Schema::create('kkn_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_registration_id')->constrained('kkn_registrations')->onDelete('cascade');
            $table->foreignId('graded_by')->constrained('users')->onDelete('cascade'); // Staff who graded
            $table->double('numeric_score')->default(0);
            $table->string('grade', 5)->nullable(); // A, B+, B, C, D, E
            $table->string('certificate_number')->nullable()->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_grades');
    }
};
