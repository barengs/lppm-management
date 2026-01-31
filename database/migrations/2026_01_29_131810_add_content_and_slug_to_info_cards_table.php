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
        Schema::table('info_cards', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('title');
            $table->longText('content')->nullable()->after('description');
            $table->string('image')->nullable()->after('icon'); // Header image for detail page
        });
    }

    public function down(): void
    {
        Schema::table('info_cards', function (Blueprint $table) {
            $table->dropColumn(['slug', 'content', 'image']);
        });
    }
};
