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
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->enum('registration_type', ['reguler', 'program_khusus', 'santri'])
                  ->default('reguler')
                  ->after('fiscal_year_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->dropColumn('registration_type');
        });
    }
};
