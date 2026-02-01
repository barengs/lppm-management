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
            $table->foreignId('kkn_posto_id')->nullable()->after('kkn_location_id')
                  ->constrained('kkn_postos')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->dropForeign(['kkn_posto_id']);
            $table->dropColumn('kkn_posto_id');
        });
    }
};
