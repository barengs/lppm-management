<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pkm_master_data', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->constrained('pkm_master_data')->onDelete('cascade');
            $table->json('metadata')->nullable(); // For storing percentage caps or extra info
        });
    }

    public function down(): void
    {
        Schema::table('pkm_master_data', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'metadata']);
        });
    }
};
