<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pkm_proposals', function (Blueprint $table) {
            // Substansi (Section 9 BIMA)
            $table->longText('substance_summary')->nullable()->after('summary');
            $table->string('keywords')->nullable()->after('substance_summary');
        });
    }

    public function down(): void
    {
        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->dropColumn(['substance_summary', 'keywords']);
        });
    }
};
