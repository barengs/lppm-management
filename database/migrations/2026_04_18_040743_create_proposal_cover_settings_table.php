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
        Schema::create('proposal_cover_settings', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique(); // 'penelitian' or 'pkm'
            $table->string('title_top')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('title_bottom_prodi')->nullable();
            $table->string('title_bottom_faculty')->nullable();
            $table->string('title_bottom_university')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_cover_settings');
    }
};
