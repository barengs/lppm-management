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
        Schema::table('pages', function (Blueprint $table) {
            if (!Schema::hasColumn('pages', 'slug')) {
                $table->string('slug')->nullable()->after('title');
            }
            if (!Schema::hasColumn('pages', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('content');
            }
            if (!Schema::hasColumn('pages', 'meta_title')) {
                $table->string('meta_title')->nullable()->after('is_published');
            }
            if (!Schema::hasColumn('pages', 'meta_description')) {
                $table->text('meta_description')->nullable()->after('meta_title');
            }
        });

        // Populate empty slugs
        $pages = \Illuminate\Support\Facades\DB::table('pages')->whereNull('slug')->orWhere('slug', '')->get();
        foreach ($pages as $page) {
            $slug = \Illuminate\Support\Str::slug($page->title);
            // Ensure uniqueness manually just in case
            $originalSlug = $slug;
            $count = 1;
            while (\Illuminate\Support\Facades\DB::table('pages')->where('slug', $slug)->where('id', '!=', $page->id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            
            \Illuminate\Support\Facades\DB::table('pages')
                ->where('id', $page->id)
                ->update(['slug' => $slug]);
        }

        // Add unique constraint if not exists (try/catch or check)
        try {
            Schema::table('pages', function (Blueprint $table) {
                $table->unique('slug');
            });
        } catch (\Exception $e) {
            // Index likely exists
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            // Simplify down: just drop columns if they exist
             if (Schema::hasColumn('pages', 'slug')) $table->dropColumn('slug');
             if (Schema::hasColumn('pages', 'is_published')) $table->dropColumn('is_published');
             if (Schema::hasColumn('pages', 'meta_title')) $table->dropColumn('meta_title');
             if (Schema::hasColumn('pages', 'meta_description')) $table->dropColumn('meta_description');
        });
    }
};
