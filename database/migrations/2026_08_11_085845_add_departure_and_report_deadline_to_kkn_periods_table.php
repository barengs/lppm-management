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
        Schema::table('kkn_periods', function (Blueprint $table) {
            $table->date('departure_date')->nullable()->after('end_date');
            $table->date('report_deadline')->nullable()->after('departure_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_periods', function (Blueprint $table) {
            $table->dropColumn(['departure_date', 'report_deadline']);
        });
    }
};
