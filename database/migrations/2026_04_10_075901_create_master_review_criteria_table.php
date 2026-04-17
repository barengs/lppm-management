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
        Schema::create('master_review_criteria', function (Blueprint $table) {
            $table->id();
            $table->string('criteria_name');
            $table->text('description')->nullable();
            $table->integer('weight'); // Weight in percentage (e.g., 20)
            $table->string('type')->default('research'); // research or service
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_review_criteria');
    }
};
