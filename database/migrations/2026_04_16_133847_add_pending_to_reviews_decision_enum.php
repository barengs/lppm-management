<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Stage 1: Change to string and keep it nullable to allow data copy in SQLite
        // This effectively removes the old CHECK constraint
        Schema::table('reviews', function (Blueprint $table) {
            $table->string('decision')->nullable()->change();
        });

        // Stage 2: Now that constraints are relaxed, update NULL values to 'pending'
        DB::table('reviews')->whereNull('decision')->update(['decision' => 'pending']);

        // Stage 3: Finally set the default value and make it NOT NULL
        Schema::table('reviews', function (Blueprint $table) {
            $table->string('decision')->default('pending')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->enum('decision', ['accepted', 'rejected', 'revision'])->nullable()->change();
        });
    }
};
