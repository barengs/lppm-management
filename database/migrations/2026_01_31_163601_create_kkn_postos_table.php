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
        Schema::create('kkn_postos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('kkn_location_id')->constrained()->onDelete('cascade');
            $table->foreignId('fiscal_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('dpl_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['draft', 'active', 'completed'])->default('draft');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Unique constraint: one posto per location per fiscal year
            $table->unique(['kkn_location_id', 'fiscal_year_id'], 'unique_location_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_postos');
    }
};
