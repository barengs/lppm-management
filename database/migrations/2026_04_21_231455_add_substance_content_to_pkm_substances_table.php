<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pkm_substances', function (Blueprint $table) {
            $table->longText('abstract')->nullable()->after('strategic_fields');
            $table->string('keywords', 1000)->nullable()->after('abstract');
            $table->longText('background')->nullable()->after('keywords');
            $table->longText('methodology')->nullable()->after('background');
            $table->longText('objectives')->nullable()->after('methodology');
            $table->longText('references')->nullable()->after('objectives');
        });
    }

    public function down(): void
    {
        Schema::table('pkm_substances', function (Blueprint $table) {
            $table->dropColumn(['abstract', 'keywords', 'background', 'methodology', 'objectives', 'references']);
        });
    }
};
