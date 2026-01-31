<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->string('slug')->unique()->after('title')->nullable(); // Nullable first then fill it
            $table->boolean('is_published')->default(true)->after('content');
            $table->string('meta_title')->nullable()->after('is_published');
            $table->text('meta_description')->nullable()->after('meta_title');
        });

        // Generate slugs for existing pages if any
        $pages = \DB::table('pages')->get();
        foreach ($pages as $page) {
            $slug = \Illuminate\Support\Str::slug($page->title);
            if ($page->type) {
                $slug = $page->type; // Preserve existing type-based lookup as default slug
            }
            \DB::table('pages')->where('id', $page->id)->update(['slug' => $slug]);
        }
        
        // Make slug required (if we could, but sqlite constraints might be tricky in one go, usually fine)
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['slug', 'is_published', 'meta_title', 'meta_description']);
        });
    }
};
