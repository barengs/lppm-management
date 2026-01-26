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
        // 1. Profiles
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('prodi')->nullable();
            $table->string('fakultas')->nullable();
            $table->string('scopus_id')->nullable();
            $table->string('sinta_id')->nullable();
            $table->string('google_scholar_id')->nullable();
            $table->timestamps();
        });

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
            $table->enum('type', ['about', 'history', 'vision']);
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
        Schema::dropIfExists('profiles');
    }
};
