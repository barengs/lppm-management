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
        Schema::table('kkn_locations', function (Blueprint $table) {
            $table->enum('location_type', ['domestic', 'international'])->default('domestic')->after('description');
            $table->string('country')->nullable()->after('location_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_locations', function (Blueprint $table) {
            $table->dropColumn(['location_type', 'country']);
        });
    }
};
