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
        // 1. Profiles table removed (split into mahasiswa_profiles and dosen_profiles)

        // 2. Posts (News, Announcements)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->enum('category', ['news', 'announcement', 'policy']);
            $table->string('thumbnail')->nullable();
            $table->boolean('is_published')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // 3. Documents (Repository)
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('file_path');
            $table->enum('type', ['guide', 'template', 'sk']);
            $table->integer('download_count')->default(0);
            $table->timestamps();
        });

        // 4. Pages (Static Content)
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->json('content'); // Rich text/JSON content
            $table->string('type')->index(); // Changed from enum to string for flexibility
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('posts');
        // Schema::dropIfExists('profiles'); // Removed
    }
};
